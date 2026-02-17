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
  jellybeanReview: string;
  honeybearReview: string;
  
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

export type SortOption = 'latest' | 'oldest' | 'title-asc' | 'avg-desc' | 'jb-desc' | 'hb-desc' | 'year-desc' | 'year-asc';