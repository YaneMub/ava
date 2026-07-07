import { Link } from 'react-router-dom'

const lecciones = [
  { titulo: 'Presentación', subtitulo: 'Aprendé la seña', icono: '▶️', estado: 'hecho' },
  { titulo: 'Reconocimiento', subtitulo: 'Elegí la palabra correcta', icono: '👁️', estado: 'hecho' },
  { titulo: 'Producción', subtitulo: 'Escribí la palabra', icono: '✏️', estado: 'hecho' },
  { titulo: 'Repaso general', subtitulo: '3 palabras · todas correctas', icono: '🔄', estado: 'hecho' },
  { titulo: 'Presentación 2', subtitulo: 'hola · chau · gracias', icono: '▶️', estado: 'activo', progreso: 40 },
  { titulo: 'Lección bloqueada', subtitulo: 'Completá la anterior para desbloquear', icono: '🔒', estado: 'bloqueado' },
  { titulo: 'Lección bloqueada', subtitulo: 'Completá la anterior para desbloquear', icono: '🔒', estado: 'bloqueado' },
]

function MapaCurso() {
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
          <p className="text-white font-bold">Unidad 1 — Saludos</p>
          <p className="text-white text-sm opacity-90">9 palabras · 60% completado</p>
        </div>

        <div className="flex flex-col">
          {lecciones.map((leccion, i) => (
            <div key={i} className="flex gap-3">

              {/* Nodo + línea del timeline */}
              <div className="flex flex-col items-center w-4 flex-shrink-0">
                <span className={`w-4 h-4 rounded-full flex-shrink-0 ${
                  leccion.estado === 'hecho' ? 'bg-exito' :
                  leccion.estado === 'activo' ? 'bg-lavanda animate-pulse' :
                  'bg-borde'
                }`}></span>
                {i < lecciones.length - 1 && (
                  <div className={`w-0.5 flex-1 my-1 ${leccion.estado === 'hecho' ? 'bg-exito' : 'bg-borde'}`}></div>
                )}
              </div>

              {/* Tarjeta de la lección */}
              <div className={`flex-1 rounded-2xl p-4 mb-3 ${
                leccion.estado === 'hecho' ? 'bg-lavanda/15 border border-lavanda/30' :
                leccion.estado === 'activo' ? 'bg-white border-2 border-lavanda' :
                'bg-borde/40 opacity-60'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full w-9 h-9 flex items-center justify-center text-lg ${
                      leccion.estado === 'activo' ? 'bg-lavanda text-white' : 'bg-white'
                    }`}>{leccion.icono}</span>
                    <div>
                      <p className="font-bold text-textoPrincipal">{leccion.titulo}</p>
                      <p className="text-xs text-textoSecundario">{leccion.subtitulo}</p>
                    </div>
                  </div>
                  {leccion.estado === 'hecho' && (
                    <span className="bg-exito text-white text-xs font-bold rounded-full px-2 py-1">✓</span>
                  )}
                </div>
                {leccion.estado === 'activo' && (
                  <div className="w-full bg-borde rounded-full h-2 mt-3">
                    <div className="bg-lavanda h-2 rounded-full" style={{ width: `${leccion.progreso}%` }}></div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        <Link
          to="/"
          className="block text-center bg-lavanda text-white font-bold py-3 rounded-lg mt-6 hover:opacity-90"
        >
          Continuar lección →
        </Link>

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
