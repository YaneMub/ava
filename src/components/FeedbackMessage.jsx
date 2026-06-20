
function FeedbackMessage ({esCorrecto}) {
    if (esCorrecto === null) {
        return null
    }

     if (esCorrecto === true) {
        return (
            <span className="text-green-600 font-bold text-xl">¡Bien hecho!</span>
        )
    } 
    return (
            <span className="text-red-500 font-bold text-xl">¡Incorrecto!</span>
    )
}


export default FeedbackMessage