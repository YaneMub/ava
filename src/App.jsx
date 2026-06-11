import {saludos} from './data/saludos.js'
import {useState} from 'react'
import WordCard from './components/WordCard.jsx'
import PracticeInput from './components/PracticeInput.jsx'
import FeedbackMessage from './components/FeedbackMessage.jsx'


function App() {
  const [indice, setIndice] = useState(0)
  const [esCorrecto, setEsCorrecto] = useState(null)
  const manejarVerificacion = (resultado) => {
    setEsCorrecto(resultado)
    if (resultado) {
      setIndice(indice + 1)
    }
  }
  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <WordCard palabra= {saludos[indice].palabra} video= {saludos[indice].video}/>
      <FeedbackMessage esCorrecto = {esCorrecto} />
      <PracticeInput
      palabraCorrecta={saludos[indice].palabra}
      onVerificar={manejarVerificacion} 
      />
    </div>
  )
}


export default App