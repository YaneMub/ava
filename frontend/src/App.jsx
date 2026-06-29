import {useState, useEffect} from 'react'
import WordCard from './components/WordCard.jsx'
import PracticeInput from './components/PracticeInput.jsx'
import FeedbackMessage from './components/FeedbackMessage.jsx'


function App() {
  const [pantalla, setPantalla] = useState('practica') // 'practica' | 'transición' | 'finalizado'
  const [todasLasPalabras, setTodasLasPalabras] = useState([])
  const [cola, setCola] = useState([])
  const [cargando, setCargando] = useState(true)
  const [indice, setIndice] = useState(0)
  const [erroresRonda, setErroresRonda] = useState([])
  const [esCorrecto, setEsCorrecto] = useState(null)

  useEffect(() => {
    const obtenerPalabras = async () => {
      try {
        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/words`)
        const datos = await respuesta.json()
        setTodasLasPalabras(datos)
        setCola(datos)
      } catch (error) {
        console.error('Error al conectar con el backend:', error)
      } finally {
        setCargando(false)
      }
    }

    obtenerPalabras()
  }, [])

  const palabraActual = cola[indice]

  const manejarVerificacion = (resultado) => {
    setEsCorrecto(resultado)
    if (!resultado) {
      setErroresRonda((prev) =>
      prev.some((p)=> p.id === palabraActual.id) ? prev : [...prev, palabraActual]
      )
    }
  }

  const manejarSiguiente = () => {
    if (indice + 1 < cola.length) {
      setIndice(indice + 1)
      setEsCorrecto(null)
      return
    }
    setPantalla(erroresRonda.length > 0 ? 'transicion' : 'finalizado')
  }

  const manejarContinuarRepaso = () => {
    setCola(erroresRonda)
    setIndice(0)
    setErroresRonda([])
    setEsCorrecto(null)
    setPantalla('practica')
  }

  const manejarReiniciar =() => {
    setCola(todasLasPalabras)
    setIndice(0)
    setErroresRonda([])
    setEsCorrecto(null)
    setPantalla('practica')
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <p className="text-xl font-bold animate-pulse">Cargando palabras...</p>
      </div>
    )
  }

  if (pantalla === 'transicion') {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="flex flex-col items-center gap-4 w-full max-w-md text-center">
          <p className="text-2xl font-bold">¡Ahora repasemos las palabras difíciles! 💪</p>
          <button onClick={manejarContinuarRepaso} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-blue-700">Continuar</button>
        </div>
      </div>
    )
  }

  if (pantalla === 'finalizado') {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="flex flex-col items-center gap-4 w-full max-w-md text-center">
          <p className="text-2xl font-bold">🎉 ¡Sesión completada! Dominaste todas las palabras.</p>
          <button onClick={manejarReiniciar} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-blue-700">Reiniciar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <WordCard palabra={palabraActual.word} video={palabraActual.video} />
        <FeedbackMessage esCorrecto={esCorrecto} />
        <PracticeInput
          key={palabraActual.id}
          palabraCorrecta={palabraActual.word}
          onVerificar={manejarVerificacion}
          deshabilitado={esCorrecto !== null}
        />
        {esCorrecto !== null && (
          <button onClick={manejarSiguiente} className="bg-green-600 text-white font-bold py-3 rounded-lg text-xl hover:bg-green-700 w-full">
            Siguiente
          </button>
        )}
      </div>
    </div>
  )
}


export default App