import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import VideoSena from '../components/VideoSena.jsx'
import BarraProgreso from '../components/BarraProgreso.jsx'
import PracticeInput from '../components/PracticeInput.jsx'
import FeedbackMessage from '../components/FeedbackMessage.jsx'

function mezclar(arreglo) {
  return [...arreglo].sort(() => Math.random() - 0.5)
}

function armarOpciones(palabraCorrecta, todas) {
  const otras = mezclar(todas.filter((p) => p.id !== palabraCorrecta.id)).slice(0, 3)
  return mezclar([palabraCorrecta, ...otras])
}

function Repaso() {
  const { slug, unitId } = useParams()
  const navigate = useNavigate()

  const [palabras, setPalabras] = useState([])
  const [indice, setIndice] = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [esCorrecto, setEsCorrecto] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerContenido = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await fetch(
          `${import.meta.env.VITE_API_URL}/api/contenido?unitId=${unitId}&tipo=repaso`,
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
  }, [unitId])

  const palabraActual = palabras[indice]
  // Alterna entre pregunta de elegir (par) y de escribir (impar), para que
  // el repaso general no se sienta como una sola actividad larga y monótona.
  const esPreguntaDeElegir = indice % 2 === 0
  const opciones = useMemo(() => {
    if (!palabraActual || !esPreguntaDeElegir) return []
    return armarOpciones(palabraActual, palabras)
  }, [palabraActual, esPreguntaDeElegir, palabras])

  const guardarProgreso = async (correcto) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/api/contenido/${palabraActual.id}/progreso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo: 'repaso', correcto }),
      })
    } catch (error) {
      console.error('Error al guardar el progreso:', error)
    }
  }

  const responderOpcion = (opcion) => {
    if (seleccion) return
    setSeleccion(opcion)
    guardarProgreso(opcion.id === palabraActual.id)
  }

  const manejarVerificacionEscritura = (resultado) => {
    setEsCorrecto(resultado)
    guardarProgreso(resultado)
  }

  const siguiente = () => {
    if (indice + 1 < palabras.length) {
      setIndice(indice + 1)
      setSeleccion(null)
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

        <VideoSena palabra={palabraActual.palabra} video={palabraActual.video_url} mostrarBadge={false} />

        {esPreguntaDeElegir ? (
          <>
            <p className="text-textoPrincipal font-bold">¿Qué palabra es esta seña?</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              {opciones.map((opcion) => {
                const esCorrecta = opcion.id === palabraActual.id
                const estaElegida = seleccion?.id === opcion.id
                let estilo = 'border-2 border-borde bg-white'
                if (seleccion && esCorrecta) estilo = 'border-2 border-exito bg-fondoExito'
                else if (seleccion && estaElegida) estilo = 'border-2 border-error bg-fondoError'

                return (
                  <button
                    key={opcion.id}
                    onClick={() => responderOpcion(opcion)}
                    disabled={Boolean(seleccion)}
                    className={`rounded-lg p-4 font-bold text-textoPrincipal ${estilo}`}
                  >
                    {opcion.palabra}
                  </button>
                )
              })}
            </div>
            {seleccion && (
              <button onClick={siguiente} className="bg-lavanda text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 w-full">
                {indice + 1 < palabras.length ? 'Siguiente' : 'Continuar'}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-textoPrincipal font-bold">Escribí lo que ves</p>
            <FeedbackMessage esCorrecto={esCorrecto} palabraCorrecta={palabraActual.palabra} />
            <PracticeInput
              key={palabraActual.id}
              palabraCorrecta={palabraActual.palabra}
              onVerificar={manejarVerificacionEscritura}
              deshabilitado={esCorrecto !== null}
            />
            {esCorrecto !== null && (
              <button onClick={siguiente} className="bg-lavanda text-white font-bold py-3 rounded-lg text-xl hover:opacity-90 w-full">
                {indice + 1 < palabras.length ? 'Siguiente' : 'Continuar'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Repaso
