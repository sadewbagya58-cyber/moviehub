import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const WhatsAppIcon = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    style={{ filter: 'drop-shadow(0 0 8px rgba(37,211,102,0.4))' }}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.48 4.961 1.482 5.485 0 9.948-4.461 9.951-9.94.002-2.653-1.03-5.148-2.907-7.027-1.879-1.879-4.379-2.912-7.036-2.913-5.495 0-9.957 4.463-9.96 9.943-.001 1.792.482 3.543 1.398 5.084L1.22 21.03l5.427-1.425zm11.536-5.221c-.302-.151-1.791-.883-2.068-.984-.277-.101-.479-.151-.68.151-.202.302-.782 1.008-.958 1.21-.177.202-.353.227-.655.076-1.196-.599-2.029-1.096-2.825-2.464-.207-.356.207-.33.593-1.096.06-.121.03-.227-.015-.328-.045-.101-.479-1.159-.656-1.587-.173-.416-.347-.359-.479-.365-.124-.006-.266-.007-.409-.007-.143 0-.377.054-.575.27-.198.216-.757.74-.757 1.804s.774 2.091.883 2.238c.11.147 1.523 2.324 3.69 3.262.516.223.918.356 1.233.456.518.165.99.141 1.362.086.415-.062 1.791-.733 2.043-1.442.252-.709.252-1.316.177-1.442-.075-.126-.277-.202-.579-.353z"/>
  </svg>
);

const TelegramIcon = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    style={{ filter: 'drop-shadow(0 0 8px rgba(0,136,204,0.4))' }}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.2-.02-.08.02-1.29.82-3.65 2.42-.35.24-.66.36-.95.35-.32-.01-.93-.18-1.39-.33-.56-.18-1-.28-.96-.6.02-.16.24-.33.66-.5 2.58-1.12 4.3-1.87 5.17-2.23 2.46-1 2.97-1.18 3.31-1.18.07 0 .24.02.35.1.09.07.12.17.13.26.01.07 0 .15-.01.21z"/>
  </svg>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  // Sync search input if URL changes (e.g. going back/forward)
  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/category/latest-movies' },
    { name: 'TV Series', href: '/category/trending-tv' },
    { name: 'Trending', href: '/category/trending' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-bg md:bg-brand-bg/80 md:backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
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
            
            {/* Desktop Social Icons */}
            <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
              <a
                href="https://chat.whatsapp.com/EHzc2FxG9uV0Foq6Eyhq5r?s=cl&p=a&mlu=2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:scale-110 active:scale-95 transition-all duration-300"
                title="WhatsApp Group"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/streamverseWS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0088cc] hover:scale-110 active:scale-95 transition-all duration-300"
                title="Telegram Channel"
              >
                <TelegramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Section: Search & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSubmit} className="hidden sm:flex relative items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search movies, cast, genres..."
                className="bg-brand-card/50 border border-white/10 rounded-full py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:border-brand-accent/50 w-48 lg:w-64 transition-all duration-300 focus:w-72 text-brand-text"
              />
              <button type="submit" className="absolute right-3 focus:outline-none text-brand-text/50 hover:text-brand-accent transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Mobile Social Icons */}
              <div className="flex items-center space-x-3.5 mr-1">
                <a
                  href="https://chat.whatsapp.com/EHzc2FxG9uV0Foq6Eyhq5r?s=cl&p=a&mlu=2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] active:scale-90 transition-all duration-200"
                  aria-label="WhatsApp Group"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://t.me/streamverseWS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0088cc] active:scale-90 transition-all duration-200"
                  aria-label="Telegram Channel"
                >
                  <TelegramIcon className="w-5 h-5" />
                </a>
              </div>
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
        <div className="px-4 py-6 space-y-4 bg-brand-bg/98">
          <div className="mb-6">
            <form onSubmit={(e) => { handleSubmit(e); setIsOpen(false); }} className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search movies, cast, genres..."
                className="bg-brand-card/50 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-brand-accent/50 w-full text-brand-text shadow-inner"
              />
              <button type="submit" className="absolute right-4 focus:outline-none text-brand-accent/70 hover:text-brand-accent transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
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
