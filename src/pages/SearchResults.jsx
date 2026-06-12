import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useSearchParams, Link } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';
import { ArrowLeft } from 'lucide-react';

const SearchResults = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const term = queryParam.toLowerCase().trim();
    if (!term) return true;

    // Search by title
    const matchesTitle = movie.title?.toLowerCase().includes(term);
    // Search by genres array
    const matchesGenre = movie.genres?.some((g) => g.toLowerCase().includes(term));
    // Search by cast array (handles arrays and string fallback)
    let matchesCast = false;
    if (Array.isArray(movie.cast)) {
      matchesCast = movie.cast.some((c) => c.toLowerCase().includes(term));
    } else if (typeof movie.cast === 'string') {
      matchesCast = movie.cast.toLowerCase().includes(term);
    }
    
    return matchesTitle || matchesGenre || matchesCast;
  });

  return (
    <div className="min-h-screen pt-32 pb-20 bg-brand-bg text-brand-text relative">
      {/* Blurred Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden -z-10 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-accent via-transparent to-transparent blur-3xl scale-150" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-brand-text/60 hover:text-brand-accent mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-tight">Back to Home</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
              Search Results
            </h1>
            <p className="text-brand-text/40 font-bold uppercase tracking-widest text-sm mt-2">
              Showing matches for <span className="text-brand-accent">"{queryParam}"</span>
            </p>
          </div>
          <span className="text-xs text-brand-text/40 font-bold uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full bg-white/5">
            {filteredMovies.length} {filteredMovies.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-24 border border-white/5 rounded-[2rem] bg-slate-900/20 backdrop-blur-xl shadow-inner">
            <p className="text-brand-text/40 font-black uppercase tracking-widest text-lg">No matching titles, cast, or genres found</p>
            <p className="text-brand-text/30 text-sm mt-2">Try checking for spelling or try different keywords.</p>
          </div>
        ) : (
          <MovieGrid movies={filteredMovies} />
        )}
      </div>
    </div>
  );
};

export default SearchResults;
