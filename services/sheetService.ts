import Papa from 'papaparse';
import { Review } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZnUjg5fgFkE3jP3arpGJ-SawHBG8QO7F3YO_fqq-jSEg3v404gPfLOj18gfFkmzHaYJa_eBxADsll/pub?gid=0&single=true&output=csv';

const DEMO_REVIEWS: Review[] = [
  {
    id: 'demo-1',
    title: 'Everything Everywhere All At Once',
    category: 'Movie',
    image: 'https://image.tmdb.org/t/p/original/rKvCys0f9XNS62kryX8r9aY5u57.jpg',
    year: '2022',
    jellybeanScore: 10,
    honeybearScore: 10,
    averageScore: 10,
    jellybeanReview: "I have never cried so hard at a rock with googly eyes. Existential perfection.",
    honeybearReview: "Chaotic, beautiful, and profound. The action choreography is top tier.",
    creator: 'The Daniels',
    tags: ['Sci-Fi', 'Family'],
    dateWatched: '2023-04-12'
  },
  {
    id: 'demo-2',
    title: 'Succession',
    category: 'TV Series',
    image: 'https://image.tmdb.org/t/p/original/7X280VjI0C5hE9rG2M9kX71V7F2.jpg',
    year: '2018',
    jellybeanScore: 9,
    honeybearScore: 10,
    averageScore: 9.5,
    jellybeanReview: "A masterclass in tension.",
    honeybearReview: "Shakespearean tragedy.",
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
            jellybeanReview: 'Slow start but hooked by the end.',
            honeybearReview: 'Incredible setup.',
            tags: [],
            creator: '',
            dateWatched: ''
        }
    ]
  },
  {
    id: 'demo-3',
    title: 'Elden Ring',
    category: 'Video Game',
    image: 'https://image.tmdb.org/t/p/original/bQLNgPR2KyYp5WJ8T9w5l9v8.jpg',
    year: '2022',
    jellybeanScore: 8,
    honeybearScore: 9.5,
    averageScore: 8.75,
    jellybeanReview: "Too hard for me but the world is undeniably beautiful.",
    honeybearReview: "A masterpiece of open world design. I lost 100 hours to this.",
    creator: 'FromSoftware',
    tags: ['RPG', 'Fantasy'],
    dateWatched: '2023-01-15'
  }
];

const normalizeHeader = (header: string): string => {
  const h = header.toLowerCase().trim();
  if (h.includes('title')) return 'title';
  if (h.includes('category') || h.includes('type')) return 'category';
  if (h.includes('author') || h.includes('creator') || h.includes('directo') || h.includes('director')) return 'creator';
  if (h.includes('cover art') || h.includes('image') || h.includes('poster')) return 'image';
  if (h === 'year' || h.includes('release')) return 'year';
  if (h.includes('synopsis')) return 'synopsis';
  if (h.includes('review') || h.includes('notes')) return 'notes';
  // Flexible score detection
  if (h.includes('hb score') || h.includes('honeybear score') || (h.includes('hb') && h.includes('avg'))) return 'honeybearScore';
  if (h.includes('jb score') || h.includes('jellybean score') || (h.includes('jb') && h.includes('avg'))) return 'jellybeanScore';
  if (h.includes('average') || h.includes('avg')) return 'averageScore';
  return header;
};

const parseScore = (val: string): number | null => {
  if (!val) return null;
  // Handle "10.0" or "8.5 / 10" formats
  const clean = val.toString().replace(/\/.*$/, '').replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return null;
  return num > 10 ? 10 : num; // Cap at 10 just in case
};

const normalizeCategory = (cat: string): string => {
    if (!cat) return 'Uncategorized';
    const lower = cat.toLowerCase();
    if (lower.includes('movie')) return 'Movie';
    if (lower.includes('tv') || lower.includes('show') || lower.includes('series')) return 'TV Series';
    if (lower.includes('book')) return 'Book';
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
        if (results.errors.length || !results.data.length) {
          console.warn("Sheet failed to load, using DEMO data.");
          resolve(DEMO_REVIEWS);
          return;
        }

        // 1. Parse all rows into objects
        const parsedRows: Review[] = results.data.map((row: any, index: number) => {
            if (!row.title && !row.category) return null;
            const mainReview = row.notes || row.synopsis || '';
            const secReview = (row.notes && row.synopsis) ? `Synopsis: ${row.synopsis}` : '';

            return {
                id: `review-${index}`,
                title: row.title ? row.title.trim() : 'Untitled',
                category: normalizeCategory(row.category),
                image: row.image || '',
                year: row.year || '',
                jellybeanScore: parseScore(row.jellybeanScore),
                honeybearScore: parseScore(row.honeybearScore),
                averageScore: parseScore(row.averageScore),
                honeybearReview: mainReview,
                jellybeanReview: secReview, 
                creator: row.creator || '',
                tags: row.category ? [normalizeCategory(row.category)] : [], 
                dateWatched: '',
                seasons: []
            };
        }).filter((r): r is Review => r !== null);

        if (parsedRows.length === 0) {
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

        const finalReviews: Review[] = [];
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
                    // Sort seasons by number
                    parent.seasons.sort((a, b) => parseInt(a.seasonNumber || '0') - parseInt(b.seasonNumber || '0'));
                    
                    // Do NOT add to finalReviews
                    return; 
                }
            }
            // If not a season, OR parent not found, keep it in top level
            finalReviews.push(r);
        });

        resolve(finalReviews);
      },
      error: (err) => {
        console.warn("Network error loading sheet, using DEMO data.", err);
        resolve(DEMO_REVIEWS);
      }
    });
  });
};

export const getStats = (reviews: Review[]) => {
    const categories: Record<string, number> = {};
    let totalJ = 0; let countJ = 0;
    let totalH = 0; let countH = 0;
    let totalAvg = 0; let countAvg = 0;

    reviews.forEach(r => {
        const cat = r.category || 'Unknown';
        categories[cat] = (categories[cat] || 0) + 1;
        if (r.jellybeanScore !== null) { totalJ += r.jellybeanScore; countJ++; }
        if (r.honeybearScore !== null) { totalH += r.honeybearScore; countH++; }
        if (r.averageScore !== null) { totalAvg += r.averageScore; countAvg++; }
    });

    return {
        totalReviews: reviews.length,
        categoryCounts: categories,
        averageJellybean: countJ ? (totalJ / countJ) : 0,
        averageHoneybear: countH ? (totalH / countH) : 0,
        globalAverage: countAvg ? (totalAvg / countAvg) : 0
    };
};