import React, { useEffect, useState } from 'react';
import { Review } from '../types';
import { X, Star, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface ReviewModalProps {
  review: Review | null;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ review, onClose }) => {
  // State for tracking expanded season rows
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    if (review) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [review, onClose]);

  // Reset season expansion when review changes
  useEffect(() => {
    setExpandedSeason(null);
  }, [review]);

  if (!review) return null;

  // Helper to get score aesthetics based on Green -> Red scale
  const getScoreInfo = (score: number) => {
    if (score >= 9) return { color: 'text-green-400', label: 'Masterpiece', bg: 'bg-green-500/10 border-green-500/20' };
    if (score >= 8) return { color: 'text-emerald-400', label: 'Excellent', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 7) return { color: 'text-lime-400', label: 'Great', bg: 'bg-lime-500/10 border-lime-500/20' };
    if (score >= 6) return { color: 'text-yellow-400', label: 'Good', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    if (score >= 5) return { color: 'text-amber-400', label: 'Okay', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (score >= 4) return { color: 'text-orange-400', label: 'Mediocre', bg: 'bg-orange-500/10 border-orange-500/20' };
    if (score >= 3) return { color: 'text-orange-600', label: 'Bad', bg: 'bg-orange-600/10 border-orange-600/20' };
    return { color: 'text-red-500', label: 'Avoid', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const scoreInfo = review.averageScore !== null ? getScoreInfo(review.averageScore) : null;
  const hasSeasons = review.seasons && review.seasons.length > 0;

  const toggleSeason = (id: string) => {
    if (expandedSeason === id) setExpandedSeason(null);
    else setExpandedSeason(id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-in slide-in-from-bottom-8 zoom-in-95 duration-300 ring-1 ring-white/10">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Poster Side */}
        <div className="hidden md:block w-5/12 relative bg-zinc-900">
          <div className="absolute inset-0">
             <img 
                src={review.image || `https://picsum.photos/seed/${review.id}/600/900`} 
                alt={review.title}
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-950/20 to-zinc-950" />
          </div>
        </div>

        {/* Mobile Banner Image */}
        <div className="md:hidden h-48 w-full relative shrink-0">
           <img 
            src={review.image || `https://picsum.photos/seed/${review.id}/600/900`} 
            alt={review.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>

        {/* Content Side */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative z-10">
           
           {/* Header Info */}
           <div className="mb-10">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                <span className="px-3 py-1 bg-white/5 rounded-md border border-white/10 text-white shadow-sm">{review.category}</span>
                {review.year && <span>{review.year}</span>}
                {hasSeasons && <span className="text-accent">{review.seasons!.length} Seasons</span>}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-2 leading-none tracking-tight">
                {review.title}
              </h2>
              
              {review.creator && (
                  <div className="flex items-center text-zinc-400 font-medium text-lg">
                      <span className="text-primary mr-2">By</span> {review.creator}
                  </div>
              )}
           </div>

           {/* Stats Row */}
           <div className="flex flex-wrap gap-4 mb-12">
              {review.averageScore !== null && scoreInfo && (
                 <div className={`flex items-center gap-4 ${scoreInfo.bg} px-5 py-3 rounded-2xl border`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Avg Score</span>
                      <span className={`text-4xl font-display font-black ${scoreInfo.color}`}>{review.averageScore}</span>
                    </div>
                    {/* Verdict Label */}
                    <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                    <span className={`text-sm font-bold uppercase tracking-widest ${scoreInfo.color}`}>
                      {scoreInfo.label}
                    </span>
                 </div>
              )}
              
              <div className="flex gap-3">
                  <div className="flex flex-col justify-center items-center bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5 min-w-[100px]">
                        <span className="text-[10px] font-bold uppercase text-honey tracking-wider mb-1">Honeybear</span>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-display font-bold text-white">{review.honeybearScore ?? '-'}</span>
                            <Star className="w-3 h-3 fill-honey text-honey" />
                        </div>
                  </div>

                  <div className="flex flex-col justify-center items-center bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5 min-w-[100px]">
                        <span className="text-[10px] font-bold uppercase text-bean tracking-wider mb-1">Jellybean</span>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-display font-bold text-white">{review.jellybeanScore ?? '-'}</span>
                            <Star className="w-3 h-3 fill-bean text-bean" />
                        </div>
                  </div>
              </div>
           </div>

           {/* Review Text */}
           <div className="space-y-12 mb-16">
              {review.honeybearReview && (
                  <div className="group">
                      <h3 className="text-honey font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-6 h-[2px] bg-honey rounded-full"></span>
                        Honeybear's Take
                      </h3>
                      <p className="text-zinc-300 text-lg leading-relaxed font-sans font-light border-l-2 border-honey/20 pl-6">
                          {review.honeybearReview}
                      </p>
                  </div>
              )}

              {review.jellybeanReview && (
                  <div className="group">
                      <h3 className="text-bean font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                         <span className="w-6 h-[2px] bg-bean rounded-full"></span>
                         Jellybean's Take
                      </h3>
                      <p className="text-zinc-300 text-lg leading-relaxed font-sans font-light border-l-2 border-bean/20 pl-6">
                          {review.jellybeanReview}
                      </p>
                  </div>
              )}

              {(!review.jellybeanReview && !review.honeybearReview) && (
                 <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-600 font-sans italic">
                    No summary review available for the overall series. Check season breakdowns below.
                 </div>
              )}
           </div>

           {/* Seasons Breakdown Table */}
           {hasSeasons && (
             <div className="animate-in fade-in duration-500">
               <div className="flex items-center gap-4 mb-6">
                 <h3 className="text-xl font-bold text-white uppercase tracking-tight">Season Breakdown</h3>
                 <div className="h-[1px] flex-1 bg-white/10"></div>
               </div>
               
               <div className="flex flex-col gap-3">
                 {review.seasons!.map((season) => (
                   <div key={season.id} className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                     <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => toggleSeason(season.id)}
                     >
                        <div className="flex items-center gap-4">
                           <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                             {season.seasonNumber}
                           </span>
                           <span className="font-bold text-gray-200">Season {season.seasonNumber}</span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="flex items-center gap-2" title="Honeybear Score">
                              <Star className="w-3 h-3 text-honey fill-honey" />
                              <span className="font-bold text-honey">{season.honeybearScore ?? '-'}</span>
                           </div>
                           <div className="flex items-center gap-2" title="Jellybean Score">
                              <Star className="w-3 h-3 text-bean fill-bean" />
                              <span className="font-bold text-bean">{season.jellybeanScore ?? '-'}</span>
                           </div>
                           <div className={`px-2 py-1 rounded text-xs font-bold w-12 text-center ${getScoreInfo(season.averageScore || 0).bg} ${getScoreInfo(season.averageScore || 0).color}`}>
                              {season.averageScore ?? '-'}
                           </div>
                           {expandedSeason === season.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </div>
                     </div>
                     
                     {/* Expanded Season Details */}
                     {expandedSeason === season.id && (
                       <div className="px-6 pb-6 pt-2 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid md:grid-cols-2 gap-6 mt-2">
                             {season.honeybearReview && (
                               <div>
                                  <span className="text-[10px] uppercase font-bold text-honey mb-1 block">Honeybear</span>
                                  <p className="text-sm text-gray-400 leading-relaxed">{season.honeybearReview}</p>
                               </div>
                             )}
                             {season.jellybeanReview && (
                               <div>
                                  <span className="text-[10px] uppercase font-bold text-bean mb-1 block">Jellybean</span>
                                  <p className="text-sm text-gray-400 leading-relaxed">{season.jellybeanReview}</p>
                               </div>
                             )}
                             {(!season.honeybearReview && !season.jellybeanReview) && (
                               <p className="text-sm text-gray-600 italic col-span-2">No written notes for this season.</p>
                             )}
                          </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Footer Metadata */}
           <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-6 text-xs text-zinc-500 font-bold uppercase tracking-wider">
               {review.dateWatched && (
                   <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-zinc-600" /> 
                       <span>Watched {review.dateWatched}</span>
                   </div>
               )}
               {review.tags.length > 0 && (
                   <div className="flex items-center gap-2">
                       <Tag className="w-4 h-4 text-zinc-600" /> 
                       <span>{review.tags.join(', ')}</span>
                   </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;