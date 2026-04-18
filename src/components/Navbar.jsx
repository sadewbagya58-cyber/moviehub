import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Movies', href: '#' },
    { name: 'TV Series', href: '#' },
    { name: 'Trending', href: '#' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-bg/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-black tracking-tighter text-brand-accent drop-shadow-[0_0_8px_rgba(0,242,255,0.5)] cursor-pointer">
              MOVIEHUB
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-brand-text/80 hover:text-brand-accent transition-colors duration-200 font-medium text-sm tracking-wide"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Section: Search & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex relative items-center">
              <input
                type="text"
                placeholder="Search movies..."
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
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-brand-bg/95 backdrop-blur-lg border-b border-white/10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block px-3 py-2 text-base font-medium text-brand-text hover:text-brand-accent hover:bg-white/5 rounded-md transition-all"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="px-3 py-2 sm:hidden">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="bg-brand-card/50 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-brand-accent/50 w-full text-brand-text"
              />
              <Search className="absolute right-3 w-4 h-4 text-brand-text/50" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
