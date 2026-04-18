import { Play, Plus, Star } from 'lucide-react';

const Hero = ({ movie }) => {
  if (!movie) return null;

  return (
    <section className="relative w-full h-[85vh] flex items-center overflow-hidden">
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
        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
          {/* Labels & Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-brand-accent/20 text-brand-accent border border-brand-accent/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase font-black">
              Featured Movie
            </span>
            <div className="flex items-center gap-2 text-yellow-400 font-black text-lg">
              <Star size={20} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              <span>{movie.rating}</span>
            </div>
            <span className="text-brand-text/60 font-black ml-2 text-lg">{movie.year}</span>
            <div className="flex gap-2 ml-4">
              {movie.genres && movie.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="text-brand-text/80 text-[10px] font-black tracking-widest uppercase bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl uppercase">
              {movie.title}
            </h1>
            <p className="text-brand-text/80 text-xl md:text-2xl font-medium leading-relaxed max-w-lg drop-shadow-md line-clamp-3">
              {movie.synopsis}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-6">
            <button className="group relative flex items-center gap-3 bg-brand-accent text-brand-bg px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 shadow-[0_0_25px_rgba(0,242,255,0.4)] hover:shadow-[0_0_40px_rgba(0,242,255,0.7)] cursor-pointer tracking-widest">
              <Play size={24} fill="currentColor" />
              WATCH NOW
            </button>
            <button className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-95 cursor-pointer tracking-widest">
              <Plus size={24} />
              ADD TO LIST
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
