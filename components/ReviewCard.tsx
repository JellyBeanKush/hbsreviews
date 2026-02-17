import React from 'react';
import { Review, SortOption } from '../types';

interface ReviewCardProps {
  review: Review;
  sortOption: SortOption;
  onClick: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, sortOption, onClick }) => {
  
  // Logic to determine which score and style to use
  let scoreDisplay: number | null = review.averageScore;
  let badgeStyle = '';

  // Green -> Red Scale for Standard Average
  const getStandardBadgeStyle = (score: number) => {
    // 9-10: Bright Green
    if (score >= 9) return 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.6)]'; 
    // 8-9: Emerald
    if (score >= 8) return 'bg-emerald-600 text-white'; 
    // 7-8: Lime
    if (score >= 7) return 'bg-lime-600 text-white'; 
    // 6-7: Yellow - Use black text for contrast
    if (score >= 6) return 'bg-yellow-400 text-black font-extrabold'; 
    // 5-6: Amber - Use black text for contrast
    if (score >= 5) return 'bg-amber-400 text-black font-extrabold'; 
    // 4-5: Orange
    if (score >= 4) return 'bg-orange-500 text-white'; 
    // 3-4: Dark Orange
    if (score >= 3) return 'bg-orange-700 text-white'; 
    // < 3: Red
    return 'bg-red-700 text-white shadow-[0_0_15px_rgba(185,28,28,0.6)]'; 
  };

  if (sortOption === 'hb-desc') {
    scoreDisplay = review.honeybearScore;
    // Honeybear styling (Amber/Honey)
    badgeStyle = 'bg-honey text-black font-black shadow-[0_0_15px_rgba(251,191,36,0.6)] ring-2 ring-black/10';
  } else if (sortOption === 'jb-desc') {
    scoreDisplay = review.jellybeanScore;
    // Jellybean styling (Pink/Bean)
    badgeStyle = 'bg-bean text-white font-black shadow-[0_0_15px_rgba(244,114,182,0.6)] ring-2 ring-black/10';
  } else {
    // Default Average
    scoreDisplay = review.averageScore;
    badgeStyle = getStandardBadgeStyle(scoreDisplay || 0);
  }

  return (
    <div 
      className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-zinc-900 ring-1 ring-white/5 hover:ring-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50"
      onClick={onClick}
    >
      {/* Background Image */}
      <img 
        src={review.image || `https://picsum.photos/seed/${review.id}/400/600`} 
        alt={review.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        loading="lazy"
      />
      
      {/* Gradient for Text Legibility (Bottom Only) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top LEFT: Score Badge (Bigger) */}
      {scoreDisplay !== null && (
        <div className="absolute top-3 left-3 z-20">
           <div className={`
             flex items-center justify-center w-12 h-12 rounded-full 
             font-display font-bold text-xl shadow-lg backdrop-blur-sm
             transform transition-transform duration-300 group-hover:scale-110
             ${badgeStyle}
           `}>
             {scoreDisplay}
           </div>
        </div>
      )}

      {/* Bottom Left: Title & Meta Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col justify-end">
        <div className="transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
            {/* Meta Pill */}
            <div className="flex items-center gap-2 mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-sm text-white/90">
                    {review.category}
                 </span>
                 {review.year && <span className="text-[10px] text-gray-300 font-medium">{review.year}</span>}
            </div>

            {/* Title */}
            <h3 className="text-white font-display font-bold text-lg leading-tight drop-shadow-md line-clamp-2 group-hover:text-white transition-colors duration-300">
              {review.title}
            </h3>
        </div>
      </div>

      {/* Hover Overlay: Center Focus */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-[2px] transition-all duration-300 z-10">
           <div className="flex items-center gap-6 transform scale-95 group-hover:scale-100 transition-transform duration-300 delay-75">
                {/* Honeybear */}
                {review.honeybearScore !== null && (
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase text-honey font-bold tracking-widest mb-1">Honey</span>
                        <div className="w-10 h-10 rounded-full bg-honey/10 border-2 border-honey flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                             <span className="text-sm font-black text-white">{review.honeybearScore}</span>
                        </div>
                    </div>
                )}

                 {/* Vertical Divider */}
                 <div className="h-8 w-[1px] bg-white/20"></div>

                 {/* Jellybean */}
                {review.jellybeanScore !== null && (
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase text-bean font-bold tracking-widest mb-1">Jelly</span>
                        <div className="w-10 h-10 rounded-full bg-bean/10 border-2 border-bean flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(244,114,182,0.2)]">
                             <span className="text-sm font-black text-white">{review.jellybeanScore}</span>
                        </div>
                    </div>
                )}
           </div>
      </div>
    </div>
  );
};

export default ReviewCard;