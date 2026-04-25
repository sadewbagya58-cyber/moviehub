import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Star, ArrowLeft, Download, ShieldCheck, Cpu, ExternalLink, FileText, Info } from 'lucide-react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

// Build-ID: 200 — Plyr + iframe hybrid
const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlayer, setActivePlayer] = useState('server1');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const plyrRef = useRef(null);

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

  // Initialize Plyr for direct video sources
  useEffect(() => {
    if (isPlaying && activePlayer === 'player1' && movie?.videoUrl && !isEmbedSource(movie.videoUrl) && videoRef.current) {
      plyrRef.current = new Plyr(videoRef.current, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        ratio: '16:9',
        autoplay: true,
      });
      plyrRef.current.play().catch(() => {}); // Attempt to auto-play when user clicks thumbnail
    }
    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
      }
    };
  }, [movie, activePlayer, isPlaying]);

  // Detect if URL needs iframe (Google Drive, YouTube, StreamWish, etc.)
  const isEmbedSource = (url) => {
    if (!url) return false;
    return (
      url.includes('drive.google.com') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('streamwish.to') ||
      url.includes('vimeo.com') ||
      url.includes('4meplayer.com') ||
      url.includes('vidhide')
    );
  };

  const formatEmbedUrl = (url) => {
    if (!url) return '';
    let formatted = url;

    // Check if it is already an embed URL we support without changes
    if (formatted.includes('4meplayer.com') || formatted.includes('vidhide')) {
      return formatted;
    }

    // Convert YouTube links to embed format
    if (formatted.includes('youtube.com/watch?v=')) {
      formatted = formatted.replace('watch?v=', 'embed/');
    } else if (formatted.includes('youtu.be/')) {
      const videoId = formatted.split('/').pop();
      formatted = `https://www.youtube.com/embed/${videoId}`;
    }

    // Ensure StreamWish/SeekStreaming use the embed path
    if (formatted.includes('streamwish.to/') && !formatted.includes('/e/')) {
      formatted = formatted.replace('streamwish.to/', 'streamwish.to/e/');
    }

    // Google Drive: handle all link formats → /preview
    if (formatted.includes('drive.google.com')) {
      // Extract file ID from various Drive URL formats
      const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,        // /file/d/ID/view or /file/d/ID/preview
        /[?&]id=([a-zA-Z0-9_-]+)/,            // ?id=ID (open?id=)
        /\/d\/([a-zA-Z0-9_-]+)/,              // /d/ID
      ];
      let fileId = null;
      for (const pattern of patterns) {
        const match = formatted.match(pattern);
        if (match) { fileId = match[1]; break; }
      }
      if (fileId) {
        formatted = `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    return formatted;
  };

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

  // Server URLs based on IMDB ID
  const isServer1 = activePlayer === 'server1';
  const currentUrl = isServer1 
    ? `https://vidsrc.me/embed/movie/${movie.imdb_id}`
    : `https://vidsrc.cc/v2/embed/movie/${movie.imdb_id}`;
  
  const useIframe = true;

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32">
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
            {/* 16:9 Video Player Container and Controls */}
            <div className="flex flex-col gap-6 md:gap-8 w-full">
              {/* Outer 16:9 box — #000 bg hides any white edge lines */}
              <div
                className="relative w-full rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group"
                style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', backgroundColor: '#000' }}
              >
                {!isPlaying ? (
                  <div 
                    className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black z-20"
                    onClick={() => setIsPlaying(true)}
                  >
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="absolute w-20 h-20 bg-brand-accent/90 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.5)] group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-brand-bg translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                ) : currentUrl ? (
                  useIframe ? (
                    <div
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}
                    >
                        <iframe
                          src={currentUrl}
                          style={{ position: 'absolute', top: '-2px', left: '-2px', width: 'calc(100% + 4px)', height: 'calc(100% + 4px)', border: 0 }}
                          allowFullScreen={true}
                          allow="autoplay; encrypted-media"
                          title={movie.title}
                          referrerPolicy="origin"
                        />
                    </div>
                ) : (
                  <div
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}
                    className="text-brand-text/30 font-bold uppercase tracking-widest text-center px-4"
                  >
                    IMDB ID unavailable for this movie
                  </div>
                )}
              </div>

              {/* Player Selection Tabs */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => { setActivePlayer('server1'); setIsPlaying(false); }}
                  className={`px-6 py-3 rounded-xl font-black tracking-widest uppercase transition-all duration-300 border-2 ${
                    activePlayer === 'server1'
                      ? 'bg-brand-accent/10 border-brand-accent text-brand-accent shadow-[0_0_20px_rgba(0,242,255,0.3)]'
                      : 'bg-white/5 border-white/10 text-brand-text/60 hover:text-white hover:border-white/30'
                  }`}
                >
                  Server 1
                </button>
                <button
                  onClick={() => { setActivePlayer('server2'); setIsPlaying(false); }}
                  className={`px-6 py-3 rounded-xl font-black tracking-widest uppercase transition-all duration-300 border-2 ${
                    activePlayer === 'server2'
                      ? 'bg-brand-accent/10 border-brand-accent text-brand-accent shadow-[0_0_20px_rgba(0,242,255,0.3)]'
                      : 'bg-white/5 border-white/10 text-brand-text/60 hover:text-white hover:border-white/30'
                  }`}
                >
                  Server 2
                </button>
              </div>

 

              {/* Subtitle Toolbox */}
              {movie.sub_url && (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <FileText className="text-brand-accent" size={24} />
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Subtitle Toolbox</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <a 
                      href={movie.sub_url}
                      download
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-brand-bg px-8 py-4 rounded-xl font-black transition-all border border-white/10"
                    >
                      <Download size={20} />
                      DOWNLOAD SRT
                    </a>
                    <div className="flex items-start gap-2 text-brand-text/60 max-w-md">
                      <Info size={18} className="text-brand-accent shrink-0 mt-0.5" />
                      <p className="text-sm font-medium leading-relaxed">
                        Download the SRT file, then click the CC/Settings icon in the player and select <span className="text-white font-bold">"Upload/Custom Subtitle"</span> to load it.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-lg leading-none">
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
            <div className="bg-brand-card/20 backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-[2rem] p-6 md:p-8 space-y-6">
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
