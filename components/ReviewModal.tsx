import React, { useEffect, useState } from 'react';
import { Review } from '../types';
import { X, Star, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface ReviewModalProps {
  review: Review | null;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ review, onClose }) => {
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    if (review) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [review]);

  // Reset season view on open
  useEffect(() => {
    if (review) setExpandedSeason(null);
  }, [review]);

  const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
          setIsClosing(false);
          onClose();
      }, 300); // Match animation duration
  }

  if (!review) return null;

  const score = review.averageScore || 0;
  
  // Revised Gradient Logic v8
  let hue = 0;
  let sat = 85;
  let light = 55; // Default text lightness

  if (score >= 9) {
      hue = 130 + ((score - 9) * 15); 
  } else if (score >= 8) {
      hue = 85 + ((score - 8) * 40); 
  } else if (score >= 7) {
      hue = 60 + ((score - 7) * 22);
  } else if (score >= 6) {
      // 6.0 -> 42 (Gold/Amber), 6.9 -> 58 (Yellow-Gold)
      hue = 42 + ((score - 6) * 18); 
  } else if (score >= 5) {
      // 5.0 -> 24 (Red-Orange), 5.9 -> 36.6 (Rich Orange)
      hue = 24 + ((score - 5) * 14);
  } else if (score >= 4) {
      hue = 10;
  } else {
      hue = 0;
      light = 45; // Darker red for text
  }
    
  const scoreColor = `hsl(${hue}, ${sat}%, ${light}%)`;
  
  const hasSeasons = review.seasons && review.seasons.length > 0;

  const toggleSeason = (id: string) => {
    if (expandedSeason === id) setExpandedSeason(null);
    else setExpandedSeason(id);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
        onClick={handleClose}
      />

      <div 
        className={`relative w-full max-w-5xl bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col md:flex-row ring-1 ring-white/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-in zoom-in-95 slide-in-from-bottom-4'}`}
      >
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster Side */}
        <div className="hidden md:block w-[40%] relative bg-zinc-900 group">
          <div className="absolute inset-0">
             <img 
                src={review.image || `https://picsum.photos/seed/${review.id}/600/900`} 
                alt={review.title}
                className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
             />
             {/* Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950" />
          </div>
          
          {/* Poster Content */}
          <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                      <span className="font-display font-black text-3xl" style={{ color: scoreColor }}>{review.averageScore}</span>
                  </div>
                  <div className="flex flex-col drop-shadow-md">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-300">Avg Score</span>
                      <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i <= Math.round(score/2) ? 'fill-honey text-honey' : 'fill-white/10 text-white/10'}`} 
                              />
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* Mobile Banner Image */}
        <div className="md:hidden h-56 w-full relative shrink-0">
           <img 
            src={review.image || `https://picsum.photos/seed/${review.id}/600/900`} 
            alt={review.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>

        {/* Content Side */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-zinc-950 flex flex-col">
           <div className="p-8 md:p-10 flex-1">
                {/* Header Info */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                        <span className="text-zinc-300 bg-white/5 px-2 py-0.5 rounded">{review.category}</span>
                        <span>{review.year}</span>
                        {review.creator && (
                            <>
                                <span>&bull;</span>
                                <span className="text-zinc-400">By {review.creator}</span>
                            </>
                        )}
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                        {review.title}
                    </h2>

                    {/* Breakdown Scores */}
                    <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex-1 flex flex-col items-center border-r border-white/10">
                            <span className="text-[10px] font-bold uppercase text-honey tracking-widest mb-1">Honeybear</span>
                            <span className="text-3xl font-display font-bold text-white">{review.honeybearScore ?? '-'}</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                            <span className="text-[10px] font-bold uppercase text-bean tracking-widest mb-1">Jellybean</span>
                            <span className="text-3xl font-display font-bold text-white">{review.jellybeanScore ?? '-'}</span>
                        </div>
                    </div>
                </div>
                
                {/* Synopsis */}
                {review.synopsis && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-3 opacity-50">
                            <BookOpen className="w-4 h-4 text-white" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white">Synopsis</span>
                        </div>
                        <p className="text-zinc-300 text-lg leading-relaxed italic font-light border-l-4 border-white/10 pl-4">
                            {review.synopsis}
                        </p>
                    </div>
                )}

                {/* Reviews */}
                <div className="space-y-10">
                    {review.honeybearReview && (
                        <div className="relative animate-in slide-in-from-right-4 duration-500 delay-100">
                            <h3 className="text-honey text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                Honeybear's Take
                            </h3>
                            <p className="text-zinc-200 text-base font-normal leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                                {review.honeybearReview}
                            </p>
                        </div>
                    )}

                    {review.jellybeanReview && (
                        <div className="relative animate-in slide-in-from-right-4 duration-500 delay-200">
                            <h3 className="text-bean text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                Jellybean's Take
                            </h3>
                            <p className="text-zinc-200 text-base font-normal leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                                {review.jellybeanReview}
                            </p>
                        </div>
                    )}
                </div>

                {/* Seasons */}
                {hasSeasons && (
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4 px-3">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Seasons</h3>
                            <div className="flex gap-4 text-xs font-black uppercase tracking-wider pr-8">
                                <span className="text-honey w-8 text-center" title="Honeybear Score">HB</span>
                                <span className="text-bean w-8 text-center" title="Jellybean Score">JB</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {review.seasons!.map(season => {
                                // Check if this season has any written content
                                const hasComments = (season.honeybearReview && season.honeybearReview.trim().length > 0) || 
                                                    (season.jellybeanReview && season.jellybeanReview.trim().length > 0);
                                
                                return (
                                <div key={season.id} className="bg-zinc-900/50 rounded-lg border border-white/5 overflow-hidden transition-all duration-200 hover:border-white/10">
                                    <div 
                                        onClick={hasComments ? () => toggleSeason(season.id) : undefined}
                                        className={`w-full flex items-center justify-between p-3 transition-colors ${hasComments ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-zinc-300">
                                                {season.seasonNumber}
                                            </span>
                                            <span className="text-sm font-bold text-zinc-200">Season {season.seasonNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-honey font-bold w-8 text-center">{season.honeybearScore ?? '-'}</span>
                                            <span className="text-bean font-bold w-8 text-center">{season.jellybeanScore ?? '-'}</span>
                                            <div className="w-4 flex items-center justify-center">
                                                {hasComments && (
                                                    <div className={`transition-transform duration-300 ${expandedSeason === season.id ? 'rotate-180' : ''}`}>
                                                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {hasComments && expandedSeason === season.id && (
                                        <div className="p-4 bg-black/20 text-sm text-zinc-400 border-t border-white/5 grid md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                            {season.honeybearReview && <div><span className="text-honey text-xs font-bold block mb-1">HB:</span> {season.honeybearReview}</div>}
                                            {season.jellybeanReview && <div><span className="text-bean text-xs font-bold block mb-1">JB:</span> {season.jellybeanReview}</div>}
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;