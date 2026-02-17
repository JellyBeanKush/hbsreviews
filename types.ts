export interface Review {
  id: string;
  title: string;
  category: string;
  image?: string;
  year?: string;
  
  // Ratings (0-10 or 0-5 scale, normalized to 10 for internal use)
  jellybeanScore: number | null;
  honeybearScore: number | null;
  averageScore: number | null;
  
  // Reviews
  synopsis: string; // From Column F
  review: string;   // From Column H (Review/Notes)
  
  // Backward compatibility / Specific if needed (we can ignore these or map 'review' to them if we wanted)
  jellybeanReview?: string;
  honeybearReview?: string;
  
  // Metadata
  creator?: string; // Director, Author, Artist
  tags: string[];
  dateWatched?: string;
  
  // TV Show Specific
  seasons?: Review[];
  seasonNumber?: string;
}

export interface ReviewStats {
  totalReviews: number;
  categoryCounts: Record<string, number>;
  averageJellybean: number;
  averageHoneybear: number;
  globalAverage: number;
}

export type SortOption = 'latest' | 'title-asc' | 'avg-desc' | 'avg-asc' | 'jb-desc' | 'hb-desc' | 'year-desc' | 'year-asc';