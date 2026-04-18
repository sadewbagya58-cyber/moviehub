import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Hero from '../components/Hero';
import MovieGrid from '../components/MovieGrid';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial attempt with ordering
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movieData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMovies(movieData);
      setLoading(false);
    }, (err) => {
      console.error("Firestore onSnapshot error:", err);
      // If ordering fails (missing index), fallback to simple query
      const qSimple = query(collection(db, 'movies'));
      onSnapshot(qSimple, (snapshot) => {
        const movieData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMovies(movieData);
        setLoading(false);
      }, (err2) => {
        console.error("Simple query also failed:", err2);
        setError("Failed to load movies. Please check your Firebase configuration or Firestore rules.");
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {movies.length > 0 ? (
        <Hero movie={movies[0]} />
      ) : !loading && (
        <div className="h-[40vh] flex items-center justify-center bg-brand-bg/50">
           <p className="text-brand-text/40 font-bold uppercase tracking-widest">No movies found in database</p>
        </div>
      )}
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Trending <span className="text-brand-accent">Now</span>
          </h2>
          <div className="h-px flex-grow mx-8 bg-gradient-to-r from-brand-accent/30 to-transparent hidden md:block" />
          <a href="#" className="text-brand-accent text-sm font-bold hover:underline">
            View All
          </a>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
          </div>
        ) : error ? (
           <div className="text-center py-20 bg-red-500/10 rounded-3xl border border-red-500/20">
             <p className="text-red-500 font-bold uppercase tracking-widest">{error}</p>
             <p className="text-brand-text/40 text-sm mt-2">Ensure your Firestore rules allow read access.</p>
           </div>
        ) : (
          <MovieGrid movies={movies} />
        )}
      </section>
    </>
  );
};

export default Home;
