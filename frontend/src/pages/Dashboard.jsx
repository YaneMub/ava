import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  const nombre = usuario?.nombre || 'Estudiante'
  const navigate = useNavigate()

  const [misCursos, setMisCursos] = useState([])
  const [disponibles, setDisponibles] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerCursos = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/cursos`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const datos = await respuesta.json()
        setMisCursos(datos.misCursos || [])
        setDisponibles(datos.disponibles || [])
      } catch (error) {
        console.error('Error al conectar con el backend:', error)
      } finally {
        setCargando(false)
      }
    }

    obtenerCursos()
  }, [])

  const iniciarCurso = async (curso) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/api/cursos/${curso.id}/iniciar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      navigate(`/curso/${curso.slug}`)
    } catch (error) {
      console.error('Error al iniciar el curso:', error)
    }
  }

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-md pb-24 px-4">

        <header className="flex items-center justify-between py-4">
          <div>
            <p className="font-bold text-textoPrincipal text-lg">Hola, {nombre}</p>
            <p className="text-textoSecundario text-sm">Seguí aprendiendo</p>
          </div>
          {/* Notificaciones y ajustes: todavía no conectados al backend
          <div className="flex gap-3 text-xl">
            <span>🔔</span>
            <span>⚙️</span>
          </div>
          */}
        </header>

        {/* Racha/EXP/Nivel: valores fijos de ejemplo, todavía no vienen del backend
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-advertencia rounded-xl p-3 text-center">
            <p className="font-bold text-textoPrincipal">🔥 3</p>
            <p className="text-xs text-textoSecundario">días</p>
          </div>
          <div className="flex-1 bg-fondoExito rounded-xl p-3 text-center">
            <p className="font-bold text-textoPrincipal">⚡ 120</p>
            <p className="text-xs text-textoSecundario">EXP</p>
          </div>
          <div className="flex-1 bg-borde rounded-xl p-3 text-center">
            <p className="font-bold text-textoPrincipal">⭐ 2</p>
            <p className="text-xs text-textoSecundario">Nv.</p>
          </div>
        </div>
        */}

        <section className="mb-6">
          <h2 className="text-textoSecundario font-bold text-sm mb-2">MIS CURSOS</h2>

          {cargando && <p className="text-textoSecundario text-sm">Cargando...</p>}

          {!cargando && misCursos.length === 0 && (
            <p className="text-textoSecundario text-sm mb-3">Todavía no empezaste ningún curso.</p>
          )}

          {misCursos.map((curso) => (
            <Link
              key={curso.id}
              to={`/curso/${curso.slug}`}
              className="block bg-white rounded-2xl shadow-md p-4 mb-3 hover:opacity-90"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-azulNoche text-white rounded-lg p-2 text-xl">🤟</span>
                <div>
                  <p className="font-bold text-textoPrincipal">{curso.nombre}</p>
                  <p className="text-xs text-textoSecundario">{curso.descripcion}</p>
                </div>
              </div>
              <div className="w-full bg-borde rounded-full h-2">
                <div className="bg-lavanda h-2 rounded-full" style={{ width: `${curso.progreso}%` }}></div>
              </div>
              <p className="text-xs text-textoSecundario mt-1">{curso.progreso}% completado</p>
            </Link>
          ))}
        </section>

        <section className="mb-6">
          <h2 className="text-textoSecundario font-bold text-sm mb-2">CURSOS DISPONIBLES</h2>

          {!cargando && disponibles.length === 0 && (
            <div className="bg-white rounded-2xl p-4 text-center text-textoSecundario opacity-70">
              🔒 Más cursos próximamente
            </div>
          )}

          {disponibles.map((curso) => (
            <button
              key={curso.id}
              type="button"
              onClick={() => iniciarCurso(curso)}
              className="w-full text-left bg-white rounded-2xl shadow-md p-4 mb-3 hover:opacity-90"
            >
              <div className="flex items-center gap-3">
                <span className="bg-azulNoche text-white rounded-lg p-2 text-xl">🤟</span>
                <div>
                  <p className="font-bold text-textoPrincipal">{curso.nombre}</p>
                  <p className="text-xs text-textoSecundario">{curso.descripcion}</p>
                </div>
              </div>
            </button>
          ))}
        </section>

        {/* Racha semanal: datos fijos de ejemplo, todavía no vienen del backend
        <section>
          <h2 className="text-textoSecundario font-bold text-sm mb-2">MI RACHA SEMANAL</h2>
          <div className="flex justify-between">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, i) => (
              <div
                key={dia}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 3 ? 'bg-lavanda text-white' : 'bg-borde text-textoSecundario'
                }`}
              >
                {i < 3 ? '✓' : dia}
              </div>
            ))}
          </div>
        </section>
        */}

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

export default Dashboard
