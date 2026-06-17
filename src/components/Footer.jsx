import { Link } from 'react-router-dom';

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

const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/5 bg-brand-bg md:bg-brand-bg/50 md:backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Join Our Community Section */}
        <div className="mb-10 max-w-2xl mx-auto p-6 md:p-8 rounded-[2rem] bg-slate-950/40 backdrop-blur-md border border-white/5 shadow-[0_0_30px_rgba(139,92,246,0.08)] hover:border-white/10 transition-all duration-300 text-center space-y-6">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              Join Our Community
            </h3>
            <p className="text-xs text-brand-text/40 font-bold uppercase tracking-widest mt-2">
              Get the latest updates & requests directly
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://chat.whatsapp.com/EHzc2FxG9uV0Foq6Eyhq5r?s=cl&p=a&mlu=2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(37,211,102,0.15)] hover:shadow-[0_0_25px_rgba(37,211,102,0.35)] hover:scale-105"
            >
              <WhatsAppIcon className="w-4.5 h-4.5" />
              WhatsApp Group
            </a>
            <a
              href="https://t.me/streamverseWS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20 hover:bg-[#0088cc] hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,136,204,0.15)] hover:shadow-[0_0_25px_rgba(0,136,204,0.35)] hover:scale-105"
            >
              <TelegramIcon className="w-4.5 h-4.5" />
              Telegram Channel
            </a>
          </div>
        </div>

        {/* copyright */}
        <div className="text-center">
          <p className="text-brand-text/30 text-xs font-semibold uppercase tracking-widest">
            © 2026 StreamVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
