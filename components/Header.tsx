import React, { useState, useEffect } from 'react';
import { Search, Menu, X, BarChart2, Sparkles, PawPrint } from 'lucide-react';

interface HeaderProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenStats: () => void;
  onOpenRecommendations: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  searchTerm, 
  onSearchChange,
  onOpenStats,
  onOpenRecommendations
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-background/90 backdrop-blur-xl border-white/5 py-3 shadow-lg' 
          : 'bg-gradient-to-b from-black/80 to-transparent border-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onCategoryChange('All')}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-honey to-accent flex items-center justify-center shadow-lg shadow-honey/20 group-hover:shadow-honey/40 transition-all group-hover:scale-105">
             <PawPrint className="w-5 h-5 text-white fill-white/20" />
          </div>
          <h1 className="hidden sm:block font-display font-bold text-xl tracking-tight text-white/90 group-hover:text-white transition-colors">
            HBS<span className="text-honey font-medium ml-0.5">Reviews</span>
          </h1>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-surface/50 p-1 rounded-full border border-white/5 backdrop-blur-md">
          <button 
            onClick={() => onCategoryChange('All')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              activeCategory === 'All' 
                ? 'bg-primary text-black shadow-lg shadow-primary/25' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
             <button 
             key={cat}
             onClick={() => onCategoryChange(cat)}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              activeCategory === cat 
                ? 'bg-primary text-black shadow-lg shadow-primary/25' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
           >
             {cat}
           </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* Tools (Desktop) */}
          <div className="hidden md:flex items-center gap-3 pr-4 border-r border-white/10">
            <button 
              onClick={onOpenStats} 
              className="p-2 text-gray-400 hover:text-honey hover:bg-honey/10 rounded-full transition-all"
              title="Statistics"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenRecommendations} 
              className="group flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-accent/20 to-honey/20 hover:from-accent/40 hover:to-honey/40 text-honey hover:text-white rounded-full transition-all border border-accent/20"
            >
              <Sparkles className="w-4 h-4 text-accent group-hover:text-white" />
              <span className="text-xs font-bold hidden lg:block text-accent group-hover:text-white">AI Picks</span>
            </button>
          </div>

          {/* Search */}
          <div className={`relative group transition-all duration-300 ${searchTerm ? 'w-48 md:w-64' : 'w-10 md:w-64'}`}>
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-honey transition-colors" />
             </div>
             <input 
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full bg-surface/80 hover:bg-surface focus:bg-surface border border-transparent focus:border-honey/30 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all
                ${!searchTerm && 'cursor-pointer md:cursor-text bg-transparent hover:bg-surface/50'}
              `}
             />
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-white bg-white/5 rounded-full" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 p-4 shadow-2xl animate-fade-in-up">
           <div className="flex flex-col gap-2">
             <button 
                onClick={() => { onCategoryChange('All'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-lg text-sm font-bold text-left ${activeCategory === 'All' ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}
              >
                All Reviews
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => { onCategoryChange(cat); setMobileMenuOpen(false); }}
                  className={`p-3 rounded-lg text-sm font-bold text-left ${activeCategory === cat ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}
                >
                  {cat}
                </button>
              ))}
              <div className="h-[1px] bg-white/10 my-2"></div>
               <button 
                onClick={() => { onOpenStats(); setMobileMenuOpen(false); }}
                className="p-3 rounded-lg text-sm font-bold text-left text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3"
              >
                <BarChart2 className="w-4 h-4" /> Statistics
              </button>
               <button 
                onClick={() => { onOpenRecommendations(); setMobileMenuOpen(false); }}
                className="p-3 rounded-lg text-sm font-bold text-left text-accent hover:bg-accent/10 flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4" /> AI Recommendations
              </button>
           </div>
        </div>
      )}
    </header>
  );
};

export default Header;