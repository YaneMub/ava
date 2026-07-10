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

// El bloque de cada palabra se calcula solo por su posición (orden) dentro
// de la unidad — así no hace falta definir de antemano cuántos bloques tiene
// cada unidad. Cargar más palabras en "contenido" arma bloques nuevos solo.
const PALABRAS_POR_BLOQUE = 5;
const PALABRAS_REPASO_EN_PRODUCCION = 2;
const TIPOS_BLOQUE = ['aprender', 'reconocimiento', 'produccion'];

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

// Comentado de momento: la nivelación asigna un current_stage_id global al
// usuario (vía la tabla "stages"), pero eso no escala si cada curso futuro
// tiene su propio temario/niveles. Cuando se rediseñe para ser por-curso,
// se puede reactivar.
//
// app.post('/api/usuarios/nivelacion', verificarToken, async (req, res) => {
//   const { nivel } = req.body;
//
//   if (!['nada', 'poco', 'mucho'].includes(nivel)) {
//     return res.status(400).json({ error: 'Nivel inválido' });
//   }
//
//   const orden = nivel === 'mucho' ? 2 : 1;
//
//   try {
//     const stage = await pool.query('SELECT id FROM stages WHERE orden = $1', [orden]);
//     const stageId = stage.rows[0].id;
//
//     const resultado = await pool.query(
//       `UPDATE users SET current_stage_id = $1
//        WHERE id = $2
//        RETURNING id, nombre, email, tipo_usuario, perfil_tipo, current_stage_id`,
//       [stageId, req.usuarioId]
//     );
//
//     res.json({ usuario: resultado.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error al guardar la nivelación' });
//   }
// });

