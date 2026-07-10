import { useState } from 'react'

function PracticeInput({ palabraCorrecta, onVerificar, deshabilitado }) {
    const [valor, setValor] = useState('')
    const verificar = () => {
        const resultado = valor.trim().toLowerCase() === palabraCorrecta.trim().toLowerCase()
        onVerificar(resultado)
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <input className="border-2 border-borde rounded-lg p-3 text-xl text-center focus:outline-none focus:border-lavanda"
            type="text"
            value={valor}
            disabled={deshabilitado}
            onChange={(e) => setValor(e.target.value)} />
            <button onClick={verificar} disabled={deshabilitado} className="bg-lavanda text-white font-bold py-3 rounded-lg text-xl hover:opacity-90">Verificar</button>

        </div>
    )
}

export default PracticeInput