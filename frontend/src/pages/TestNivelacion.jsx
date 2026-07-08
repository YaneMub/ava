import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const opciones = [
  { valor: 'nada', etiqueta: 'Nada' },
  { valor: 'poco', etiqueta: 'Poco' },
  { valor: 'mucho', etiqueta: 'Mucho' },
]

function TestNivelacion() {
  const [seleccion, setSeleccion] = useState(null)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  const manejarContinuar = async () => {
    if (!seleccion) {
      setError('Elegí una opción para continuar')
      return
    }

    setEnviando(true)

    try {
      const token = localStorage.getItem('token')
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/nivelacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nivel: seleccion }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        setError(datos.error || 'Ocurrió un error, intentá de nuevo')
        setEnviando(false)
        return
      }

      localStorage.setItem('usuario', JSON.stringify(datos.usuario))
      navigate('/curso')
    } catch (error) {
      console.error('Error al conectar con el backend:', error)
      setError('No se pudo conectar con el servidor')
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm text-center">
        <h1 className="text-xl font-bold text-textoPrincipal mb-8">
          ¿Cuánto sabes de Lengua de Señas Argentina?
        </h1>

        <div className="flex items-start justify-between mb-8 relative px-2">
          <div className="absolute top-4 left-6 right-6 h-1 bg-borde"></div>
          {opciones.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setSeleccion(opcion.valor)}
              className="relative flex flex-col items-center gap-2 z-10"
            >
              <span
                className={`w-8 h-8 rounded-full border-4 ${
                  seleccion === opcion.valor ? 'bg-lavanda border-lavanda' : 'bg-white border-borde'
                }`}
              ></span>
              <span className="text-sm font-bold text-textoPrincipal">{opcion.etiqueta}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-error text-sm mb-4">{error}</p>}

        <button
          type="button"
          onClick={manejarContinuar}
          disabled={enviando}
          className="w-full bg-lavanda text-white font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default TestNivelacion
