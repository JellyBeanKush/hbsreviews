import React from 'react';
import { Review } from '../types';
import { Star, Info } from 'lucide-react';

interface HeroProps {
  review: Review | null;
  onMoreInfo: () => void;
}

const Hero: React.FC<HeroProps> = ({ review, onMoreInfo }) => {
  if (!review) return null;

  // Use a high-quality placeholder if no image, but try to use review image
  // For hero, we want a landscape crop ideally, but we might just blur-fill the background if the image is portrait
  const bgImage = review.image || `https://picsum.photos/seed/${review.id}/1200/600`;

  return (
    <div className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden mb-8">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img 
            src={bgImage} 
            alt={review.title}
            className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center h-full pt-16">
        <div className="max-w-2xl animate-fade-in-up">
           <span className="inline-block px-2 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-primary text-black rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.4)]">
             Featured {review.category}
           </span>
           <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg font-display">
             {review.title}
           </h1>
           
           <div className="flex flex-wrap items-center gap-6 mb-6 text-sm md:text-base font-medium">
             {review.averageScore !== null && (
               <div className="flex items-center gap-1 bg-surface/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                 <span className="text-primary font-bold text-lg">{review.averageScore}</span>
                 <span className="text-xs uppercase text-gray-400">Avg Score</span>
               </div>
             )}
             
             <div className="flex items-center gap-4 border-l border-gray-600 pl-4">
                {review.honeybearScore && (
                  <div className="flex items-center text-honey" title="Honeybear's Score">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{review.honeybearScore}</span>
                  </div>
                )}
                {review.jellybeanScore && (
                  <div className="flex items-center text-bean" title="Jellybean's Score">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{review.jellybeanScore}</span>
                  </div>
                )}
             </div>

             {review.year && <span className="text-gray-300">{review.year}</span>}
           </div>

           <p className="text-gray-200 text-lg mb-8 line-clamp-3 max-w-xl font-sans font-light">
             {review.honeybearReview || review.jellybeanReview || "No summary available."}
           </p>

           <button 
             onClick={onMoreInfo}
             className="bg-primary hover:bg-primaryHover text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all w-fit group shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
           >
             <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
             Read Full Reviews
           </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;