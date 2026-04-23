import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text overflow-x-hidden">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        
        <footer className="py-12 border-t border-white/5 bg-brand-bg/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-brand-text/30 text-sm">© 2026 Movie Hub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
