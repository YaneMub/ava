import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const iconosPorTipo = {
  presentacion: '▶️',
  reconocimiento: '👁️',
  produccion: '✏️',
  repaso: '🔄',
}

function MapaCurso() {
  const { slug } = useParams()
  const [curso, setCurso] = useState(null)
  const [unidadesProgreso, setUnidadesProgreso] = useState([])
  const [abiertas, setAbiertas] = useState({})
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        const [respuestaCurso, respuestaProgreso] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/cursos/${slug}`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/units/progreso`, { headers }),
        ])

        if (!respuestaCurso.ok || !respuestaProgreso.ok) {
          navigate('/dashboard')
          return
        }

        setCurso(await respuestaCurso.json())

        const datos = await respuestaProgreso.json()
        setUnidadesProgreso(datos)

        const actual = datos.find((u) => u.estadoUnidad === 'actual')
        if (actual) setAbiertas({ [actual.unidad.id]: true })
      } catch (error) {
        console.error('Error al conectar con el backend:', error)
      } finally {
        setCargando(false)
      }
    }

    obtenerDatos()
  }, [slug, navigate])

  const alternarUnidad = (unidadId) => {
    setAbiertas((prev) => ({ ...prev, [unidadId]: !prev[unidadId] }))
  }

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
          <p className="font-bold text-textoPrincipal">{curso?.nombre}</p>
          {/* Menú de opciones: todavía no conectado al backend
          <span className="text-xl text-textoSecundario">⋯</span>
          */}
        </header>

        {/* Progreso/EXP/rachas: valores fijos de ejemplo, todavía no vienen del backend
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
        */}

        {unidadesProgreso.map((item) => {
          const { unidad, estadoUnidad, actividades } = item
          const bloqueada = estadoUnidad === 'bloqueada'
          const abierta = Boolean(abiertas[unidad.id])

          return (
            <div key={unidad.id} className="mb-4">

              <button
                type="button"
                onClick={() => alternarUnidad(unidad.id)}
                className={`w-full text-left rounded-2xl p-4 flex items-center justify-between ${
                  bloqueada ? 'bg-borde/40 opacity-60' : 'bg-lavanda'
                }`}
              >
                <div>
                  <p className={`font-bold ${bloqueada ? 'text-textoPrincipal' : 'text-white'}`}>
                    {unidad.nombre}
                  </p>
                  <p className={`text-sm ${bloqueada ? 'text-textoSecundario' : 'text-white opacity-90'}`}>
                    {unidad.descripcion}
                  </p>
                </div>
                <span className={bloqueada ? 'text-xl' : 'text-xl text-white'}>
                  {bloqueada ? '🔒' : (abierta ? '▲' : '▼')}
                </span>
              </button>

              {abierta && (
                <div className="flex flex-col mt-3">
                  {actividades.map((actividad, i) => {
                    const puedeJugarse = actividad.estado === 'hecho' || actividad.estado === 'activo'

                    const tarjeta = (
                      <div className={`flex-1 rounded-2xl p-4 mb-3 ${
                        actividad.estado === 'hecho' ? 'bg-lavanda/15 border border-lavanda/30' :
                        actividad.estado === 'activo' ? 'bg-white border-2 border-lavanda' :
                        'bg-borde/40 opacity-60'
                      } ${puedeJugarse ? 'hover:opacity-80' : ''}`}>
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
                    )

                    return (
                      <div key={actividad.id} className="flex gap-3">
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

                        {puedeJugarse ? (
                          <Link to={`/?actividad=${actividad.id}`} className="flex-1">
                            {tarjeta}
                          </Link>
                        ) : (
                          <div className="flex-1">{tarjeta}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          )
        })}

        {/* Nav inferior: decorativo, todavía no navega a nada real
        <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-borde flex justify-center">
          <div className="w-full max-w-md flex justify-around py-3">
            <span className="text-lavanda font-bold text-xs flex flex-col items-center gap-1">🏠 Inicio</span>
            <span className="text-textoSecundario text-xs flex flex-col items-center gap-1">📖 Cursos</span>
            <span className="text-textoSecundario text-xs flex flex-col items-center gap-1">🏆 Logros</span>
            <span className="text-textoSecundario text-xs flex flex-col items-center gap-1">👤 Perfil</span>
          </div>
        </nav>
        */}

      </div>
    </div>
  )
}

export default MapaCurso
