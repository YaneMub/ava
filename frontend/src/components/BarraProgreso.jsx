import { Link } from 'react-router-dom'

function BarraProgreso({ volverA, progreso }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <Link to={volverA} className="bg-lavanda text-white rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0">🏠</Link>
      <div className="flex-1 bg-borde rounded-full h-2">
        <div className="bg-lavanda h-2 rounded-full transition-all" style={{ width: `${progreso}%` }}></div>
      </div>
    </div>
  )
}

export default BarraProgreso
