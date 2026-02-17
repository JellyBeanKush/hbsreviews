import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Review } from '../types';
import { X, Sparkles, Loader2, ThumbsUp, Film, Search, Image as ImageIcon, Music, Book, Gamepad2, Tv, AlertTriangle } from 'lucide-react';

interface RecommendationsViewProps {
  reviews: Review[];
  onClose: () => void;
}

type MediaType = 'Movie' | 'TV Series' | 'Music' | 'Video Game' | 'Book';

interface Recommendation {
  title: string;
  year: string;
  type: MediaType;
  creator: string;
  reason: string;
  similarTo: string;
  posterUrl?: string;
}

const RecommendationsView: React.FC<RecommendationsViewProps> = ({ reviews, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Fetchers (iTunes, Google Books, TVMaze, Wikipedia) ---
  const fetchMusicCover = async (title: string, artist: string): Promise<string | undefined> => {
    try {
        const query = `${title} ${artist}`;
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=album&limit=1`);
        const data = await res.json();
        if (data.results?.[0]?.artworkUrl100) {
            return data.results[0].artworkUrl100.replace('100x100', '600x600');
        }
    } catch (e) { console.warn('iTunes fetch failed', e); }
    return undefined;
  };

  const fetchBookCover = async (title: string, author: string): Promise<string | undefined> => {
    try {
        const query = `intitle:${title} inauthor:${author}`;
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
        const data = await res.json();
        const img = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (img) return img.replace('http:', 'https:').replace('&edge=curl', '');
    } catch (e) { console.warn('Google Books fetch failed', e); }
    return undefined;
  };

  const fetchPosterFromTVMaze = async (title: string): Promise<string | undefined> => {
    try {
      const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`);
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.image?.original || data.image?.medium;
    } catch (e) { return undefined; }
  };

  const fetchPosterFromWikipedia = async (title: string, year: string, type: string, creator: string): Promise<string | undefined> => {
    const queries = [];
    if (type === 'Video Game') { queries.push(`${title} video game`); } 
    else if (type === 'Movie') { queries.push(`${title} ${year} film`); } 
    else if (type === 'Book') { queries.push(`${title} novel`); } 
    else if (type === 'Music') { queries.push(`${title} album`); } 
    else { queries.push(`${title} ${type}`); }
    queries.push(title);

    for (const query of queries) {
        try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=pageimages&pithumbsize=600&format=json&origin=*`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.query?.pages) continue;
            const pages = Object.values(data.query.pages) as any[];
            const pageWithImage = pages.find(p => p.thumbnail && p.thumbnail.source);
            if (pageWithImage) return pageWithImage.thumbnail.source;
        } catch (e) { console.warn(`Wiki failed for query ${query}`, e); }
    }
    return undefined;
  };

  const getBestPoster = async (rec: Recommendation): Promise<string | undefined> => {
      if (rec.type === 'Music') return await fetchMusicCover(rec.title, rec.creator) || await fetchPosterFromWikipedia(rec.title, rec.year, rec.type, rec.creator);
      if (rec.type === 'Book') return await fetchBookCover(rec.title, rec.creator) || await fetchPosterFromWikipedia(rec.title, rec.year, rec.type, rec.creator);
      if (rec.type === 'TV Series') return await fetchPosterFromTVMaze(rec.title) || await fetchPosterFromWikipedia(rec.title, rec.year, rec.type, rec.creator);
      return await fetchPosterFromWikipedia(rec.title, rec.year, rec.type, rec.creator);
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setLoadingStep('ai');
    setError(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing. Please add 'API_KEY' to your environment variables in Netlify/Vercel.");
      }

      const loved = reviews.filter(r => (r.averageScore || 0) >= 7.5).map(r => `${r.title} (${r.category})`).slice(0, 30); 
      const hated = reviews.filter(r => (r.averageScore || 0) <= 4).map(r => `${r.title}`).slice(0, 10);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        I have a list of media reviews. 
        WE LOVED: ${loved.join(', ')}. 
        WE HATED: ${hated.join(', ')}.
        Based on these tastes, recommend 5 NEW items we haven't seen.
        CRITICAL INSTRUCTION: Mix up the mediums! Do NOT just recommend movies. Include at least one 'Video Game', 'Book', or 'Music'.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                year: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Movie", "TV Series", "Music", "Video Game", "Book"] },
                creator: { type: Type.STRING },
                reason: { type: Type.STRING },
                similarTo: { type: Type.STRING }
              }
            }
          }
        }
      });

      if (response.text) {
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(json)?|```$/g, '').trim();
        }
        const rawRecs: Recommendation[] = JSON.parse(jsonStr);
        setLoadingStep('images');
        const enrichedRecs = await Promise.all(
          rawRecs.map(async (rec) => {
            const poster = await getBestPoster(rec);
            return { ...rec, posterUrl: poster };
          })
        );
        setRecommendations(enrichedRecs);
      } else {
        throw new Error("AI returned empty response.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate recommendations.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const getIconForType = (type: MediaType) => {
      switch (type) {
          case 'Music': return <Music className="w-3 h-3" />;
          case 'Book': return <Book className="w-3 h-3" />;
          case 'Video Game': return <Gamepad2 className="w-3 h-3" />;
          case 'TV Series': return <Tv className="w-3 h-3" />;
          default: return <Film className="w-3 h-3" />;
      }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12 sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-50 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-accent to-bean rounded-lg shadow-lg shadow-accent/20">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">AI Concierge</h2>
                    <p className="text-gray-400 text-xs">Curated for Honeybear & Jellybean</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <X className="w-8 h-8" />
            </button>
        </div>

        <div className="flex flex-col items-center min-h-[50vh] justify-center">
            {recommendations.length === 0 && !loading && (
                <div className="text-center max-w-2xl animate-fade-in-up">
                    <div className="flex justify-center gap-4 mb-6 text-zinc-800">
                        <Film className="w-12 h-12 text-zinc-700" />
                        <Book className="w-12 h-12 text-zinc-700" />
                        <Music className="w-12 h-12 text-zinc-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">What should we consume next?</h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        I've analyzed your {reviews.length} reviews. I know your taste in movies, but I can also recommend books, games, and albums.
                    </p>
                    <button 
                        onClick={generateRecommendations}
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-white/5 font-lg rounded-full focus:outline-none ring-1 ring-white/20 hover:bg-white/10 hover:ring-white/50 hover:scale-105 active:scale-95"
                    >
                        <span className="mr-2">Generate Recommendations</span>
                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    </button>
                    {error && (
                        <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg flex items-center gap-3 text-left">
                            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                            <div>
                                <p className="font-bold">Recommendation Failed</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className="py-20 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
                    <p className="text-lg font-medium text-white animate-pulse">
                      {loadingStep === 'ai' ? "Consulting the digital oracle..." : "Fetching cover art..."}
                    </p>
                </div>
            )}

            {recommendations.length > 0 && !loading && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
                    <div className="flex justify-between items-end mb-8 px-2">
                        <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">Top 5 Picks</h3>
                        <button onClick={generateRecommendations} className="text-sm text-accent hover:text-white font-bold underline">Regenerate</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="flex flex-col gap-3 group">
                                <div className={`relative ${rec.type === 'Music' ? 'aspect-square' : 'aspect-[2/3]'} rounded-xl overflow-hidden shadow-2xl bg-zinc-900 ring-1 ring-white/10`}>
                                    {rec.posterUrl ? (
                                      <img src={rec.posterUrl} alt={rec.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center p-4">
                                         <ImageIcon className="w-10 h-10 text-white/10" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h4 className="text-lg font-bold text-white leading-tight">{rec.title}</h4>
                                        <p className="text-xs text-gray-300 opacity-80 mb-1">{rec.creator}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-accent mt-2 uppercase font-bold">
                                            <ThumbsUp className="w-3 h-3" /> Like {rec.similarTo}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-gray-400">
                                    <Sparkles className="w-3 h-3 text-honey inline mr-2" />
                                    {rec.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsView;