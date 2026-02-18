import React, { useState, useEffect } from 'react';
import { Search, Menu, X, BarChart2 } from 'lucide-react';

interface HeaderProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenStats: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  searchTerm, 
  onSearchChange,
  onOpenStats,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[40] transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-2' 
          : 'bg-gradient-to-b from-black via-black/80 to-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onCategoryChange('All')}>
          <h1 className="font-display font-black text-xl tracking-tight text-white transition-colors">
            HBS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Reviews</span>
          </h1>
        </div>

        {/* Desktop Nav - Pill Style */}
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => onCategoryChange('All')}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
              activeCategory === 'All' 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
             <button 
             key={cat}
             onClick={() => onCategoryChange(cat)}
             className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
              activeCategory === cat 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
           >
             {cat}
           </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Stats Button */}
          <button 
            onClick={onOpenStats} 
            className="hidden md:flex items-center justify-center w-8 h-8 text-zinc-400 hover:text-honey hover:bg-white/5 rounded-full transition-all"
            title="Statistics"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className={`relative group transition-all duration-300 ${searchTerm ? 'w-48 md:w-56' : 'w-8 md:w-56'}`}>
             <div className="absolute inset-y-0 left-0 flex items-center justify-center w-8 pointer-events-none">
                <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-white transition-colors" />
             </div>
             <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full bg-transparent md:bg-white/5 focus:bg-white/10 border border-transparent md:border-white/10 focus:border-white/20 rounded-full py-1.5 pl-8 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all
                ${!searchTerm && 'cursor-pointer md:cursor-text opacity-0 md:opacity-100'}
              `}
             />
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-300 hover:text-white bg-white/5 rounded-full" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 animate-fade-in shadow-2xl">
           <div className="flex flex-col gap-2">
             <button 
                onClick={() => { onCategoryChange('All'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-lg text-sm font-bold text-left ${activeCategory === 'All' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
              >
                All Reviews
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => { onCategoryChange(cat); setMobileMenuOpen(false); }}
                  className={`p-3 rounded-lg text-sm font-bold text-left ${activeCategory === cat ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                >
                  {cat}
                </button>
              ))}
              <div className="h-[1px] bg-white/5 my-2"></div>
               <button 
                onClick={() => { onOpenStats(); setMobileMenuOpen(false); }}
                className="p-3 rounded-lg text-sm font-bold text-left text-zinc-400 hover:text-white flex items-center gap-3"
              >
                <BarChart2 className="w-4 h-4" /> Statistics
              </button>
           </div>
        </div>
      )}
    </header>
  );
};

export default Header;