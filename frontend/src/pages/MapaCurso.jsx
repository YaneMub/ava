import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const metaPorTipo = {
  aprender: { titulo: '¡Aprender!', subtitulo: 'Mirá las señas nuevas', icono: '👁️', ruta: 'aprender' },
  reconocimiento: { titulo: 'Poné a prueba', subtitulo: 'Elegí la respuesta correcta', icono: '🎯', ruta: 'practicar' },
  produccion: { titulo: 'A escribir', subtitulo: 'Escribí lo que ves', icono: '✏️', ruta: 'escribir' },
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
        </header>

        {unidadesProgreso.map((item) => {
          const { unidad, estadoUnidad, bloques, repaso } = item
          const sinContenido = estadoUnidad === 'sin-contenido'
          const bloqueada = estadoUnidad === 'bloqueada' || sinContenido
          const abierta = Boolean(abiertas[unidad.id])

          return (
            <div key={unidad.id} className="mb-4">

              <button
                type="button"
                disabled={sinContenido}
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
                    {sinContenido ? 'Todavía no hay contenido cargado' : unidad.descripcion}
                  </p>
                </div>
                <span className={bloqueada ? 'text-xl' : 'text-xl text-white'}>
                  {bloqueada ? '🔒' : (abierta ? '▲' : '▼')}
                </span>
              </button>

              {abierta && !sinContenido && (
                <div className="flex flex-col mt-3">
                  {bloques.map((bloque) => (
                    <div key={bloque.numero} className="mb-3">
                      <p className="text-textoSecundario text-xs font-bold uppercase mb-2 ml-1">
                        Bloque {bloque.numero}
                      </p>

                      {bloque.actividades.map((actividad, i) => {
                        const meta = metaPorTipo[actividad.tipo]
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
                                }`}>{meta.icono}</span>
                                <div>
                                  <p className="font-bold text-textoPrincipal">{meta.titulo}</p>
                                  <p className="text-xs text-textoSecundario">{meta.subtitulo}</p>
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
                          <div key={actividad.tipo} className="flex gap-3">
                            <div className="flex flex-col items-center w-4 flex-shrink-0">
                              <span className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                actividad.estado === 'hecho' ? 'bg-exito' :
                                actividad.estado === 'activo' ? 'bg-lavanda animate-pulse' :
                                'bg-borde'
                              }`}></span>
                              {i < bloque.actividades.length - 1 && (
                                <div className={`w-0.5 flex-1 my-1 ${actividad.estado === 'hecho' ? 'bg-exito' : 'bg-borde'}`}></div>
                              )}
                            </div>

                            {puedeJugarse ? (
                              <Link to={`/${meta.ruta}/${slug}/${unidad.id}/${bloque.numero}`} className="flex-1">
                                {tarjeta}
                              </Link>
                            ) : (
                              <div className="flex-1">{tarjeta}</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}

                  {/* Repaso general de la unidad, distinto al resto: abarca toda la unidad, no un bloque */}
                  {repaso.estado === 'bloqueado' ? (
                    <div className="rounded-2xl p-4 mb-3 bg-borde/40 opacity-60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full w-9 h-9 flex items-center justify-center text-lg bg-white">🔄</span>
                        <p className="font-bold text-textoPrincipal">¿Repasamos?</p>
                      </div>
                      <span className="text-xl">🔒</span>
                    </div>
                  ) : (
                    <Link
                      to={`/repaso/${slug}/${unidad.id}`}
                      className={`block rounded-2xl p-4 mb-3 hover:opacity-80 ${
                        repaso.estado === 'hecho' ? 'bg-lavanda/15 border border-lavanda/30' : 'bg-white border-2 border-lavanda'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full w-9 h-9 flex items-center justify-center text-lg ${
                            repaso.estado === 'activo' ? 'bg-lavanda text-white' : 'bg-white'
                          }`}>🔄</span>
                          <p className="font-bold text-textoPrincipal">¿Repasamos?</p>
                        </div>
                        {repaso.estado === 'hecho' && (
                          <span className="bg-exito text-white text-xs font-bold rounded-full px-2 py-1">✓</span>
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              )}

            </div>
          )
        })}

      </div>
    </div>
  )
}

export default MapaCurso
