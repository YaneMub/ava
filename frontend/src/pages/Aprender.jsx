import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import VideoSena from '../components/VideoSena.jsx'
import BarraProgreso from '../components/BarraProgreso.jsx'

function Aprender() {
  const { slug, unitId, bloque } = useParams()
  const navigate = useNavigate()

  const [palabras, setPalabras] = useState([])
  const [indice, setIndice] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerContenido = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await fetch(
          `${import.meta.env.VITE_API_URL}/api/contenido?unitId=${unitId}&bloque=${bloque}&tipo=aprender`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const datos = await respuesta.json()
        setPalabras(datos)
      } catch (error) {
        console.error('Error al conectar con el backend:', error)
      } finally {
        setCargando(false)
      }
    }

    obtenerContenido()
  }, [unitId, bloque])

  const palabraActual = palabras[indice]

  const marcarYAvanzar = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/api/contenido/${palabraActual.id}/progreso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo: 'aprender', correcto: true }),
      })
    } catch (error) {
      console.error('Error al guardar el progreso:', error)
    }

    if (indice + 1 < palabras.length) {
      setIndice(indice + 1)
    } else {
      navigate(`/curso/${slug}`)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-fondo">
        <p className="text-textoSecundario">Cargando...</p>
      </div>
    )
  }

  const progreso = Math.round((indice / palabras.length) * 100)

  return (
    <div className="flex items-center justify-center h-screen bg-fondo">
      <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
        <BarraProgreso volverA={`/curso/${slug}`} progreso={progreso} />

        <div className="flex items-center gap-3 w-full">
          <span className="bg-lavanda text-white rounded-full w-10 h-10 flex items-center justify-center text-lg flex-shrink-0">🐙</span>
          <div className="bg-white rounded-2xl rounded-tl-none shadow-md p-3 flex-1">
            <p className="text-textoPrincipal font-bold text-sm">Mirá cómo se hace esta seña y memorizala</p>
          </div>
        </div>

        <VideoSena palabra={palabraActual.palabra} video={palabraActual.video_url} />

        <div className="bg-white rounded-2xl shadow-md p-4 w-full text-center">
          <p className="text-2xl font-bold text-textoPrincipal">{palabraActual.palabra}</p>
        </div>

        <button
          onClick={marcarYAvanzar}
          className="bg-lavanda text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 w-full"
        >
          {indice + 1 < palabras.length ? 'Siguiente' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}

export default Aprender
