function WordCard ({ palabra, video }) {
    return (
        <div className= "flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-blue-700">{palabra}</h2>
            <video className="w-full rounded-lg" src={video} controls> </video>
        </div>
    )
}

export default WordCard