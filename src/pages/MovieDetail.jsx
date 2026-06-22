import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Star, ArrowLeft, Download, ExternalLink, FileText, Info, X } from 'lucide-react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

// Build-ID: 200 — Plyr + iframe hybrid
const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlayer, setActivePlayer] = useState('server1');
  const [activeServer, setActiveServer] = useState('server1');
  const [audioMode, setAudioMode] = useState('sub');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  // TMDB dynamic data
  const [seasonsList, setSeasonsList] = useState([]);
  const [totalEpisodes, setTotalEpisodes] = useState(12);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [currentEpisodeName, setCurrentEpisodeName] = useState('');
  const [alertNote, setAlertNote] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const videoRef = useRef(null);
  const plyrRef = useRef(null);

  const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || 'b821ad1cf197f7ed4fcf324e49138c0c';
  const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiODIxYWQxY2YxOTdmN2VkNGZjZjMyNGU0OTEzOGMwYyIsIm5iZiI6MTc4MDg5MDIxMC43Miwic3ViIjoiNmEyNjNhNjJhMDk4M2NmNjg3NWFlNGE4Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.yPorSq3Gj9Gq3M1MUxvfumF1R3KfM9RnMUsxw0JxNtM';

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

  // TMDB: Fetch total number of seasons when a TV series loads
  useEffect(() => {
    if (!movie) return;
    const isTV = movie?.type?.toLowerCase() === 'tv series' || movie?.type?.toLowerCase() === 'tv';
    if (!isTV) return;

    const tmdbId = movie?.tmdb_id ? String(movie.tmdb_id).trim() : '';
    if (!tmdbId) {
      // No TMDB ID: fall back to seasons_data map or totalSeasons field
      const seasonsData = movie?.seasons_data || {};
      if (Object.keys(seasonsData).length > 0) {
        setSeasonsList(Object.keys(seasonsData).map(Number).sort((a, b) => a - b));
      } else if (movie?.totalSeasons) {
        const n = parseInt(movie.totalSeasons) || 1;
        setSeasonsList(Array.from({ length: n }, (_, i) => i + 1));
      } else {
        setSeasonsList([1]);
      }
      return;
    }

    const fetchSeasons = async () => {
      setTmdbLoading(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_TOKEN}`
          }
        });
        if (res.status === 200) {
          const data = await res.json();
          const response = { data };
          console.log("TMDB Success Data:", response.data);
          const validSeasons = response.data.seasons.filter(s => s.season_number > 0);
          const list = validSeasons.map(s => s.season_number);
          setSeasonsList(list);
        } else {
          const error = new Error(`Failed to fetch seasons (Status: ${res.status})`);
          console.error("TMDB Fetch Error:", error);
          setSeasonsList([1]);
        }
      } catch (error) {
        console.error("TMDB Fetch Error:", error);
        setSeasonsList([1]);
      } finally {
        setTmdbLoading(false);
      }
    };
    fetchSeasons();
  }, [movie]);

  // TMDB: Fetch episode count whenever user switches season
  useEffect(() => {
    if (!movie) return;
    const isTV = movie?.type?.toLowerCase() === 'tv series' || movie?.type?.toLowerCase() === 'tv';
    if (!isTV) return;

    const tmdbId = movie?.tmdb_id ? String(movie.tmdb_id).trim() : '';
    if (!tmdbId) {
      // Fall back to stored seasons_data map
      const seasonsData = movie?.seasons_data || {};
      if (seasonsData[currentSeason]) {
        setTotalEpisodes(parseInt(seasonsData[currentSeason]) || 12);
      } else if (movie?.episodesPerSeason) {
        setTotalEpisodes(parseInt(movie.episodesPerSeason) || 12);
      } else {
        setTotalEpisodes(12);
      }
      return;
    }

    const fetchEpisodes = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${currentSeason}?api_key=${TMDB_KEY}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_TOKEN}`
          }
        });
        if (res.status === 200) {
          const data = await res.json();
          const response = { data };
          console.log("TMDB Success Data:", response.data);
          const actualEpisodeCount = response.data.episodes ? response.data.episodes.length : 12;
          setTotalEpisodes(actualEpisodeCount);
        } else {
          const error = new Error(`Failed to fetch episodes (Status: ${res.status})`);
          console.error("TMDB Fetch Error:", error);
          setTotalEpisodes(12);
        }
      } catch (error) {
        console.error("TMDB Fetch Error:", error);
        setTotalEpisodes(12);
      }
    };
    fetchEpisodes();
  }, [movie, currentSeason]);

  // TMDB: Fetch episode name whenever season or episode changes
  useEffect(() => {
    if (!movie) return;
    const isTV = movie?.type?.toLowerCase() === 'tv series' || movie?.type?.toLowerCase() === 'tv';
    if (!isTV) return;
    const tmdbId = movie?.tmdb_id ? String(movie.tmdb_id).trim() : '';
    if (!tmdbId) { setCurrentEpisodeName(''); return; }

    const fetchEpisodeName = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}/season/${currentSeason}/episode/${currentEpisode}?api_key=${TMDB_KEY}`,
          { headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN}` } }
        );
        if (res.status === 200) {
          const data = await res.json();
          setCurrentEpisodeName(data.name || '');
        } else {
          setCurrentEpisodeName('');
        }
      } catch {
        setCurrentEpisodeName('');
      }
    };
    fetchEpisodeName();
  }, [movie, currentSeason, currentEpisode]);

  // Fetch the Global Alert Note from Firestore settings/announcement
  useEffect(() => {
    const fetchAlertNote = async () => {
      try {
        const docRef = doc(db, 'settings', 'announcement');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()?.text) {
          setAlertNote(docSnap.data().text);
        } else {
          setAlertNote(
            "💡 පහළ Subtitle Toolbox එකේ උපසිරසි දාගන්නා විදිහ ගැන උපදෙස් දී ඇති අතර, එහි කියා ඇති පරිදි උපසිරසි දාගන්න. එමෙන්ම, ප්ලේයර් එක Touch කරද්දී හෝ උපසිරසි දාන්න යද්දී වෙනත් වෙබ් පිටුවක් (Ads) Load වුවහොත්, එයින් Back වී නැවත පැමිණෙන්න."
          );
        }
      } catch (error) {
        console.error("Error fetching global alert note:", error);
        setAlertNote(
          "💡 පහළ Subtitle Toolbox එකේ උපසිරසි දාගන්නා විදිහ ගැන උපදෙස් දී ඇති අතර, එහි කියා ඇති පරිදි උපසිරසි දාගන්න. එමෙන්ම, ප්ලේයර් එක Touch කරද්දී හෝ උපසිරසි දාන්න යද්දී වෙනත් වෙබ් පිටුවක් (Ads) Load වුවහොත්, එයින් Back වී නැවත පැමිණෙන්න."
        );
      }
    };
    fetchAlertNote();
  }, []);

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
  const isTV = movie?.type?.toLowerCase() === 'tv series' || movie?.type?.toLowerCase() === 'tv';
  const isMovie = !isTV;
  const typePrefix = isTV ? 'tv' : 'movie';
  const imdbId = movie?.imdb_id?.trim();
  
  let currentUrl = '';
  if (activePlayer === 'server1') {
    if (imdbId) {
      if (movie.subtitle_url) {
        const encodedSub = encodeURIComponent(movie.subtitle_url);
        if (isTV) {
          currentUrl = `https://vidsrc.xyz/embed/tv/${imdbId}/${currentSeason || 1}/${currentEpisode || 1}?sub.file=${encodedSub}&sub.label=Sinhala&sub.default=1`;
        } else {
          currentUrl = `https://vidsrc.xyz/embed/movie/${imdbId}?sub.file=${encodedSub}&sub.label=Sinhala&sub.default=1`;
        }
      } else {
        if (isTV) {
          currentUrl = `https://vsembed.ru/embed/tv/${imdbId}/${currentSeason || 1}/${currentEpisode || 1}`;
        } else {
          currentUrl = `https://vsembed.ru/embed/movie/${imdbId}`;
        }
      }
    }
  } else if (activePlayer === 'server2') {
    const isAnime = movie?.genres?.includes('Animation');
    if (isAnime && isTV) {
      if (audioMode === 'sub' && movie?.mal_id) {
        currentUrl = `https://vidsrc.cc/v2/embed/tv/${movie.mal_id}/${currentSeason}/${currentEpisode}`;
      } else {
        // Dub mode or missing MAL ID falls back to IMDb based URL
        currentUrl = movie?.altVideoUrl
          ? formatEmbedUrl(movie.altVideoUrl)
          : `https://vidsrc.cc/v2/embed/tv/${imdbId}/${currentSeason}/${currentEpisode}`;
      }
    } else {
      currentUrl = movie?.altVideoUrl
        ? formatEmbedUrl(movie.altVideoUrl)
        : `https://vidsrc.to/embed/${typePrefix}/${imdbId}`;
    }
  }

  if (activeServer === 'server2') {
    if (imdbId) {
      if (isTV) {
        currentUrl = `https://multiembed.mov/?video_id=${imdbId}&s=${currentSeason}&e=${currentEpisode}`;
      } else {
        currentUrl = `https://multiembed.mov/?video_id=${imdbId}`;
      }
    }
  }

  const downloadUrl = movie?.download_override_url ? movie.download_override_url.trim() : '';
  const episodeDownloads = movie?.episode_downloads || {};
  const episodeKey = `S${currentSeason}E${currentEpisode}`;
  const episodeDownloadUrl = isTV ? (episodeDownloads[episodeKey] || downloadUrl) : downloadUrl;
  const hasDownload = !!episodeDownloadUrl;

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

        <div className="max-w-5xl mx-auto w-full">
          {showAlert && alertNote && (
            <div className="relative mb-8 p-5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] group/alert">
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-brand-text/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Dismiss Alert"
              >
                <X size={18} />
              </button>
              <div className="flex items-start gap-3.5 pr-8">
                <span className="text-brand-accent shrink-0 mt-0.5 text-lg">💡</span>
                <p className="text-sm md:text-base font-semibold leading-relaxed text-brand-text/90">
                  {alertNote}
                </p>
              </div>
            </div>
          )}

          {/* Video Player Section */}
          <div className="space-y-10">
            {/* 16:9 Video Player Container and Controls */}
            <div className="flex flex-col gap-6 md:gap-8 w-full">
              {/* Premium Title Above Player */}
              <div className="text-center mb-4 space-y-1">
                <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text tracking-wide">
                  {movie.title || movie.name}
                </h2>
                {isTV && (
                  <p className="text-sm md:text-base font-semibold text-brand-text/50 tracking-wide">
                    Season {currentSeason} &bull; Episode {currentEpisode}
                    {currentEpisodeName && (
                      <span className="text-brand-text/80 font-bold"> &mdash; {currentEpisodeName}</span>
                    )}
                  </p>
                )}
              </div>

              {/* Glassmorphic Player Container */}
              <div className="rounded-2xl p-1.5 bg-slate-950/40 backdrop-blur-md border border-gray-800/50 shadow-[0_0_30px_rgba(139,92,246,0.15)] overflow-hidden">
                {/* 
                  Fluid 16:9 padding-bottom trick.
                  VidSrc (Server 1) uses object-fit:cover internally which causes its own
                  control bar to be clipped by our overflow:hidden boundary.
                  Fix: extra bottom padding on the outer shell for Server 1 only, giving
                  the player's control bar room to breathe without affecting Server 2.
                */}
                <div
                  className="relative w-full bg-black rounded-2xl overflow-hidden group"
                  style={{
                    paddingBottom: activeServer === 'server1' ? 'calc(56.25% + 44px)' : '56.25%',
                    height: 0,
                  }}
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
                    <iframe
                      src={currentUrl}
                      className="absolute inset-0 w-full h-full max-w-full max-h-full"
                      style={{ border: 0, overflow: 'hidden' }}
                      width="100%"
                      height="100%"
                      scrolling="no"
                      allowFullScreen={true}
                      allow="autoplay; encrypted-media"
                      title={movie.title}
                      referrerPolicy="origin"
                      key={currentUrl}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black text-brand-text/30 font-bold uppercase tracking-widest text-center px-4"
                    >
                      IMDB ID unavailable for this movie
                    </div>
                  )}
                </div>
              </div>

              {/* Season & Episode Selector */}
              {isTV && (
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 md:gap-8 shadow-2xl">
                  {/* Header / Info & Season Selector Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-brand-accent uppercase tracking-widest">
                        {activeServer === 'server1' ? 'TV Series Settings' : 'HD Player Settings'}
                      </span>
                      <span className="text-[10px] text-brand-text/40 font-bold uppercase mt-1">
                        Select Season & Episode
                      </span>
                    </div>
                    
                    {/* Season Selector - Premium Horizontal Tabs */}
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
                      <span className="text-xs font-black text-white/40 uppercase tracking-widest shrink-0">Seasons</span>
                      <div className="flex gap-2">
                        {tmdbLoading ? (
                          // Skeleton tabs while fetching
                          [1, 2, 3].map(n => (
                            <div key={n} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 animate-pulse w-10 h-8" />
                          ))
                        ) : (
                          seasonsList.map((seasonNum) => (
                            <button
                              key={seasonNum}
                              type="button"
                              onClick={() => {
                                setCurrentSeason(seasonNum);
                                setCurrentEpisode(1);
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-300 border ${
                                currentSeason === seasonNum
                                  ? 'bg-brand-accent/10 border-brand-accent text-brand-accent shadow-[0_0_15px_rgba(0,242,255,0.25)]'
                                  : 'bg-white/5 border-white/5 text-brand-text/60 hover:text-white hover:border-white/20'
                              }`}
                            >
                              S{seasonNum}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Episode Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Episodes</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-brand-accent font-bold uppercase tracking-wider">
                          Season {currentSeason} &bull; Episode {currentEpisode}
                        </span>
                        {movie?.tmdb_id && (
                          <span className="text-[9px] bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">TMDB Live</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((epNum) => (
                        <button
                          key={epNum}
                          type="button"
                          onClick={() => setCurrentEpisode(epNum)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 border font-black text-xs cursor-pointer ${
                            currentEpisode === epNum
                              ? 'bg-gradient-to-br from-brand-accent/20 to-purple-500/20 border-brand-accent text-brand-accent shadow-[0_0_20px_rgba(0,242,255,0.4)] scale-105'
                              : 'bg-white/5 border-white/5 text-brand-text/60 hover:text-white hover:border-white/20 hover:scale-[1.02]'
                          }`}
                        >
                          <span className="text-[9px] opacity-40 uppercase tracking-widest font-bold">EP</span>
                          <span className="text-sm mt-0.5">{epNum}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Player Selection Tabs */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => { setActiveServer('server1'); setIsPlaying(false); }}
                  className={`px-6 py-3 rounded-full font-black tracking-widest uppercase transition-all duration-300 border ${
                    activeServer === 'server1'
                      ? 'border-cyan-500 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'border-gray-700 bg-black/40 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  Server 1
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveServer('server2'); setIsPlaying(false); }}
                  className={`px-6 py-3 rounded-full font-black tracking-widest uppercase transition-all duration-300 border ${
                    activeServer === 'server2'
                      ? 'border-cyan-500 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'border-gray-700 bg-black/40 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  Server 2
                </button>
              </div>
                {/* Sub/Dub Toggle for Anime */}
                {movie?.genres?.includes('Animation') && isTV && (
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs font-black text-brand-text/40 uppercase">Audio Mode:</span>
                    <button
                      type="button"
                      onClick={() => setAudioMode('sub')}
                      className={`px-3 py-1 rounded ${audioMode==='sub' ? 'bg-brand-accent text-brand-bg' : 'bg-white/5 text-brand-text/60'}`}
                    >🇯🇵 Sub</button>
                    <button
                      type="button"
                      onClick={() => setAudioMode('dub')}
                      className={`px-3 py-1 rounded ${audioMode==='dub' ? 'bg-brand-accent text-brand-bg' : 'bg-white/5 text-brand-text/60'}`}
                    >🇬🇧 Dub</button>
                  </div>
                )}

                {/* Premium Download Button */}
                {hasDownload ? (
                  <a
                    href={episodeDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-5 px-8 rounded-2xl font-black text-lg uppercase tracking-wider transition-all duration-300 border-2 border-brand-accent bg-gradient-to-r from-[#0a0d24] via-[#120d2b] to-[#0a0d24] shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_35px_rgba(0,242,255,0.45)] hover:scale-[1.01] active:scale-[0.99] text-white hover:from-[#00f2ff]/20 hover:via-[#8b5cf6]/20 hover:to-[#00f2ff]/20 hover:border-brand-accent cursor-pointer text-center"
                  >
                    📥 Download {isMovie ? 'Movie' : `Episode ${currentEpisode || 1}`}
                  </a>
                ) : (
                  <div
                    className="w-full flex items-center justify-center gap-3 py-5 px-8 rounded-2xl font-black text-lg uppercase tracking-wider border-2 border-white/5 bg-white/5 text-brand-text/20 text-center select-none"
                  >
                    📥 Download Unavailable
                  </div>
                )}

               {/* Subtitle Toolbox */}
              {activeServer !== 'server2' && ((movie.subtitles && movie.subtitles.length > 0) || movie.sub_url) && (
                <div className="bg-slate-900 md:bg-slate-900/50 md:backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <FileText className="text-brand-accent" size={24} />
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Subtitle Toolbox</h3>
                  </div>
                  
                  {movie.subtitles && movie.subtitles.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {movie.subtitles.map((sub, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-brand-accent/30 rounded-xl transition-all duration-300">
                          <span className="text-sm font-bold text-white tracking-wide truncate max-w-[180px]">{sub.label}</span>
                          <a 
                            href={sub.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-brand-bg px-4 py-2.5 rounded-lg text-xs font-black transition-all border border-brand-accent/20 hover:scale-105"
                          >
                            <Download size={14} />
                            DOWNLOAD
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-6">
                      <a 
                        href={movie.sub_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-brand-bg px-8 py-4 rounded-xl font-black transition-all border border-white/10"
                      >
                        <Download size={20} />
                        DOWNLOAD SRT
                      </a>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-brand-text/60 max-w-xl">
                    <Info size={18} className="text-brand-accent shrink-0 mt-0.5" />
                    <p className="text-[13px] font-medium leading-relaxed">
                      💡 උපදෙස්: මුලින්ම සබ්ටයිටල් ෆයිල් එක Download කරගන්න. ඉන්පසු ෆෝන් එකේ File Manager එකෙන් ඒක Extract (Unzip) කරගන්න. දැන් ප්ලේයර් එකේ පහළ තියෙන Settings (⚙️) අයිකන් එක ඔබන්න. එතකොට එන මෙනු එකෙන් 'Subtitle' තෝරලා, ඉන්පසු 'Upload' ඔබන්න. ඊට පස්සේ අර Extract කරපු ෆයිල් ලොකේෂන් එකට ගිහින් ෆයිල් එක සිලෙක්ට් කරගන්න.
                    </p>
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
                  <span key={genre} className="bg-white/5 md:backdrop-blur-sm text-brand-text/80 border border-white/10 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
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
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
