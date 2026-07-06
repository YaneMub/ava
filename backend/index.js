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

    const resultado = await pool.query(
      `INSERT INTO users (nombre, email, password_hash, tipo_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, tipo_usuario`,
      [nombre, email, passwordHash, tipoUsuario]
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
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, tipo_usuario: usuario.tipo_usuario },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

