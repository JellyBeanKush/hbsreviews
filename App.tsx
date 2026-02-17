import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Review, ReviewStats, SortOption } from './types';
import { fetchReviews, getStats } from './services/sheetService';
import Header from './components/Header';
import ReviewCard from './components/ReviewCard';
import ReviewModal from './components/ReviewModal';
import StatsView from './components/StatsView';
import RecommendationsView from './components/RecommendationsView';
import { Loader2, AlertCircle, ArrowUpDown, ChevronDown } from 'lucide-react';

function App() {
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('avg-desc');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // View States
  const [showStats, setShowStats] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(24);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchReviews();
        setReviews(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Derived Data
  const categories = useMemo(() => {
    const cats = new Set(reviews.map(r => r.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let result = reviews;

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(r => r.category === activeCategory);
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(lower) || 
        r.category.toLowerCase().includes(lower) ||
        r.tags.some(t => t.toLowerCase().includes(lower)) ||
        (r.creator && r.creator.toLowerCase().includes(lower))
      );
    }

    // Sorting Logic
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case 'latest':
          return 0; // Handled by reverse below
        case 'oldest':
          return 0;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'avg-desc':
          return (b.averageScore || 0) - (a.averageScore || 0);
        case 'jb-desc':
          return (b.jellybeanScore || 0) - (a.jellybeanScore || 0);
        case 'hb-desc':
          return (b.honeybearScore || 0) - (a.honeybearScore || 0);
        case 'year-desc':
          return parseInt(b.year || '0') - parseInt(a.year || '0');
        case 'year-asc':
          return parseInt(a.year || '0') - parseInt(b.year || '0');
        default:
          return 0;
      }
    });

  }, [reviews, activeCategory, searchTerm, sortOption]);

  const finalReviews = useMemo(() => {
    if (sortOption === 'latest') return [...filteredReviews].reverse();
    return filteredReviews;
  }, [filteredReviews, sortOption]);

  const visibleReviews = finalReviews.slice(0, visibleCount);

  const stats: ReviewStats | null = useMemo(() => {
    if (!showStats) return null;
    return getStats(reviews);
  }, [reviews, showStats]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < finalReviews.length) {
           // Small delay to make it feel natural or just distinct
           setTimeout(() => {
             setVisibleCount((prev) => prev + 24);
           }, 100);
        }
      },
      { threshold: 0.1, rootMargin: '100px' } 
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, finalReviews.length]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="animate-pulse font-display font-medium">Loading library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white p-4 text-center">
        <AlertCircle className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Oops! Something went wrong.</h1>
        <p className="text-gray-400 max-w-md mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-white/20 selection:text-white pb-20">
      
      <Header 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => { setActiveCategory(cat); setVisibleCount(24); }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenStats={() => setShowStats(true)}
        onOpenRecommendations={() => setShowRecommendations(true)}
      />

      <main>
        <div className="container mx-auto px-6 pt-32">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/5 pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
                {searchTerm ? 'Search Results' : (activeCategory === 'All' ? 'Library' : activeCategory)}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <span>{finalReviews.length} Titles</span>
                {searchTerm && <span>&bull; Found matching "{searchTerm}"</span>}
              </div>
            </div>

            {/* Modern Sort Dropdown */}
            <div className="relative group">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 hover:border-white/20 transition-all shadow-sm">
                <ArrowUpDown className="w-4 h-4 text-gray-500 mr-3" />
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-transparent text-sm font-medium text-white appearance-none outline-none cursor-pointer pr-8 w-full md:w-auto"
                >
                  <option value="avg-desc" className="bg-zinc-900">Highest Score</option>
                  <option value="latest" className="bg-zinc-900">Recently Added</option>
                  <option value="oldest" className="bg-zinc-900">Oldest Added</option>
                  <option value="hb-desc" className="bg-zinc-900">Honeybear's Favorites</option>
                  <option value="jb-desc" className="bg-zinc-900">Jellybean's Favorites</option>
                  <option value="year-desc" className="bg-zinc-900">Newest Release</option>
                  <option value="year-asc" className="bg-zinc-900">Oldest Release</option>
                  <option value="title-asc" className="bg-zinc-900">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {finalReviews.length === 0 ? (
             <div className="py-32 text-center text-gray-500">
                <p className="text-lg">No reviews found matching your criteria.</p>
                <button onClick={() => {setSearchTerm(''); setActiveCategory('All');}} className="mt-4 text-white underline">Clear Filters</button>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                {visibleReviews.map(review => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onClick={() => setSelectedReview(review)} 
                    sortOption={sortOption}
                  />
                ))}
              </div>

              {visibleCount < finalReviews.length && (
                <div ref={loaderRef} className="flex justify-center mt-12 py-8 w-full">
                    <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 py-12 border-t border-white/5 bg-black/20 text-center">
        <p className="text-gray-500 text-sm font-medium">HBS Reviews &copy; {new Date().getFullYear()}</p>
        <p className="mt-2 text-xs text-gray-600">Built with Gemini, React & Google Sheets</p>
      </footer>

      {/* Modals */}
      <ReviewModal 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
      />

      {showStats && stats && (
        <StatsView 
           stats={stats} 
           data={reviews}
           onClose={() => setShowStats(false)} 
        />
      )}

      {showRecommendations && (
        <RecommendationsView 
          reviews={reviews}
          onClose={() => setShowRecommendations(false)}
        />
      )}

    </div>
  );
}

export default App;