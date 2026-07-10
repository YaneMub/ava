
function FeedbackMessage ({esCorrecto, palabraCorrecta}) {
    if (esCorrecto === null) {
        return null
    }

    if (esCorrecto === true) {
        return (
            <div className="w-full bg-fondoExito text-exito font-bold rounded-lg p-3 flex items-center gap-2">
                <span>✅</span>
                <span>¡Correcto! Muy bien</span>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="bg-fondoError text-error font-bold rounded-lg p-3 flex items-center gap-2">
                <span>❌</span>
                <span>Intentalo de nuevo</span>
            </div>
            {palabraCorrecta && (
                <div className="bg-advertencia text-textoPrincipal font-bold rounded-lg p-3">
                    La respuesta correcta era: {palabraCorrecta}
                </div>
            )}
        </div>
    )
}


export default FeedbackMessage