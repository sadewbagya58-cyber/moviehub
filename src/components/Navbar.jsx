import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/?type=Movie' },
    { name: 'TV Series', href: '/?type=TV' },
    { name: 'Trending', href: '/?sort=trending' },
  ];

  const handleSearch = (e) => {
    const term = e.target.value;
    if (term) {
      navigate(`/?q=${encodeURIComponent(term)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-bg/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-brand-accent drop-shadow-[0_0_8px_rgba(0,242,255,0.5)] cursor-pointer">
              StreamVerse
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-brand-text/80 hover:text-brand-accent transition-colors duration-200 font-medium text-sm tracking-wide"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section: Search & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex relative items-center">
              <input
                type="text"
                value={currentQuery}
                onChange={handleSearch}
                placeholder="Search movies, cast, genres..."
                className="bg-brand-card/50 border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:border-brand-accent/50 w-48 lg:w-64 transition-all duration-300 focus:w-72 text-brand-text"
              />
              <Search className="absolute right-3 w-4 h-4 text-brand-text/50" />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-brand-text hover:text-brand-accent focus:outline-none transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 transition-all duration-300 ease-in-out border-b border-white/10 shadow-2xl ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 py-6 space-y-4 bg-brand-bg/95 backdrop-blur-3xl">
          <div className="mb-6">
            <div className="relative flex items-center">
              <input
                type="text"
                value={currentQuery}
                onChange={(e) => { handleSearch(e); setIsOpen(false); }}
                placeholder="Search movies, cast, genres..."
                className="bg-brand-card/50 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-brand-accent/50 w-full text-brand-text shadow-inner"
              />
              <Search className="absolute right-4 w-5 h-5 text-brand-accent/70" />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-4 py-3 text-lg font-black tracking-widest uppercase text-brand-text/80 hover:text-brand-accent hover:bg-brand-accent/10 rounded-xl transition-all border border-transparent hover:border-brand-accent/20"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