app.post('/api/cursos/:id/iniciar', verificarToken, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO cursos_usuario (usuario_id, curso_id)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, curso_id) DO NOTHING`,
      [req.usuarioId, req.params.id]
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar el curso' });
  }
});

app.get('/api/cursos', verificarToken, async (req, res) => {
  try {
    const cursos = await pool.query('SELECT * FROM cursos ORDER BY orden');
    const iniciados = await pool.query(
      'SELECT curso_id FROM cursos_usuario WHERE usuario_id = $1',
      [req.usuarioId]
    );
    const iniciadosIds = new Set(iniciados.rows.map((r) => r.curso_id));

    // Simplificado: por ahora hay un solo curso, así que todo lo que hay en
    // "contenido" cuenta como su temario. Cuando haya más de un curso, esto
    // necesita filtrar por curso_id (units todavía no está linkeada a cursos).
    const totalPalabras = await pool.query('SELECT COUNT(*) FROM contenido');
    const hechas = await pool.query(
      `SELECT COUNT(*) FROM user_contenido WHERE user_id = $1 AND completado = true AND tipo = ANY($2::text[])`,
      [req.usuarioId, TIPOS_BLOQUE]
    );
    const total = Number(totalPalabras.rows[0].count) * TIPOS_BLOQUE.length;
    const completadas = Number(hechas.rows[0].count);
    const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

    const misCursos = [];
    const disponibles = [];

    cursos.rows.forEach((curso) => {
      if (iniciadosIds.has(curso.id)) {
        misCursos.push({ ...curso, progreso });
      } else {
        disponibles.push(curso);
      }
    });

    res.json({ misCursos, disponibles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
});

app.get('/api/cursos/:slug', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM cursos WHERE slug = $1', [req.params.slug]);
    if (!resultado.rows[0]) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el curso' });
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

// Comentado: reemplazado por el guardado de progreso por palabra
// (POST /api/contenido/:id/progreso), ya que las actividades ahora se
// calculan a partir de "contenido" en vez de ser filas fijas por unidad.
//
// app.post('/api/progress', verificarToken, async (req, res) => {
//   const { activityId } = req.body;
//   ...
// });

// Devuelve TODAS las unidades, cada una con sus bloques calculados a partir
// de "contenido" (de a PALABRAS_POR_BLOQUE palabras), el estado de cada
// actividad (hecho/activo/bloqueado) según el progreso real del usuario en
// "user_contenido", y el repaso general de la unidad.
app.get('/api/units/progreso', verificarToken, async (req, res) => {
  try {
    const unidades = await pool.query('SELECT * FROM units ORDER BY orden');
    const resultado = [];
    let yaEncontroActual = false;

    for (const unidad of unidades.rows) {
      const contenido = await pool.query(
        'SELECT * FROM contenido WHERE unit_id = $1 ORDER BY orden',
        [unidad.id]
      );
      const idsContenido = contenido.rows.map((c) => c.id);

      const progresoRows = idsContenido.length
        ? await pool.query(
            `SELECT contenido_id, tipo FROM user_contenido
             WHERE user_id = $1 AND contenido_id = ANY($2::int[]) AND completado = true`,
            [req.usuarioId, idsContenido]
          )
        : { rows: [] };
      const hechos = new Set(progresoRows.rows.map((p) => `${p.contenido_id}-${p.tipo}`));

      // Agrupar el contenido en bloques de PALABRAS_POR_BLOQUE, en el orden
      // en que se cargaron las palabras.
      const bloquesPalabras = [];
      contenido.rows.forEach((palabra, indice) => {
        const numeroBloque = Math.floor(indice / PALABRAS_POR_BLOQUE);
        if (!bloquesPalabras[numeroBloque]) bloquesPalabras[numeroBloque] = [];
        bloquesPalabras[numeroBloque].push(palabra);
      });

      const bloquesInfo = bloquesPalabras.map((palabras, i) => {
        const ids = palabras.map((p) => p.id);
        const actividades = TIPOS_BLOQUE.map((tipo) => ({
          tipo,
          hecha: ids.every((id) => hechos.has(`${id}-${tipo}`)),
        }));
        return { numero: i + 1, cantidadPalabras: palabras.length, actividades, completo: actividades.every((a) => a.hecha) };
      });

      const todosLosBloquesCompletos = bloquesInfo.length > 0 && bloquesInfo.every((b) => b.completo);
      const repasoHecho = todosLosBloquesCompletos && idsContenido.every((id) => hechos.has(`${id}-repaso`));

      let estadoUnidad;
      if (contenido.rows.length === 0) {
        estadoUnidad = 'sin-contenido'; // todavía no se cargaron palabras acá
      } else if (repasoHecho) {
        estadoUnidad = 'completada';
      } else if (!yaEncontroActual) {
        estadoUnidad = 'actual';
        yaEncontroActual = true;
      } else {
        estadoUnidad = 'bloqueada';
      }

      let yaHuboActiva = false;
      const bloques = bloquesInfo.map((bloque) => {
        const actividadesConEstado = bloque.actividades.map((a) => {
          if (estadoUnidad === 'completada') return { tipo: a.tipo, estado: 'hecho' };
          if (estadoUnidad !== 'actual') return { tipo: a.tipo, estado: 'bloqueado' };
          if (a.hecha) return { tipo: a.tipo, estado: 'hecho' };
          if (!yaHuboActiva) {
            yaHuboActiva = true;
            return { tipo: a.tipo, estado: 'activo' };
          }
          return { tipo: a.tipo, estado: 'bloqueado' };
        });
        return { numero: bloque.numero, cantidadPalabras: bloque.cantidadPalabras, actividades: actividadesConEstado };
      });

      let estadoRepaso;
      if (estadoUnidad === 'completada') estadoRepaso = 'hecho';
      else if (estadoUnidad === 'actual' && todosLosBloquesCompletos) estadoRepaso = 'activo';
      else estadoRepaso = 'bloqueado';

      resultado.push({ unidad, estadoUnidad, bloques, repaso: { estado: estadoRepaso } });
    }

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al calcular el progreso' });
  }
});

// Devuelve las palabras a practicar para una actividad puntual.
// - aprender / reconocimiento: las palabras nuevas de ese bloque.
// - produccion: las palabras del bloque + un repaso de bloques anteriores
//   (las que menos se practicaron, no una lista fija).
// - repaso: todas las palabras de la unidad, priorizando las peor practicadas.
app.get('/api/contenido', verificarToken, async (req, res) => {
  const unitId = Number(req.query.unitId);
  const bloque = req.query.bloque ? Number(req.query.bloque) : null;
  const tipo = req.query.tipo;

  if (!unitId || !tipo) {
    return res.status(400).json({ error: 'Faltan parámetros (unitId, tipo)' });
  }

  try {
    const contenido = await pool.query('SELECT * FROM contenido WHERE unit_id = $1 ORDER BY orden', [unitId]);

    const vecesPracticadaPorId = async (ids) => {
      if (!ids.length) return new Map();
      const practica = await pool.query(
        `SELECT contenido_id, veces_practicada FROM user_contenido
         WHERE user_id = $1 AND contenido_id = ANY($2::int[]) AND tipo = 'produccion'`,
        [req.usuarioId, ids]
      );
      return new Map(practica.rows.map((p) => [p.contenido_id, p.veces_practicada]));
    };

    if (tipo === 'repaso') {
      const ids = contenido.rows.map((c) => c.id);
      const veces = await vecesPracticadaPorId(ids);
      const ordenado = [...contenido.rows].sort((a, b) => (veces.get(a.id) || 0) - (veces.get(b.id) || 0));
      return res.json(ordenado);
    }

    if (!bloque) {
      return res.status(400).json({ error: 'Falta el bloque' });
    }

    const inicio = (bloque - 1) * PALABRAS_POR_BLOQUE;
    const palabrasBloque = contenido.rows.slice(inicio, inicio + PALABRAS_POR_BLOQUE);

    if (tipo !== 'produccion') {
      return res.json(palabrasBloque);
    }

    const palabrasAnteriores = contenido.rows.slice(0, inicio);
    let palabrasRepaso = [];
    if (palabrasAnteriores.length > 0) {
      const veces = await vecesPracticadaPorId(palabrasAnteriores.map((p) => p.id));
      palabrasRepaso = [...palabrasAnteriores]
        .sort((a, b) => (veces.get(a.id) || 0) - (veces.get(b.id) || 0))
        .slice(0, PALABRAS_REPASO_EN_PRODUCCION);
    }

    res.json([...palabrasBloque, ...palabrasRepaso]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el contenido' });
  }
});

app.post('/api/contenido/:id/progreso', verificarToken, async (req, res) => {
  const { tipo, correcto } = req.body;

  if (!['aprender', 'reconocimiento', 'produccion', 'repaso'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  try {
    await pool.query(
      `INSERT INTO user_contenido (user_id, contenido_id, tipo, completado, veces_practicada, ultima_practica)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (user_id, contenido_id, tipo)
       DO UPDATE SET
         completado = user_contenido.completado OR EXCLUDED.completado,
         veces_practicada = user_contenido.veces_practicada + 1,
         ultima_practica = NOW()`,
      [req.usuarioId, req.params.id, tipo, correcto !== false]
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

