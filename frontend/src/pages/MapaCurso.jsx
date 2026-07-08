import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const iconosPorTipo = {
  presentacion: '▶️',
  reconocimiento: '👁️',
  produccion: '✏️',
  repaso: '🔄',
}

function MapaCurso() {
  const [unidad, setUnidad] = useState(null)
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const obtenerUnidadActual = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/units/actual`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!respuesta.ok) {
          navigate('/dashboard')
          return
        }

        const datos = await respuesta.json()
        setUnidad(datos.unidad)
        setActividades(datos.actividades)
      } catch (error) {
        console.error('Error al conectar con el backend:', error)
      } finally {
        setCargando(false)
      }
    }

    obtenerUnidadActual()
  }, [navigate])

  const actividadActiva = actividades.find((a) => a.estado === 'activo')

  if (cargando) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <p className="text-textoSecundario">Cargando tu progreso...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-md pb-24 px-4">

        <header className="flex items-center justify-between py-4">
          <Link to="/dashboard" className="text-2xl text-textoPrincipal">←</Link>
          <p className="font-bold text-textoPrincipal">Señas Argentinas</p>
          <span className="text-xl text-textoSecundario">⋯</span>
        </header>

        <div className="flex justify-between text-center mb-4">
          <div>
            <p className="font-bold text-textoPrincipal">35%</p>
            <p className="text-xs text-textoSecundario">progreso</p>
          </div>
          <div>
            <p className="font-bold text-solDorado">120</p>
            <p className="text-xs text-textoSecundario">EXP</p>
          </div>
          <div>
            <p className="font-bold text-lavanda">7</p>
            <p className="text-xs text-textoSecundario">rachas</p>
          </div>
        </div>

        <div className="bg-lavanda rounded-2xl p-4 mb-4">
          <p className="text-white font-bold">{unidad?.nombre}</p>
          <p className="text-white text-sm opacity-90">{unidad?.descripcion}</p>
        </div>

        <div className="flex flex-col">
          {actividades.map((actividad, i) => (
            <div key={actividad.id} className="flex gap-3">

              {/* Nodo + línea del timeline */}
              <div className="flex flex-col items-center w-4 flex-shrink-0">
                <span className={`w-4 h-4 rounded-full flex-shrink-0 ${
                  actividad.estado === 'hecho' ? 'bg-exito' :
                  actividad.estado === 'activo' ? 'bg-lavanda animate-pulse' :
                  'bg-borde'
                }`}></span>
                {i < actividades.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 ${actividad.estado === 'hecho' ? 'bg-exito' : 'bg-borde'}`}></div>
                )}
              </div>

              {/* Tarjeta de la actividad */}
              <div className={`flex-1 rounded-2xl p-4 mb-3 ${
                actividad.estado === 'hecho' ? 'bg-lavanda/15 border border-lavanda/30' :
                actividad.estado === 'activo' ? 'bg-white border-2 border-lavanda' :
                'bg-borde/40 opacity-60'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full w-9 h-9 flex items-center justify-center text-lg ${
                      actividad.estado === 'activo' ? 'bg-lavanda text-white' : 'bg-white'
                    }`}>{iconosPorTipo[actividad.tipo] || '📘'}</span>
                    <div>
                      <p className="font-bold text-textoPrincipal">{actividad.titulo}</p>
                      <p className="text-xs text-textoSecundario">{actividad.subtitulo}</p>
                    </div>
                  </div>
                  {actividad.estado === 'hecho' && (
                    <span className="bg-exito text-white text-xs font-bold rounded-full px-2 py-1">✓</span>
                  )}
                  {actividad.estado === 'bloqueado' && <span className="text-xl">🔒</span>}
                </div>
              </div>

            </div>
          ))}
        </div>

        {actividadActiva ? (
          <Link
            to={`/?actividad=${actividadActiva.id}`}
            className="block text-center bg-lavanda text-white font-bold py-3 rounded-lg mt-6 hover:opacity-90"
          >
            Continuar lección →
          </Link>
        ) : (
          <p className="text-center text-textoSecundario font-bold mt-6">¡Completaste esta unidad! 🎉</p>
        )}

        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-borde flex justify-center">
          <div className="w-full max-w-md flex justify-around py-3">
            <span className="text-lavanda font-bold text-xs flex flex-col items-center gap-1">🏠 Inicio</span>
            <span className="text-textoSecundario text-xs flex flex-col items-center gap-1">📖 Cursos</span>
            <span className="text-textoSecundario text-xs flex flex-col items-center gap-1">🏆 Logros</span>
            <span className="text-textoSecundario text-xs flex flex-col items-center gap-1">👤 Perfil</span>
          </div>
        </nav>

      </div>
    </div>
  )
}

export default MapaCurso
