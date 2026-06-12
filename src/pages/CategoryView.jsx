import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, Link } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';
import { ArrowLeft } from 'lucide-react';

const CategoryView = () => {
  const { categoryName } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [categoryName]);

  // Filter based on categoryName
  let displayMovies = [];
  let title = '';
  let subtitle = '';

  if (categoryName === 'latest-movies') {
    displayMovies = movies.filter((m) => m.type === 'Movie');
    title = 'Latest Movies';
    subtitle = 'Discover the newest blockbuster releases';
  } else if (categoryName === 'trending-tv') {
    displayMovies = movies.filter((m) => m.type === 'TV Series' || m.type === 'TV');
    title = 'TV Series';
    subtitle = 'Most popular television shows streaming now';
  } else if (categoryName === 'anime') {
    displayMovies = movies.filter((m) => (m.genres ?? []).some((g) => g.toLowerCase() === 'animation' || g.toLowerCase() === 'anime'));
    title = 'Epic Anime';
    subtitle = 'Legendary animated collections and series';
  } else if (categoryName === 'trending') {
    // Sort by rating descending
    displayMovies = [...movies].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    title = 'Trending Now';
    subtitle = 'Top-rated films and shows loved by users';
  } else {
    // Fallback/catch-all
    displayMovies = movies;
    title = 'All Content';
    subtitle = 'Explore everything available on StreamVerse';
  }

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
              {title}
            </h1>
            <p className="text-brand-text/40 font-bold uppercase tracking-widest text-sm mt-2">
              {subtitle}
            </p>
          </div>
          <span className="text-xs text-brand-text/40 font-bold uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full bg-white/5">
            {displayMovies.length} {displayMovies.length === 1 ? 'item' : 'items'} available
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        ) : displayMovies.length === 0 ? (
          <div className="text-center py-24 border border-white/5 rounded-[2rem] bg-slate-900/20 backdrop-blur-xl shadow-inner">
            <p className="text-brand-text/40 font-black uppercase tracking-widest text-lg">No content found in this category</p>
          </div>
        ) : (
          <MovieGrid movies={displayMovies} />
        )}
      </div>
    </div>
  );
};

export default CategoryView;
