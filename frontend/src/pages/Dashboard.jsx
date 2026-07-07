import { Link } from 'react-router-dom'

function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  const nombre = usuario?.nombre || 'Estudiante'

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-md pb-24 px-4">

        <header className="flex items-center justify-between py-4">
          <div>
            <p className="font-bold text-textoPrincipal text-lg">Hola, {nombre}</p>
            <p className="text-textoSecundario text-sm">Seguí aprendiendo</p>
          </div>
          <div className="flex gap-3 text-xl">
            <span>🔔</span>
            <span>⚙️</span>
          </div>
        </header>

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

        <section className="mb-6">
          <h2 className="text-textoSecundario font-bold text-sm mb-2">MIS CURSOS</h2>

          <div className="bg-white rounded-2xl shadow-md p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-azulNoche text-white rounded-lg p-2 text-xl">🤟</span>
              <div>
                <p className="font-bold text-textoPrincipal">Lengua de Señas Argentina</p>
                <p className="text-xs text-textoSecundario">Unidad 1 · 9 palabras</p>
              </div>
            </div>
            <div className="w-full bg-borde rounded-full h-2 mb-3">
              <div className="bg-lavanda h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
            <Link to="/curso" className="block text-center bg-lavanda text-white font-bold py-2 rounded-lg hover:opacity-90">
              Continuar curso →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-4 text-center text-textoSecundario opacity-70">
            🔒 Más cursos próximamente
          </div>
        </section>

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

export default Dashboard
