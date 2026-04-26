import { Play, Plus, Star } from 'lucide-react';

const Hero = ({ movie }) => {
  if (!movie) return null;

  return (
    <section className="relative w-full h-[65vh] md:h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 text-brand-bg">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Gradients Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
          {/* Labels & Meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="bg-brand-accent/20 text-brand-accent border border-brand-accent/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase font-black">
              Featured Movie
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400 font-black text-sm sm:text-lg">
              <Star size={16} fill="currentColor" className="sm:w-5 sm:h-5 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              <span>{movie.rating}</span>
            </div>
            <span className="text-brand-text/60 font-black ml-1 sm:ml-2 text-sm sm:text-lg">{movie.year}</span>
            <div className="flex gap-1.5 sm:gap-2 ml-2 sm:ml-4">
              {movie.genres && movie.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="text-brand-text/80 text-[8px] sm:text-[10px] font-black tracking-widest uppercase bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2 sm:space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl uppercase">
              {movie.title}
            </h1>
            <p className="text-brand-text/80 text-sm sm:text-xl md:text-2xl font-medium leading-relaxed max-w-lg drop-shadow-md line-clamp-2 md:line-clamp-3">
              {movie.synopsis}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4 sm:gap-4 sm:pt-6">
            <button className="group relative flex items-center gap-2 sm:gap-3 bg-brand-accent text-brand-bg px-6 py-3 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-lg transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 shadow-[0_0_25px_rgba(0,242,255,0.4)] hover:shadow-[0_0_40px_rgba(0,242,255,0.7)] cursor-pointer tracking-widest">
              <Play size={18} fill="currentColor" className="sm:w-6 sm:h-6" />
              WATCH NOW
            </button>
            <button className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-md border border-white/20 text-white px-6 py-3 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-95 cursor-pointer tracking-widest">
              <Plus size={18} className="sm:w-6 sm:h-6" />
              ADD TO LIST
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
