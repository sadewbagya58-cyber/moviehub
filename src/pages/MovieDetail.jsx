import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Star, ArrowLeft, Download, ShieldCheck, Cpu, ExternalLink } from 'lucide-react';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const docRef = doc(db, 'movies', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMovie({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-brand-bg text-brand-text px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Movie not found</h2>
        <Link to="/" className="bg-brand-accent text-brand-bg px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-lg active:scale-95">
          RETURN TO HOME
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 bg-brand-bg text-brand-text">
      {/* Blurred Background Hero */}
      <div className="absolute top-0 left-0 w-full h-[70vh] overflow-hidden -z-10">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="w-full h-full object-cover scale-150 blur-3xl opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-bg/80 to-brand-bg" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-brand-text/60 hover:text-brand-accent mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-tight">Return to Home</span>
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left: Video Player Section */}
          <div className="lg:col-span-8 space-y-10">
            {/* 16:9 Iframe Container */}
            <div className="space-y-8">
              <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                {movie.videoUrl ? (
                  <iframe
                    src={movie.videoUrl}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                    title={movie.title}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-brand-text/30 font-bold uppercase tracking-widest bg-brand-card/20">
                    Streaming link currently unavailable
                  </div>
                )}
              </div>

              {/* Main Download Button below Player */}
              <div className="flex justify-center md:justify-start">
                <a 
                  href={movie.videoUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-4 bg-brand-accent text-brand-bg px-14 py-6 rounded-2xl font-black text-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white active:scale-95 shadow-[0_20px_40px_rgba(0,242,255,0.2)] hover:shadow-[0_25px_50px_rgba(0,242,255,0.4)] tracking-[0.2em]"
                >
                  <Download size={26} />
                  DOWNLOAD MOVIE NOW
                </a>
              </div>
            </div>

            {/* Movie Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-lg">
                  {movie.title}
                </h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20 font-black text-lg">
                    <Star size={20} fill="currentColor" />
                    <span>{movie.rating}</span>
                  </div>
                  <span className="text-brand-text/40 font-black tracking-widest text-lg">{movie.year}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres && movie.genres.map(genre => (
                  <span key={genre} className="bg-white/5 backdrop-blur-sm text-brand-text/80 border border-white/10 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
                    {genre}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <ExternalLink size={20} className="text-brand-accent" />
                  Overview
                </h3>
                <p className="text-brand-text/60 text-xl leading-relaxed max-w-4xl font-medium">
                  {movie.synopsis}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Server & Alternate Downloads */}
          <div className="lg:col-span-4 space-y-10">
            {/* Server Selection */}
            <div className="bg-brand-card/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <Cpu size={22} className="text-brand-accent" />
                Select Server
              </h3>
              <div className="grid gap-3">
                {['StreamWish (Primary)', 'Cloud Mirror', 'High Performance Mirror'].map((server, i) => (
                  <button key={server} className={`w-full py-4 px-6 rounded-2xl border transition-all duration-300 font-bold text-sm tracking-tight text-left flex items-center justify-between group cursor-pointer ${i === 0 ? 'bg-brand-accent text-brand-bg border-brand-accent shadow-[0_10px_20px_rgba(0,242,255,0.1)]' : 'bg-white/5 text-white/40 border-white/5 hover:border-brand-accent/50 hover:text-white'}`}>
                    <span>{server}</span>
                    <ShieldCheck size={18} className={i === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Section */}
            <div className="bg-brand-card/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <Download size={22} className="text-brand-accent" />
                Available Qualities
              </h3>
              <div className="grid gap-4">
                {movie.downloads && movie.downloads.map((link) => (
                  <a 
                    href={link.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    key={link.quality || Math.random()}
                    className="group relative flex flex-col items-start gap-1 bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-accent transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] cursor-pointer overflow-hidden text-left w-full"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 scale-[2] rotate-12 -z-10 text-brand-accent group-hover:scale-[2.5] group-hover:opacity-10 transition-all duration-500">
                      <Download size={48} />
                    </div>
                    <span className="text-brand-accent text-[10px] font-black tracking-[0.3em] uppercase mb-1">{link.quality || 'HD'}</span>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white font-black text-lg">{link.label}</span>
                      <span className="text-brand-text/30 text-xs font-black">{link.size}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
