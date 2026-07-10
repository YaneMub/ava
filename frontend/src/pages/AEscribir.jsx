import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import VideoSena from '../components/VideoSena.jsx'
import BarraProgreso from '../components/BarraProgreso.jsx'
import PracticeInput from '../components/PracticeInput.jsx'
import FeedbackMessage from '../components/FeedbackMessage.jsx'

function mezclar(arreglo) {
  return [...arreglo].sort(() => Math.random() - 0.5)
}

function AEscribir() {
  const { slug, unitId, bloque } = useParams()
  const navigate = useNavigate()

  const [palabrasSinMezclar, setPalabrasSinMezclar] = useState([])
  const [indice, setIndice] = useState(0)
  const [esCorrecto, setEsCorrecto] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerContenido = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await fetch(
          `${import.meta.env.VITE_API_URL}/api/contenido?unitId=${unitId}&bloque=${bloque}&tipo=produccion`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const datos = await respuesta.json()
        setPalabrasSinMezclar(datos)
      } catch (error) {
        console.error('Error al conectar con el backend:', error)
      } finally {
        setCargando(false)
      }
    }

    obtenerContenido()
  }, [unitId, bloque])

  // Se mezcla una sola vez (no en cada render) para que las palabras nuevas
  // y las de repaso queden intercaladas, no todas las nuevas primero.
  const palabras = useMemo(() => mezclar(palabrasSinMezclar), [palabrasSinMezclar])
  const palabraActual = palabras[indice]

  const manejarVerificacion = async (resultado) => {
    setEsCorrecto(resultado)
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/api/contenido/${palabraActual.id}/progreso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo: 'produccion', correcto: resultado }),
      })
    } catch (error) {
      console.error('Error al guardar el progreso:', error)
    }
  }

  const siguiente = () => {
    if (indice + 1 < palabras.length) {
      setIndice(indice + 1)
      setEsCorrecto(null)
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
        <p className="text-textoPrincipal font-bold">Escribí lo que ves</p>
        <VideoSena palabra={palabraActual.palabra} video={palabraActual.video_url} mostrarBadge={false} />
        <FeedbackMessage esCorrecto={esCorrecto} palabraCorrecta={palabraActual.palabra} />
        <PracticeInput
          key={palabraActual.id}
          palabraCorrecta={palabraActual.palabra}
          onVerificar={manejarVerificacion}
          deshabilitado={esCorrecto !== null}
        />
        {esCorrecto !== null && (
          <button
            onClick={siguiente}
            className="bg-lavanda text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 w-full"
          >
            {indice + 1 < palabras.length ? 'Siguiente' : 'Continuar'}
          </button>
        )}
      </div>
    </div>
  )
}

export default AEscribir
