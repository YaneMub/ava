function VideoSena({ palabra, video, mostrarBadge = true }) {
  return (
    <div className="relative w-full h-48 bg-azulNoche rounded-2xl overflow-hidden flex-shrink-0">
      <iframe src={video} title={palabra} className="w-full h-full pointer-events-none" allow="autoplay" key={video}></iframe>
      {mostrarBadge && (
        <span className="absolute top-3 right-3 bg-black/40 text-white text-xs font-bold px-2 py-1 rounded">LSA</span>
      )}
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-2xl text-lavanda">▶</span>
      </span>
    </div>
  )
}

export default VideoSena
