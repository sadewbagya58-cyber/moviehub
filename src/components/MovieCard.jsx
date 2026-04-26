import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <Link 
      to={`/movie/${movie.id}`}
      className="group relative flex flex-col bg-brand-card/30 rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] cursor-pointer"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Rating Overlay */}
        <div className="absolute top-1 right-1 sm:top-3 sm:right-3 bg-brand-bg/80 backdrop-blur-md px-1 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-0.5 sm:gap-1 border border-white/10 shadow-lg">
          <Star fill="#fac015" className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400" />
          <span className="text-[8px] sm:text-xs font-bold text-white">{movie.rating}</span>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-2 sm:p-4 space-y-0.5 sm:space-y-1 bg-gradient-to-t from-brand-bg/80 to-transparent">
        <h3 className="text-[10px] sm:text-sm md:text-base font-bold text-brand-text line-clamp-1 group-hover:text-brand-accent transition-colors duration-300">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[8px] sm:text-xs font-medium text-brand-text/50">{movie.year}</span>
          <span className="text-[7px] sm:text-[10px] border border-white/10 px-1 py-0.5 rounded uppercase tracking-wider text-brand-text/40">{movie.type || 'Movie'}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
