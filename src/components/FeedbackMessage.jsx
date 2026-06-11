
function FeedbackMessage ({esCorrecto}) {
    if (esCorrecto) {
        return (
            <span className="text-green-600 font-bold text-xl">¡Bien hecho!</span>
        )
    } else {
        return (
            <span className="text-red-500 font-bold text-xl">¡Incorrecto!</span>
        )
    }
}

export default FeedbackMessage