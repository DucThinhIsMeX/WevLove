import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Map from './components/Map';
import Admin from './components/Admin';
import { initData } from './data/mockData';
import { Settings } from 'lucide-react';

const MainPage = () => (
  <>
    {/* Admin Link Floating Button */}
    <Link to="/admin" className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur p-2 rounded-full shadow hover:bg-rose-50 text-rose-500 transition-colors" title="Quản lý trang">
      <Settings className="w-5 h-5" />
    </Link>

    <Hero />
    <Timeline />
    <Map />
    
    {/* Footer */}
    <footer className="py-8 bg-pink-50 text-center border-t border-pink-100">
      <p className="text-rose-400 font-medium text-sm">
        Made with <span className="text-rose-500 animate-pulse inline-block">❤️</span> for you
      </p>
      <p className="text-gray-400 text-xs mt-2">© 2024 Our Love Story</p>
    </footer>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <div className="font-sans antialiased text-gray-900 min-h-screen selection:bg-rose-200 selection:text-rose-900">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
