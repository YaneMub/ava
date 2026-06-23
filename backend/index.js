import express from 'express'
import cors from 'cors'

const app = express();

app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ status: "ok" })
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});