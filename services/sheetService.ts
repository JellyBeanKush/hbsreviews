import Papa from 'papaparse';
import { Review, ReviewStats } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZnUjg5fgFkE3jP3arpGJ-SawHBG8QO7F3YO_fqq-jSEg3v404gPfLOj18gfFkmzHaYJa_eBxADsll/pub?gid=0&single=true&output=csv';

const DEMO_REVIEWS: Review[] = [
  {
    id: 'demo-1',
    title: 'Everything Everywhere All At Once',
    category: 'Movie',
    image: 'https://picsum.photos/seed/eeao/600/900', // Fixed link
    year: '2022',
    jellybeanScore: 10,
    honeybearScore: 10,
    averageScore: 10,
    synopsis: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save the existence by exploring other universes connecting with the lives she could have led.",
    review: "Chaotic, beautiful, and profound. The action choreography is top tier. I have never cried so hard at a rock with googly eyes. Existential perfection.",
    creator: 'The Daniels',
    tags: ['Sci-Fi', 'Family'],
    dateWatched: '2023-04-12'
  },
  {
    id: 'demo-2',
    title: 'Succession',
    category: 'TV Series',
    image: 'https://picsum.photos/seed/succession/600/900', // Fixed link
    year: '2018',
    jellybeanScore: 9,
    honeybearScore: 10,
    averageScore: 9.5,
    synopsis: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
    review: "A masterclass in tension. Shakespearean tragedy.",
    creator: 'Jesse Armstrong',
    tags: ['Drama', 'HBO'],
    dateWatched: '2023-05-28',
    seasons: [
        {
            id: 'demo-2-s1',
            title: 'Succession - Season 1',
            category: 'TV Series',
            seasonNumber: '1',
            jellybeanScore: 8,
            honeybearScore: 9,
            averageScore: 8.5,
            synopsis: "Season 1 synopsis...",
            review: 'Slow start but hooked by the end.',
            tags: [],
            creator: '',
            dateWatched: ''
        }
    ]
  }
];

const normalizeHeader = (header: string): string => {
  const h = header.toLowerCase().trim();
  
  // Basic Metadata
  if (h.includes('title') || h === 'name') return 'title';
  if (h.includes('category') || h.includes('type') || h.includes('medium')) return 'category';
  if (h.includes('author') || h.includes('creator') || h.includes('director') || h.includes('artist')) return 'creator';
  if (h.includes('cover') || h.includes('image') || h.includes('poster') || h.includes('art')) return 'image';
  if (h === 'year' || h.includes('release') || h.includes('date')) return 'year';
  if (h.includes('synopsis') || h.includes('plot') || h.includes('summary')) return 'synopsis';
  if (h.includes('review') || h.includes('notes') || h.includes('thoughts') || h.includes('comment')) return 'review';
  
  // Scores - Be more aggressive matching
  // Check specific names first
  if (h.includes('honey') || h.includes('hb')) return 'honeybearScore';
  if (h.includes('jelly') || h.includes('jb')) return 'jellybeanScore';
  // Check generic average last
  if (h.includes('avg') || h.includes('average') || h.includes('final') || h.includes('score')) return 'averageScore';
  
  return header;
};

const parseScore = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;
  
  // Handle "10.0" or "8.5 / 10" formats
  const clean = str.replace(/\/.*$/, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return null;
  return num > 10 ? 10 : num; // Cap at 10 just in case
};

const normalizeCategory = (cat: string): string => {
    if (!cat) return 'Uncategorized';
    const lower = cat.toLowerCase();
    if (lower.includes('movie') || lower.includes('film')) return 'Movie';
    if (lower.includes('tv') || lower.includes('show') || lower.includes('series')) return 'TV Series';
    if (lower.includes('book') || lower.includes('novel')) return 'Book';
    if (lower.includes('game')) return 'Video Game';
    if (lower.includes('music') || lower.includes('album')) return 'Music';
    return cat;
};

// Helper to strip years like (2022) or [2022] from titles for better matching
const cleanTitle = (title: string): string => {
    return title.replace(/[\(\[\{]\d{4}[\)\]\}]/g, '').trim().toLowerCase();
};

