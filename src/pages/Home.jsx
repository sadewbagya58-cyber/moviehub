import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useSearchParams, Link } from 'react-router-dom';
import Hero from '../components/Hero';
import MovieGrid from '../components/MovieGrid';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const sortFilter = searchParams.get('sort') || '';

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const movieData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(movieData);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore onSnapshot error:', err);
        const qSimple = query(collection(db, 'movies'));
        onSnapshot(
          qSimple,
          (snapshot) => {
            const movieData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMovies(movieData);
            setLoading(false);
          },
          (err2) => {
            console.error('Simple query also failed:', err2);
            setError('Failed to load movies. Please check your Firebase configuration or Firestore rules.');
            setLoading(false);
          }
        );
      }
    );
    return () => unsubscribe();
  }, []);

  // Filtering for search functionality (kept unchanged)
  const filteredMovies = movies.filter((movie) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      movie.title?.toLowerCase().includes(term) ||
      movie.genres?.some((g) => g.toLowerCase().includes(term)) ||
      movie.cast?.some((c) => c.toLowerCase().includes(term));
    const matchesType = !typeFilter || movie.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Content segmentation for the home page (no search query)
  const latestMovies = movies.filter((m) => m.type === 'Movie');
  const tvSeries = movies.filter((m) => m.type === 'TV Series');
  const anime = movies.filter((m) => (m.genres ?? []).includes('Animation'));

  const renderSection = (title, emoji, items, viewAllLink = '/') => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
          <span>{emoji}</span>
          {title}
        </h2>
        <Link to={viewAllLink} className="text-brand-accent text-sm font-bold hover:underline">
          View All
        </Link>
      </div>
      <MovieGrid movies={items.slice(0, 6)} />
    </section>
  );

  return (
    <>
      {/* Hero – show first movie when no search */}
      {!searchQuery && movies.length > 0 && <Hero movie={movies[0]} />}
      {/* Search or loading states */}
      <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${searchQuery ? 'pt-32 pb-16 min-h-[60vh]' : 'py-16'}`}>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {searchQuery ? (
              <>Search Results for <span className="text-brand-accent">'{searchQuery}'</span></>
            ) : typeFilter ? (
              <> <span className="text-brand-accent">{typeFilter === 'TV' ? 'TV Series' : typeFilter}</span></>
            ) : (
              <>Trending <span className="text-brand-accent">Now</span></>
            )}
          </h2>
          <div className="h-px flex-grow mx-8 bg-gradient-to-r from-brand-accent/30 to-transparent hidden md:block" />
          <Link to="/" className="text-brand-accent text-sm font-bold hover:underline">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-500/10 rounded-3xl border border-red-500/20">
            <p className="text-red-500 font-bold uppercase tracking-widest">{error}</p>
            <p className="text-brand-text/40 text-sm mt-2">
              Ensure your Firestore rules allow read access.
            </p>
          </div>
        ) : searchQuery ? (
          filteredMovies.length === 0 ? (
            <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/5">
              <p className="text-brand-text/60 font-bold uppercase tracking-widest">No matching movies found</p>
            </div>
          ) : (
            <MovieGrid movies={filteredMovies} />
          )
        ) : (
          <>
            {renderSection('Latest Movies', '🎬', latestMovies)}
            <hr className="my-8 border-brand-accent/30" />
            {renderSection('Trending TV Series', '📺', tvSeries)}
            <hr className="my-8 border-brand-accent/30" />
            {renderSection('Epic Anime Collections', '🔥', anime)}
          </>
        )}
      </section>
    </>
  );
};

export default Home;
