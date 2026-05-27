import {saludos} from './data/saludos.js'
import WordCard from './components/WordCard.jsx'
import PracticeInput from './components/PracticeInput.jsx'

function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <WordCard palabra= {saludos[0].palabra} video= {saludos[0].video}/>
      <PracticeInput palabraCorrecta= {saludos[0].palabra}/>
    </div>
  )
}

export default App