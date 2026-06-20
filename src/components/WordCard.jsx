function WordCard ({ palabra, video }) {
    return (
        <div className= "flex flex-col items-center gap-4 p-4 w-full bg-white rounded-xl shadow-md">
            <iframe src={video} className="w-full h-64 rounded-lg pointer-events-none" title={palabra} allow="autoplay" key={video}></iframe>
        </div>
    )
}

export default WordCard