export const fetchReviews = async (): Promise<Review[]> => {
  return new Promise((resolve) => { 
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        // Papa parse often returns 'errors' for minor things like field mismatches on the last empty line.
        // We should only fallback if we truly have NO data rows.
        if (!results.data || results.data.length === 0) {
          console.warn("Sheet failed to load or is empty, using DEMO data.");
          resolve(DEMO_REVIEWS);
          return;
        }

        // 1. Parse all rows into objects
        const parsedRows: Review[] = results.data.map((row: any, index: number) => {
            if (!row.title && !row.category) return null;

            const jbScore = parseScore(row.jellybeanScore);
            const hbScore = parseScore(row.honeybearScore);
            let avgScore = parseScore(row.averageScore);

            // AUTO-CALCULATE AVERAGE if missing
            // This prevents rows from being hidden if the 'Average' column in sheets is broken/empty
            if ((avgScore === null || avgScore === 0) && (jbScore !== null || hbScore !== null)) {
                 const scores = [jbScore, hbScore].filter(s => s !== null) as number[];
                 if (scores.length > 0) {
                     avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                     // Round to 1 decimal
                     avgScore = Math.round(avgScore * 10) / 10;
                 }
            }

            return {
                id: `review-${index}`,
                title: row.title ? row.title.trim() : 'Untitled',
                category: normalizeCategory(row.category),
                image: row.image || '',
                year: row.year || '',
                jellybeanScore: jbScore,
                honeybearScore: hbScore,
                averageScore: avgScore,
                synopsis: row.synopsis || '',
                review: row.review || '', 
                creator: row.creator || '',
                tags: row.category ? [normalizeCategory(row.category)] : [], 
                dateWatched: '',
                seasons: []
            };
        })
        .filter((r): r is Review => r !== null)
        // 1.5 Filter out items with no score data at all
        .filter(r => r.averageScore !== null && r.averageScore > 0);

        if (parsedRows.length === 0) {
             console.warn("No valid reviews found after parsing. Check headers.");
             resolve(DEMO_REVIEWS);
             return;
        }

        // 2. Group Seasons under Parents
        const reviewMap = new Map<string, Review>();
        // First pass: map all potential parents
        parsedRows.forEach(r => {
             reviewMap.set(cleanTitle(r.title), r);
             // Also set exact match just in case
             reviewMap.set(r.title.toLowerCase(), r);
        });

        const seasonRegex = /^(.*?)\s*[-:]?\s*Season\s*(\d+)$/i;

        parsedRows.forEach(r => {
            const match = r.title.match(seasonRegex);
            if (match) {
                // This is a season row (e.g., "Game of Thrones - Season 1")
                const parentTitleRaw = match[1].trim();
                const seasonNum = match[2];
                
                // Try to find parent by clean title or exact title
                const parent = reviewMap.get(cleanTitle(parentTitleRaw)) || reviewMap.get(parentTitleRaw.toLowerCase());
                
                if (parent && parent !== r) {
                    // Found a parent! Add this as a child
                    if (!parent.seasons) parent.seasons = [];
                    // Ensure we don't duplicate if script runs twice (react strict mode)
                    if (!parent.seasons.find(s => s.id === r.id)) {
                        parent.seasons.push({ 
                            ...r, 
                            seasonNumber: seasonNum,
                            year: '' // Explicitly clear year for season rows so it doesn't show up in UI
                        });
                    }
                }
            }
        });

        // 3. Filter out seasons that are successfully attached to parents from the main list
        const rootReviews = parsedRows.filter(r => {
            const match = r.title.match(seasonRegex);
            if (match) {
                 const parentTitleRaw = match[1].trim();
                 const parent = reviewMap.get(cleanTitle(parentTitleRaw)) || reviewMap.get(parentTitleRaw.toLowerCase());
                 if (parent && parent !== r) return false;
            }
            return true;
        });

        resolve(rootReviews);
      },
      error: (err) => {
          console.error("CSV Parse Error:", err);
          resolve(DEMO_REVIEWS);
      }
    });
  });
};

export const getStats = (reviews: Review[]): ReviewStats => {
  const stats: ReviewStats = {
    totalReviews: reviews.length,
    categoryCounts: {},
    averageJellybean: 0,
    averageHoneybear: 0,
    globalAverage: 0
  };

  if (!reviews.length) return stats;

  let totalJb = 0, countJb = 0;
  let totalHb = 0, countHb = 0;
  let totalAvg = 0, countAvg = 0;

  reviews.forEach(r => {
    // Categories
    const cat = r.category || 'Uncategorized';
    stats.categoryCounts[cat] = (stats.categoryCounts[cat] || 0) + 1;

    // Scores
    if (r.jellybeanScore !== null && r.jellybeanScore !== undefined) {
      totalJb += r.jellybeanScore;
      countJb++;
    }
    if (r.honeybearScore !== null && r.honeybearScore !== undefined) {
      totalHb += r.honeybearScore;
      countHb++;
    }
    if (r.averageScore !== null && r.averageScore !== undefined) {
      totalAvg += r.averageScore;
      countAvg++;
    }
  });

  if (countJb > 0) stats.averageJellybean = parseFloat((totalJb / countJb).toFixed(1));
  if (countHb > 0) stats.averageHoneybear = parseFloat((totalHb / countHb).toFixed(1));
  if (countAvg > 0) stats.globalAverage = parseFloat((totalAvg / countAvg).toFixed(1));

  return stats;
};