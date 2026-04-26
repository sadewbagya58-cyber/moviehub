import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Minus, Send, CheckCircle2, Film } from 'lucide-react';

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
    sub_url: '',
    type: 'Movie',
  });

  const [genres, setGenres] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'movies'), {
        ...formData,
        genres: genres.filter(g => g !== ''),
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({ title: '', year: '', rating: '', synopsis: '', poster: '', videoUrl: '', altVideoUrl: '', imdb_id: '', sub_url: '', type: 'Movie' });
      setGenres(['']);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding movie:", error);
      alert("Error adding movie. Check console for details.");
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
            <p className="text-brand-text/40 font-bold uppercase tracking-widest text-sm">Add New Movie or TV Series</p>
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all cursor-pointer appearance-none"
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
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Video URL (Player 1)</label>
                  <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="Direct video link (e.g. .mp4)" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Alt Video URL (Player 2)</label>
                  <input name="altVideoUrl" value={formData.altVideoUrl} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="Iframe/Drive link" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">IMDB ID (Player 3)</label>
                  <input name="imdb_id" value={formData.imdb_id} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="tt2527336" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-text/40 uppercase tracking-widest">Subtitle URL (.srt)</label>
                  <input name="sub_url" value={formData.sub_url} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all placeholder:text-white/10" placeholder="https://.../sub.srt" />
                </div>
              </div>
              <p className="text-[10px] text-brand-text/30 font-bold tracking-wider uppercase">Player 1: Direct MP4 | Player 2: External Embeds | Player 3: Auto-generated | Subtitles: Self-hosted .srt</p>

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
                  <input value={genre} onChange={(e) => handleGenreChange(index, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white border focus:border-brand-accent outline-none transition-all pr-10 placeholder:text-white/10" placeholder="e.g. Sci-Fi" />
                  {genres.length > 1 && (
                    <button type="button" onClick={() => removeGenre(index)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-colors cursor-pointer">
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

 


          <button type="submit" disabled={loading} className="w-full bg-brand-accent text-brand-bg py-6 rounded-[2rem] font-black text-lg tracking-[0.2em] hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[0_20px_40px_rgba(0,242,255,0.2)] cursor-pointer">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-bg"></div>
            ) : success ? (
              <><CheckCircle2 size={24} /> PUBLISHED SUCCESSFULLY!</>
            ) : (
              <><Send size={20} /> PUBLISH CONTENT</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
