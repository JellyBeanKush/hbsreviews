import React from 'react';
import { Review, SortOption } from '../types';

interface ReviewCardProps {
  review: Review;
  sortOption: SortOption;
  onClick: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, sortOption, onClick }) => {
  
  // Determine which score to display
  let score = review.averageScore || 0;
  
  if (sortOption === 'hb-desc' && review.honeybearScore !== null) {
    score = review.honeybearScore;
  } else if (sortOption === 'jb-desc' && review.jellybeanScore !== null) {
    score = review.jellybeanScore;
  }
  
  // Revised Gradient Logic v4 - "Green with a hint of blue"
  // 9.0+: 135 (Neon Green) -> 145 (Spring Green). Avoids 150+ (Teal/Blue).
  // 8.0-8.9: 90 (Lime) -> 125 (True Green).
  // 7.0-7.9: 55 (Gold) -> 85 (Lime).
  // 6.0-6.9: 35 (Orange) -> 50 (Golden Orange).
  // 5.0-5.9: 20 (Rust) -> 30 (Orange).
  // 4.0-4.9: 10 (Red).
  // < 4.0: 0 (Deep Red).
  
  let hue = 0;
  let sat = 85;
  let light = 45;

  if (score >= 9) {
      // 9.0 -> 135, 10.0 -> 145. 
      // This is "Green with a hint of blue", preventing the "Too Blue" look of 150+.
      hue = 135 + ((score - 9) * 10); 
  } else if (score >= 8) {
      // 8.0 -> 90, 8.9 -> ~125
      hue = 90 + ((score - 8) * 35); 
  } else if (score >= 7) {
      // 7.0 -> 55, 7.9 -> ~85
      hue = 55 + ((score - 7) * 30);
  } else if (score >= 6) {
      // 6.0 -> 35, 6.9 -> ~50
      hue = 35 + ((score - 6) * 15); 
  } else if (score >= 5) {
      // 5.0 -> 20, 5.9 -> ~30 (Clearly Orange vs Red)
      hue = 20 + ((score - 5) * 10);
  } else if (score >= 4) {
      // 4.x stays Bright Red
      hue = 10;
  } else {
      // < 4.0: Deep Red
      hue = 0;
      light = 35; // Darker
  }

  const badgeStyle = {
    backgroundColor: `hsl(${hue}, ${sat}%, ${light}%)`,
    borderColor: `hsl(${hue}, ${sat}%, ${light + 15}%)`,
    boxShadow: `0 0 15px hsla(${hue}, ${sat}%, ${light}%, 0.4)`
  };

  return (
    <div 
      className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-zinc-900 ring-1 ring-white/10 hover:ring-white/30 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.03] shadow-xl hover:shadow-2xl"
      onClick={onClick}
    >
      {/* Background Image */}
      <img 
        src={review.image || `https://picsum.photos/seed/${review.id}/400/600`} 
        alt={review.title}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
        loading="lazy"
      />
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
      
      {/* Big Badge: Top Right */}
      {score > 0 && (
        <div className="absolute top-3 right-3 z-20">
           <div 
             className="w-12 h-12 rounded-full flex items-center justify-center border-2 font-display font-black text-lg tracking-tighter text-white transition-transform duration-500 ease-out group-hover:scale-110"
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
        <h3 className="text-white font-display font-bold text-xl leading-tight drop-shadow-md line-clamp-2 mb-1 transition-colors duration-300 group-hover:text-white">
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