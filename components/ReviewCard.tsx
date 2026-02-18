import React from 'react';
import { Review, SortOption } from '../types';

interface ReviewCardProps {
  review: Review;
  sortOption: SortOption;
  onClick: () => void;
  index: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, sortOption, onClick, index }) => {
  
  // Determine which score to display
  let score = review.averageScore || 0;
  
  if (sortOption === 'hb-desc' && review.honeybearScore !== null) {
    score = review.honeybearScore;
  } else if (sortOption === 'jb-desc' && review.jellybeanScore !== null) {
    score = review.jellybeanScore;
  }
  
  // Revised Gradient Logic v8
  let hue = 0;
  let sat = 85;
  let light = 45;

  if (score >= 9) {
      hue = 130 + ((score - 9) * 15); 
  } else if (score >= 8) {
      hue = 85 + ((score - 8) * 40); 
  } else if (score >= 7) {
      hue = 60 + ((score - 7) * 22);
  } else if (score >= 6) {
      hue = 42 + ((score - 6) * 18); 
  } else if (score >= 5) {
      hue = 24 + ((score - 5) * 14);
  } else if (score >= 4) {
      hue = 10;
  } else {
      hue = 0;
      light = 35; 
  }

  const badgeStyle = {
    backgroundColor: `hsl(${hue}, ${sat}%, ${light}%)`,
    borderColor: `hsl(${hue}, ${sat}%, ${light + 15}%)`,
    boxShadow: `0 0 15px hsla(${hue}, ${sat}%, ${light}%, 0.4)`
  };

  const isBook = review.category.toLowerCase().includes('book');
  const isMusic = review.category.toLowerCase().includes('music');
  const isGame = review.category.toLowerCase().includes('game');

  // Dynamic Aspect Ratio based on Medium
  const getBaseClasses = () => {
    if (isMusic) return 'aspect-square';       // 1:1 for Albums
    if (isGame) return 'aspect-[4/5]';         // 4:5 for Game Cases (Boxier)
    if (isBook) return 'aspect-[1/1.55]';      // ~1:1.55 Trade Paperback
    return 'aspect-[2/3]';                     // 2:3 Standard Poster
  };

  const aspectRatioClass = getBaseClasses();
  // Uniform rounded corners for all card types
  const containerRounding = 'rounded-xl';
  
  // Staggered Animation Delay
  const animationDelay = { animationDelay: `${index * 50}ms` };

  // --- STANDARD CARD RENDERER (Unified for all types) ---
  return (
    <div 
      className={`group relative flex-auto h-64 md:h-[22rem] ${aspectRatioClass} ${containerRounding} overflow-hidden cursor-pointer bg-zinc-900 ring-1 ring-white/10 hover:ring-white/30 transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60 z-10 hover:z-20 animate-enter opacity-0`}
      style={animationDelay}
      onClick={onClick}
    >
      {/* Background Image with Smoother, Moderate Zoom */}
      <img 
        src={review.image || `https://picsum.photos/seed/${review.id}/400/600`} 
        alt={review.title}
        className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 opacity-90 group-hover:opacity-100"
        loading="lazy"
      />
      
      {/* Removed Holographic Sheen to reduce flashiness */}

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
      
      {/* Big Badge: Top Right */}
      {score > 0 && (
        <div className="absolute top-3 right-3 z-20">
           <div 
             className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 font-display font-black text-base md:text-lg tracking-tighter text-white transition-transform duration-500 ease-out group-hover:scale-105 shadow-lg group-hover:shadow-primary/20"
             style={badgeStyle}
           >
             {score}
           </div>
        </div>
      )}

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        
        {/* Meta Line */}
        <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
             <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                {review.category}
             </span>
             {review.year && (
                <span className="text-[10px] font-bold text-white/50">{review.year}</span>
             )}
        </div>

        {/* Title */}
        <h3 className="text-white font-display font-bold text-lg md:text-xl leading-tight drop-shadow-md line-clamp-2 mb-1 transition-colors duration-300 group-hover:text-white group-hover:text-shadow-glow">
          {review.title}
        </h3>

        {/* Small Breakdown (Only visible on hover) */}
        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
           <div className="flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-honey"></span>
                    <span className="text-xs font-bold text-zinc-300">{review.honeybearScore}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-bean"></span>
                    <span className="text-xs font-bold text-zinc-300">{review.jellybeanScore}</span>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;