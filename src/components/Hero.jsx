import { useState, useEffect, useMemo } from 'react';
import { Play, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Utility to shuffle an array (Fisher-Yates)
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const Hero = ({ movies = [] }) => {
  // Shuffle movies once on mount or when the movies prop changes
  const shuffledMovies = useMemo(() => shuffleArray(movies), [movies]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Autoplay sequentially through the shuffled list
  useEffect(() => {
    if (!shuffledMovies || shuffledMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [shuffledMovies]);

  if (!shuffledMovies || shuffledMovies.length === 0) return null;

  return (
    <section className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden bg-brand-bg">
      {shuffledMovies.map((movie, index) => {
        const isActive = index === currentIndex;
        const typePrefix = movie.type === 'TV Series' || movie.type === 'TV' ? 'tv' : 'movie';
        return (
          <div
            key={movie.id}
            className={`absolute inset-0 w-full h-full flex items-center transition-all duration-1000 ease-in-out ${
              isActive
                ? 'opacity-100 translate-x-0 z-10 pointer-events-auto'
                : 'opacity-0 translate-x-4 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={movie.poster}
                alt={movie.title}
                className={`w-full h-full object-cover object-center scale-105 transition-transform duration-10000 ease-out ${
                  isActive ? 'scale-100' : 'scale-105'
                }`}
              />
              {/* Gradients Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className={`max-w-2xl space-y-4 sm:space-y-6 transition-all duration-1000 delay-300 ${
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              >
                {/* Labels & Meta */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="bg-brand-accent/20 text-brand-accent border border-brand-accent/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase font-black">
                    Trending {movie.type === 'TV Series' || movie.type === 'TV' ? 'Show' : 'Movie'}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400 font-black text-sm sm:text-lg">
                    <Star size={16} fill="currentColor" className="sm:w-5 sm:h-5 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                    <span>{movie.rating}</span>
                  </div>
                  <span className="text-brand-text/60 font-black ml-1 sm:ml-2 text-sm sm:text-lg">
                    {movie.year}
                  </span>
                  <div className="flex gap-1.5 sm:gap-2 ml-2 sm:ml-4">
                    {movie.genres && movie.genres.slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="text-brand-text/80 text-[8px] sm:text-[10px] font-black tracking-widest uppercase bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10 md:backdrop-blur-md"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2 sm:space-y-4">
                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl uppercase leading-none">
                    {movie.title}
                  </h1>
                  <p className="text-brand-text/80 text-sm sm:text-xl md:text-2xl font-medium leading-relaxed max-w-lg drop-shadow-md line-clamp-2 md:line-clamp-3">
                    {movie.synopsis}
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-4 sm:gap-4 sm:pt-6">
                  <Link
                    to={`/${typePrefix}/${movie.id}`}
                    className="group relative flex items-center gap-2 sm:gap-3 bg-brand-accent text-brand-bg px-6 py-3 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-lg transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 shadow-[0_0_25px_rgba(0,242,255,0.4)] hover:shadow-[0_0_40px_rgba(0,242,255,0.7)] cursor-pointer tracking-widest"
                  >
                    <Play size={18} fill="currentColor" className="sm:w-6 sm:h-6" />
                    WATCH NOW
                  </Link>
                  <button
                    onClick={() => alert('Watchlist feature coming soon!')}
                    className="flex items-center gap-2 sm:gap-3 bg-white/5 md:backdrop-blur-md border border-white/20 text-white px-6 py-3 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/40 active:scale-95 cursor-pointer tracking-widest"
                  >
                    <Plus size={18} className="sm:w-6 sm:h-6" />
                    ADD TO LIST
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {shuffledMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? 'bg-brand-accent w-8 shadow-[0_0_10px_rgba(0,242,255,0.8)]'
                : 'bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
