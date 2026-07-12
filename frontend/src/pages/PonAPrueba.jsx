import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import VideoSena from '../components/VideoSena.jsx'
import BarraProgreso from '../components/BarraProgreso.jsx'
import FeedbackMessage from '../components/FeedbackMessage.jsx'

function mezclar(arreglo) {
  return [...arreglo].sort(() => Math.random() - 0.5)
}

function armarPreguntas(palabras) {
  // Interleaving: la pregunta N se arma cuando ya "entraron" las primeras
  // N+1 palabras, así las opciones (distractores) mezclan palabras viejas
  // con la nueva, en vez de mostrar todo el bloque de una.
  return palabras.map((palabraCorrecta, i) => {
    const pool = palabras.slice(0, i + 1)
    const opciones = mezclar(pool).slice(0, Math.min(4, pool.length))
    if (!opciones.includes(palabraCorrecta)) {
      opciones[Math.floor(Math.random() * opciones.length)] = palabraCorrecta
    }
    const direccion = Math.random() < 0.5 ? 'video-a-palabra' : 'palabra-a-video'
    return { palabraCorrecta, opciones: mezclar(opciones), direccion }
  })
}

function PonAPrueba() {
  const { slug, unitId, bloque } = useParams()
  const navigate = useNavigate()

  const [palabras, setPalabras] = useState([])
  const [indice, setIndice] = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerContenido = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await fetch(
          `${import.meta.env.VITE_API_URL}/api/contenido?unitId=${unitId}&bloque=${bloque}&tipo=reconocimiento`,
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

  const preguntas = useMemo(() => armarPreguntas(palabras), [palabras])
  const pregunta = preguntas[indice]

  const responder = async (opcion) => {
    if (seleccion) return
    setSeleccion(opcion)

    const correcto = opcion.id === pregunta.palabraCorrecta.id
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/api/contenido/${pregunta.palabraCorrecta.id}/progreso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo: 'reconocimiento', correcto }),
      })
    } catch (error) {
      console.error('Error al guardar el progreso:', error)
    }
  }

  const siguiente = () => {
    if (indice + 1 < preguntas.length) {
      setIndice(indice + 1)
      setSeleccion(null)
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

  const respuestaCorrecta = seleccion ? seleccion.id === pregunta.palabraCorrecta.id : null
  const progreso = Math.round((indice / preguntas.length) * 100)

  return (
    <div className="flex items-center justify-center h-screen bg-fondo">
      <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
        <BarraProgreso volverA={`/curso/${slug}`} progreso={progreso} />

        {pregunta.direccion === 'video-a-palabra' ? (
          <>
            <p className="text-textoPrincipal font-bold">¿Qué palabra es esta seña?</p>
            <VideoSena palabra={pregunta.palabraCorrecta.palabra} video={pregunta.palabraCorrecta.video_url} />
          </>
        ) : (
          <>
            <p className="text-textoPrincipal font-bold">¿Cuál es la seña de esta palabra?</p>
            <div className="bg-white rounded-2xl shadow-md p-4 w-full text-center">
              <p className="text-2xl font-bold text-textoPrincipal">{pregunta.palabraCorrecta.palabra}</p>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3 w-full">
          {pregunta.opciones.map((opcion) => {
            const esCorrecta = opcion.id === pregunta.palabraCorrecta.id
            const estaElegida = seleccion?.id === opcion.id
            let estilo = 'border-2 border-borde bg-white'
            if (seleccion && esCorrecta) estilo = 'border-2 border-exito bg-fondoExito'
            else if (seleccion && estaElegida) estilo = 'border-2 border-error bg-fondoError'

            return (
              <button
                key={opcion.id}
                onClick={() => responder(opcion)}
                disabled={Boolean(seleccion)}
                className={`rounded-lg p-3 font-bold text-textoPrincipal ${estilo}`}
              >
                {pregunta.direccion === 'video-a-palabra' ? (
                  opcion.palabra
                ) : (
                  <iframe
                    src={opcion.video_url}
                    title={opcion.palabra}
                    className="w-full h-20 rounded pointer-events-none"
                    allow="autoplay"
                  ></iframe>
                )}
              </button>
            )
          })}
        </div>

        {seleccion && <FeedbackMessage esCorrecto={respuestaCorrecta} />}

        {seleccion && (
          <button
            onClick={siguiente}
            className="bg-lavanda text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 w-full"
          >
            {indice + 1 < preguntas.length ? 'Siguiente' : 'Continuar'}
          </button>
        )}
      </div>
    </div>
  )
}

export default PonAPrueba
