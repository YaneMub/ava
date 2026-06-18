function WordCard ({ palabra, video }) {
    return (
        <div className= "flex flex-col items-center gap-4 p-4 w-full bg-white rounded-xl shadow-md">
            <iframe className="w-full rounded-lg" src={video} controls className="w-full h-64 rounded-lg"> </iframe>
        </div>
    )
}

export default WordCard