import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Minus, Send, CheckCircle2, Film, Edit, Trash2 } from 'lucide-react';

const Admin = () => {
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    rating: '',
    synopsis: '',
    poster: '',
    videoUrl: '',
    altVideoUrl: '',
    imdb_id: '',
    tmdb_id: '',
    mal_id: '',
    sub_url: '',
    subtitle_url: '',
    type: 'Movie',
    download_override_url: '',
  });

  const [genres, setGenres] = useState(['']);
  const [subtitles, setSubtitles] = useState([]);
  const [subInput, setSubInput] = useState({ label: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [globalAlert, setGlobalAlert] = useState('');
  const [savingAlert, setSavingAlert] = useState(false);

  const fallbackAlertText = "💡 පහළ Subtitle Toolbox එකේ උපසිරසි දාගන්නා විදිහ ගැන උපදෙස් දී ඇති අතර, එහි කියා ඇති පරිදි උපසිරසි දාගන්න. එමෙන්ම, ප්ලේයර් එක Touch කරද්දී හෝ උපසිරසි දාන්න යද්දී වෙනත් වෙබ් පිටුවක් (Ads) Load වුවහොත්, එයින් Back වී නැවත පැමිණෙන්න.";

  useEffect(() => {
    const fetchGlobalAlert = async () => {
      try {
        const docRef = doc(db, 'settings', 'announcement');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()?.text) {
          setGlobalAlert(docSnap.data().text);
        } else {
          setGlobalAlert(fallbackAlertText);
        }
      } catch (error) {
        console.error("Error fetching global alert in admin:", error);
        setGlobalAlert(fallbackAlertText);
      }
    };
    fetchGlobalAlert();
  }, []);

  const handleSaveAlert = async () => {
    setSavingAlert(true);
    try {
      const docRef = doc(db, 'settings', 'announcement');
      await setDoc(docRef, { text: globalAlert }, { merge: true });
      alert("Global alert note saved successfully!");
    } catch (error) {
      console.error("Error saving global alert:", error);
      alert("Failed to save global alert note.");
    } finally {
      setSavingAlert(false);
    }
  };

  const handleResetAlert = () => {
    if (window.confirm("Reset alert text to the default Sinhala instruction note?")) {
      setGlobalAlert(fallbackAlertText);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movieData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCatalog(movieData);
    }, (err) => {
      console.error("Firestore onSnapshot error:", err);
      // Fallback if index isn't ready or failed
      const qSimple = query(collection(db, 'movies'));
      onSnapshot(qSimple, (snapshot) => {
        const movieData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCatalog(movieData);
      });
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addGenre = () => setGenres([...genres, '']);
  const removeGenre = (index) => setGenres(genres.filter((_, i) => i !== index));
  const handleGenreChange = (index, value) => {
    const newGenres = [...genres];
    newGenres[index] = value;
    setGenres(newGenres);
  };

  const handleAddSubtitle = () => {
    if (subInput.label.trim() && subInput.url.trim()) {
      setSubtitles([...subtitles, { label: subInput.label.trim(), url: subInput.url.trim() }]);
      setSubInput({ label: '', url: '' });
    }
  };

  const handleRemoveSubtitle = (index) => {
    setSubtitles(subtitles.filter((_, i) => i !== index));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      year: item.year || '',
      rating: item.rating || '',
      synopsis: item.synopsis || '',
      poster: item.poster || '',
      videoUrl: item.videoUrl || '',
      altVideoUrl: item.altVideoUrl || '',
      imdb_id: item.imdb_id || '',
      tmdb_id: item.tmdb_id || '',
      mal_id: item.mal_id || '',
      sub_url: item.sub_url || '',
      subtitle_url: item.subtitle_url || '',
      type: item.type || 'Movie',
      download_override_url: item.download_override_url || '',
    });
    setGenres(item.genres && item.genres.length > 0 ? item.genres : ['']);
    setSubtitles(item.subtitles || []);
    setSubInput({ label: '', url: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'movies', id));
      } catch (err) {
        console.error("Error deleting movie:", err);
        alert("Error deleting movie. Check console for details.");
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', year: '', rating: '', synopsis: '', poster: '', videoUrl: '', altVideoUrl: '', imdb_id: '', tmdb_id: '', mal_id: '', sub_url: '', subtitle_url: '', type: 'Movie', download_override_url: '' });
    setGenres(['']);
    setSubtitles([]);
    setSubInput({ label: '', url: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let seasons_data = null;
      let extraImdbId = '';

      const isTV = formData.type === 'TV Series' || formData.type === 'TV';
      if (isTV && formData.tmdb_id) {
        try {
          const tmdbId = formData.tmdb_id.trim();
          const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || 'b821ad1cf197f7ed4fcf324e49138c0c';
          const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiODIxYWQxY2YxOTdmN2VkNGZjZjMyNGU0OTEzOGMwYyIsIm5iZiI6MTc4MDg5MDIxMC43Miwic3ViIjoiNmEyNjNhNjJhMDk4M2NmNjg3NWFlNGE4Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.yPorSq3Gj9Gq3M1MUxvfumF1R3KfM9RnMUsxw0JxNtM';
          
          const response = await fetch(
            `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=external_ids`,
            {
              headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_TOKEN}`
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            
            // Build seasons_data: mapping season_number to episode_count
            if (data.seasons && Array.isArray(data.seasons)) {
              seasons_data = {};
              data.seasons.forEach((season) => {
                if (season.season_number > 0) {
                  seasons_data[season.season_number] = season.episode_count;
                }
              });
            }

            // Extract IMDb ID if fetched via external_ids
            if (data.external_ids && data.external_ids.imdb_id) {
              extraImdbId = data.external_ids.imdb_id;
            }
          } else {
            console.error("Failed to fetch TMDB data, status:", response.status);
          }
        } catch (tmdbError) {
          console.error("Error fetching TMDB data:", tmdbError);
        }
      }

      const payload = {
        ...formData,
        subtitle_url: formData.subtitle_url || '',
        imdb_id: formData.imdb_id.trim() || extraImdbId || '',
        genres: genres.filter(g => g !== ''),
        subtitles: subtitles,
        sub_url: subtitles.length > 0 ? subtitles[0].url : formData.sub_url,
      };

      if (seasons_data) {
        payload.seasons_data = seasons_data;
      }

      if (editingId) {
        await updateDoc(doc(db, 'movies', editingId), payload);
      } else {
        await addDoc(collection(db, 'movies'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving movie:", error);
      alert("Error saving movie. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-brand-bg px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center text-brand-accent">
            <Film size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Admin Panel</h1>
            <p className="text-brand-text/40 font-bold uppercase tracking-widest text-sm">
              {editingId ? 'Edit Content Mode' : 'Add New Movie or TV Series'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-brand-card/20 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Movie Title</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="e.g. Inception" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Year</label>
                  <input required name="year" value={formData.year} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Rating</label>
                  <input required name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="8.5" />
                </div>
              </div>
            </div>

            {/* Content Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Content Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all cursor-pointer appearance-none animate-none"
              >
                <option value="Movie" className="bg-brand-bg text-white">Movie</option>
                <option value="TV Series" className="bg-brand-bg text-white">TV Series</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Synopsis / Description</label>
              <textarea required name="synopsis" value={formData.synopsis} onChange={handleChange} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all resize-none placeholder:text-white/10" placeholder="Enter movie description..." />
            </div>
          </div>

          {/* Media Links */}
          <div className="bg-brand-card/20 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Media Assets</h2>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Poster URL</label>
                <input required name="poster" value={formData.poster} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="https://..." />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Server 1 Override URL (Optional)</label>
                  <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="Direct override link (e.g. .mp4)" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Server 2 Custom URL (Optional)</label>
                  <input name="altVideoUrl" value={formData.altVideoUrl} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="Custom Server 2 link (e.g. iframe / Drive)" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">IMDB ID (Player 3)</label>
                  <input name="imdb_id" value={formData.imdb_id} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="tt2527336" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">TMDB ID (TV Series Auto-Sync)</label>
                  <input name="tmdb_id" value={formData.tmdb_id || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="e.g. 1399" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">MyAnimeList (MAL) ID</label>
                  <input name="mal_id" value={formData.mal_id} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="e.g. 5114" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Custom Download URL (Optional)</label>
                  <input name="download_override_url" value={formData.download_override_url} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="https://... (Direct override link for downloads)" />
                </div>
              </div>

              {/* Subtitles Manager */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-brand-text/40 uppercase tracking-widest">Subtitles Manager</h3>
                  <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-wider">{subtitles.length} Subtitles Added</span>
                </div>
                
                {/* Temporary Subtitles List Review */}
                {subtitles.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-1">
                    {subtitles.map((sub, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-sm">
                        <div className="truncate max-w-[200px] flex flex-col">
                          <span className="font-black text-brand-accent uppercase text-[10px]">{sub.label}</span>
                          <span className="text-white/60 text-xs truncate">{sub.url}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveSubtitle(index)} className="text-white/20 hover:text-red-500 transition-colors p-1 cursor-pointer">
                          <Minus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtitle Form Inputs */}
                <div className="grid sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">Label</label>
                    <input type="text" value={subInput.label} onChange={(e) => setSubInput({ ...subInput, label: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="e.g. Episode 01 or Full ZIP" />
                  </div>
                  <div className="sm:col-span-6 space-y-2">
                    <label className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">SRT / ZIP URL</label>
                    <input type="text" value={subInput.url} onChange={(e) => setSubInput({ ...subInput, url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="https://.../sub.srt" />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="button" onClick={handleAddSubtitle} className="w-full bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-brand-bg py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-brand-accent/20 cursor-pointer">
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Subtitle URL */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Custom Subtitle URL (e.g., Dropbox link with raw=1)</label>
                  <input
                    name="subtitle_url"
                    value={formData.subtitle_url}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10"
                    placeholder="https://dl.dropboxusercontent.com/.../subtitle.vtt?raw=1"
                  />
                </div>
              </div>
              
              <p className="text-[10px] text-brand-text/30 font-bold tracking-wider uppercase">Server 1: Auto-generated (Vidsrc.me) | Server 2: Auto-generated (Vidsrc.to / CC for Anime) | Subtitles: Multiple SRTs/ZIPs</p>
            </div>
          </div>

          {/* Dynamic Genres */}
          <div className="bg-brand-card/20 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Genres</h2>
              <button type="button" onClick={addGenre} className="text-brand-accent flex items-center gap-1 text-xs font-black hover:scale-105 transition-all cursor-pointer">
                <Plus size={16} /> ADD GENRE
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {genres.map((genre, index) => (
                <div key={index} className="relative group">
                  <input value={genre} onChange={(e) => handleGenreChange(index, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all pr-10 placeholder:text-white/10" placeholder="e.g. Sci-Fi" />
                  {genres.length > 1 && (
                    <button type="button" onClick={() => removeGenre(index)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-colors cursor-pointer">
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {editingId && (
              <button type="button" onClick={resetForm} className="w-full sm:w-1/3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-6 rounded-[2rem] font-black text-lg tracking-[0.2em] transition-all cursor-pointer">
                CANCEL EDIT
              </button>
            )}
            <button type="submit" disabled={loading} className={`${editingId ? 'w-full sm:w-2/3' : 'w-full'} bg-brand-accent text-brand-bg py-6 rounded-[2rem] font-black text-lg tracking-[0.2em] hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[0_20px_40px_rgba(0,242,255,0.2)] cursor-pointer`}>
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-bg"></div>
              ) : success ? (
                <><CheckCircle2 size={24} /> {editingId ? 'UPDATED SUCCESSFULLY!' : 'PUBLISHED SUCCESSFULLY!'}</>
              ) : (
                <><Send size={20} /> {editingId ? 'UPDATE CONTENT' : 'PUBLISH CONTENT'}</>
              )}
            </button>
          </div>
        </form>

        {/* Global Alert Note Management */}
        <div className="mt-12 bg-brand-card/20 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Global Alert Note Management</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Global Alert Text</label>
              <textarea 
                value={globalAlert} 
                onChange={(e) => setGlobalAlert(e.target.value)} 
                rows={4} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all resize-none placeholder:text-white/10" 
                placeholder="Enter global alert text..." 
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={handleSaveAlert} 
                disabled={savingAlert}
                className="bg-brand-accent text-brand-bg px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-white hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingAlert ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand-bg"></div>
                ) : (
                  'Save Alert Note'
                )}
              </button>
              
              <button 
                type="button" 
                onClick={handleResetAlert}
                className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-white/10 hover:scale-105 transition-all cursor-pointer"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Catalog List section */}
        <div className="mt-16 bg-brand-card/20 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Catalog Management</h2>
            <span className="text-xs text-brand-text/40 font-bold uppercase tracking-widest">{catalog.length} items total</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {catalog.length === 0 ? (
              <div className="text-center py-10 text-brand-text/30 font-bold uppercase tracking-widest text-sm">
                No items in database.
              </div>
            ) : (
              catalog.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-brand-accent/20 rounded-2xl transition-all duration-300 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={item.poster || 'https://via.placeholder.com/150'} alt={item.title} className="w-16 h-20 object-cover rounded-lg border border-white/10 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-white font-black uppercase tracking-wide truncate text-base">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] bg-brand-accent/15 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{item.type}</span>
                        <span className="text-xs text-brand-text/40 font-bold">{item.year}</span>
                        <span className="text-xs text-brand-text/40 font-bold">•</span>
                        <span className="text-xs text-brand-text/40 font-bold">★ {item.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button 
                      type="button" 
                      onClick={() => handleEdit(item)} 
                      className="flex items-center gap-1.5 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-brand-bg px-4 py-2.5 rounded-xl text-xs font-black transition-all border border-brand-accent/20 cursor-pointer"
                    >
                      <Edit size={14} />
                      EDIT
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDelete(item.id, item.title)} 
                      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all border border-red-500/20 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      DELETE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
