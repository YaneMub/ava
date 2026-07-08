import express from 'express'
import cors from 'cors'
// Si no estamos en producción, leemos el archivo .env local
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
} // Esto lee el archivo .env al toque
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const { Pool } = pg;

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: "ok" })
})

const PORT = process.env.PORT || 3001;

// El oyente tiene el español como L1 y aprende LSA como L2 ("externo").
// El sordo/hipoacúsico tiene la LSA como L1 y aprende español como L2 ("nativo").
function calcularPerfilTipo(tipoUsuario) {
  return tipoUsuario === 'oyente' ? 'externo' : 'nativo';
}

function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
}

app.get('/api/words', async (req, res) => {
  try {
    // Le pedimos al pool que ejecute una consulta SQL clásica
    const resultado = await pool.query('SELECT * FROM words');
    
    // Las filas reales de la tabla viven dentro de .rows
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { nombre, email, password, tipoUsuario } = req.body;

  if (!nombre || !email || !password || !tipoUsuario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const perfilTipo = calcularPerfilTipo(tipoUsuario);

    const resultado = await pool.query(
      `INSERT INTO users (nombre, email, password_hash, tipo_usuario, perfil_tipo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, tipo_usuario, perfil_tipo, current_stage_id`,
      [nombre, email, passwordHash, tipoUsuario, perfilTipo]
    );

    const usuario = resultado.rows[0];
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, usuario });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        perfil_tipo: usuario.perfil_tipo,
        current_stage_id: usuario.current_stage_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.post('/api/usuarios/nivelacion', verificarToken, async (req, res) => {
  const { nivel } = req.body;

  if (!['nada', 'poco', 'mucho'].includes(nivel)) {
    return res.status(400).json({ error: 'Nivel inválido' });
  }

  const orden = nivel === 'mucho' ? 2 : 1;

  try {
    const stage = await pool.query('SELECT id FROM stages WHERE orden = $1', [orden]);
    const stageId = stage.rows[0].id;

    const resultado = await pool.query(
      `UPDATE users SET current_stage_id = $1
       WHERE id = $2
       RETURNING id, nombre, email, tipo_usuario, perfil_tipo, current_stage_id`,
      [stageId, req.usuarioId]
    );

    res.json({ usuario: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar la nivelación' });
  }
});

app.get('/api/units', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id, stage_id, nombre, descripcion, orden FROM units ORDER BY orden');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las unidades' });
  }
});

// Calcula sola cuál es la unidad "activa" del usuario: la primera unidad
// (en orden) que todavía no tiene todas sus actividades marcadas como hechas.
app.get('/api/units/actual', verificarToken, async (req, res) => {
  try {
    const unidades = await pool.query('SELECT * FROM units ORDER BY orden');

    for (const unidad of unidades.rows) {
      const actividades = await pool.query(
        'SELECT * FROM activities WHERE unit_id = $1 ORDER BY orden',
        [unidad.id]
      );

      const idsActividades = actividades.rows.map((a) => a.id);
      const progreso = await pool.query(
        'SELECT activity_id FROM user_progress WHERE user_id = $1 AND activity_id = ANY($2::int[])',
        [req.usuarioId, idsActividades]
      );
      const hechasIds = new Set(progreso.rows.map((p) => p.activity_id));

      const todasHechas = actividades.rows.every((a) => hechasIds.has(a.id));

      if (!todasHechas) {
        let yaHuboActiva = false;
        const actividadesConEstado = actividades.rows.map((a) => {
          if (hechasIds.has(a.id)) return { ...a, estado: 'hecho' };
          if (!yaHuboActiva) {
            yaHuboActiva = true;
            return { ...a, estado: 'activo' };
          }
          return { ...a, estado: 'bloqueado' };
        });

        return res.json({ unidad, actividades: actividadesConEstado, completado: false });
      }
    }

    // El usuario completó todas las unidades disponibles.
    const ultimaUnidad = unidades.rows[unidades.rows.length - 1];
    const actividades = await pool.query(
      'SELECT * FROM activities WHERE unit_id = $1 ORDER BY orden',
      [ultimaUnidad.id]
    );
    res.json({
      unidad: ultimaUnidad,
      actividades: actividades.rows.map((a) => ({ ...a, estado: 'hecho' })),
      completado: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular el progreso' });
  }
});

app.post('/api/progress', verificarToken, async (req, res) => {
  const { activityId } = req.body;

  if (!activityId) {
    return res.status(400).json({ error: 'Falta activityId' });
  }

  try {
    await pool.query(
      `INSERT INTO user_progress (user_id, activity_id, estado)
       VALUES ($1, $2, 'hecho')
       ON CONFLICT (user_id, activity_id) DO NOTHING`,
      [req.usuarioId, activityId]
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar el progreso' });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

