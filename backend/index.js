import express from 'express'
import cors from 'cors'
import 'dotenv/config'; // Esto lee el archivo .env al toque
import pg from 'pg';


const { Pool } = pg;

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
});

const app = express();

app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ status: "ok" })
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

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