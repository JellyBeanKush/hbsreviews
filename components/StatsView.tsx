import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, ReferenceLine
} from 'recharts';
import { ReviewStats, Review } from '../types';
import { X, Trophy, Swords, HeartHandshake, TrendingUp, TrendingDown, Crown } from 'lucide-react';

interface StatsViewProps {
  stats: ReviewStats;
  data: Review[];
  onClose: () => void;
}

// Updated COLORS: Yellow (Honey), Purple (Bean), Green, Blue, Pink, Orange
const COLORS = ['#fbbf24', '#a855f7', '#22c55e', '#3b82f6', '#ec4899', '#f97316'];

const StatsView: React.FC<StatsViewProps> = ({ stats, data, onClose }) => {
  
  // 1. Category Data
  const categoryData = Object.keys(stats.categoryCounts).map(cat => ({
    name: cat,
    value: stats.categoryCounts[cat]
  }));

  // 2. Scatter Data
  const scatterData = data
    .filter(r => r.jellybeanScore !== null && r.honeybearScore !== null)
    .map(r => ({
      x: r.honeybearScore || 0,
      y: r.jellybeanScore || 0,
      name: r.title,
      diff: Math.abs((r.honeybearScore || 0) - (r.jellybeanScore || 0))
    }));

  // 3. Disagreements (The Battleground)
  const disagreements = [...data]
    .filter(r => r.jellybeanScore !== null && r.honeybearScore !== null)
    .map(r => ({
      ...r,
      delta: Math.abs((r.honeybearScore || 0) - (r.jellybeanScore || 0)),
      winner: (r.honeybearScore || 0) > (r.jellybeanScore || 0) ? 'Honeybear' : 'Jellybean'
    }))
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5);

  // 4. Sync Rate (Agreement within 1 point)
  const validReviews = data.filter(r => r.jellybeanScore !== null && r.honeybearScore !== null);
  const agreements = validReviews.filter(r => Math.abs((r.honeybearScore || 0) - (r.jellybeanScore || 0)) <= 1);
  const syncRate = validReviews.length ? Math.round((agreements.length / validReviews.length) * 100) : 0;

  // 5. Personalities
  const hbAvg = stats.averageHoneybear;
  const jbAvg = stats.averageJellybean;
  const isHbNice = hbAvg > jbAvg;

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">The Data Vault</h2>
              <p className="text-gray-400">Deep dive into review habits</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <X className="w-8 h-8" />
            </button>
        </div>

        {/* Fun Facts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            
            {/* Sync Rate Card */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HeartHandshake className="w-24 h-24 text-accent" />
                </div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Taste Sync</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{syncRate}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">of the time, you agree (within 1 pt)</p>
            </div>

            {/* Total Watched */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-24 h-24 text-honey" />
                </div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Watched</h3>
                <span className="text-5xl font-black text-white">{stats.totalReviews}</span>
                <p className="text-xs text-gray-500 mt-2">movies & shows logged</p>
            </div>

            {/* Honeybear Stat */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-honey/20 relative overflow-hidden bg-gradient-to-br from-honey/5 to-transparent">
                <h3 className="text-honey text-xs font-bold uppercase tracking-widest mb-2">Honeybear's Avg</h3>
                <span className="text-5xl font-black text-white">{hbAvg.toFixed(1)}</span>
                <div className="mt-2 flex items-center gap-2">
                    {isHbNice ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> The Optimist
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            <TrendingDown className="w-3 h-3" /> The Critic
                        </span>
                    )}
                </div>
            </div>

             {/* Jellybean Stat */}
             <div className="bg-zinc-900 p-6 rounded-2xl border border-bean/20 relative overflow-hidden bg-gradient-to-br from-bean/5 to-transparent">
                <h3 className="text-bean text-xs font-bold uppercase tracking-widest mb-2">Jellybean's Avg</h3>
                <span className="text-5xl font-black text-white">{jbAvg.toFixed(1)}</span>
                <div className="mt-2 flex items-center gap-2">
                    {!isHbNice ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> The Optimist
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            <TrendingDown className="w-3 h-3" /> The Critic
                        </span>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* The Battleground (Disagreements) */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-white/5 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <Swords className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">The Battleground</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Titles where your opinions drifted apart the most.</p>
                
                <div className="space-y-4 flex-1">
                    {disagreements.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex-1 min-w-0 pr-4">
                                <h4 className="font-bold text-white truncate">{item.title}</h4>
                                <div className="flex gap-4 text-sm mt-1">
                                    <span className="text-honey flex items-center gap-1"><span className="text-xs opacity-50">HB</span> {item.honeybearScore}</span>
                                    <span className="text-bean flex items-center gap-1"><span className="text-xs opacity-50">JB</span> {item.jellybeanScore}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-white">+{item.delta.toFixed(1)}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-500">Diff</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scatter Plot */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-white/5 h-[500px] flex flex-col">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-2">Taste Map</h3>
                <p className="text-sm text-gray-500 mb-6">Are we aligned? (Top Right = Masterpieces, Bottom Left = Trash)</p>
                
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="Honeybear" 
                                stroke="#fbbf24" 
                                domain={[0, 10]} 
                                tickCount={11}
                                label={{ value: 'Honeybear Score', position: 'bottom', fill: '#fbbf24', fontSize: 12 }}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="Jellybean" 
                                stroke="#a855f7" 
                                domain={[0, 10]} 
                                tickCount={11}
                                label={{ value: 'Jellybean Score', angle: -90, position: 'left', fill: '#a855f7', fontSize: 12 }}
                            />
                            <ZAxis type="category" dataKey="name" name="Title" />
                            <ReTooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-zinc-800 p-3 border border-white/10 rounded shadow-xl">
                                                <p className="font-bold text-white mb-1">{data.name}</p>
                                                <div className="flex gap-3 text-sm">
                                                    <span className="text-honey">Honey: {data.x}</span>
                                                    <span className="text-bean">Jelly: {data.y}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Diagonal line for perfect agreement */}
                            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} stroke="#333" strokeDasharray="5 5" />
                            
                            <Scatter name="Reviews" data={scatterData} fill="#8884d8">
                                {scatterData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.diff > 2 ? '#ef4444' : (entry.x > 8 && entry.y > 8 ? '#fbbf24' : '#52525b')} fillOpacity={0.7} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Category Breakdown (Smaller) */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Genre Breakdown</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                            ))}
                        </Pie>
                        <ReTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex flex-wrap justify-center gap-4 mt-4">
                 {categoryData.map((entry, index) => (
                     <div key={index} className="flex items-center gap-2">
                         <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                         <span className="text-sm text-gray-300">{entry.name} ({entry.value})</span>
                     </div>
                 ))}
             </div>
        </div>

      </div>
    </div>
  );
};

export default StatsView;