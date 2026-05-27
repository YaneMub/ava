import { useState } from 'react'

function PracticeInput({ palabraCorrecta }) {
    const [valor, setValor] = useState('')
    const verificar = () => {
        if (valor === palabraCorrecta) {
            alert('correcto')
        } else {
            alert('incorrecto')
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <input className="border-2 border-blue-300 rounded-lg p-3 text-xl text-center focus:outline-none focus:border-blue-500"
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)} />
            <button onClick={verificar} className="bg-blue-600 text-white font-bold py-3 rounded-lg text-xl hover:bg-blue-700">Verificar</button>

        </div>
    )
}

export default PracticeInput