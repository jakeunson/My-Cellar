import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Trophy, Medal, Star, Plus } from 'lucide-react';
import { TastingEntry, RankingRecord, LiquorCategory } from '../../types';
import { getCategoryEmoji, getCategoryName, getAverageRating } from '../../utils/liquorUtils';

interface HomeScreenProps {
  entries: TastingEntry[];
  rankingRecords?: RankingRecord[];
  onScreenChange: (screen: string) => void;
  setSelectedEntryId: (id: string | null) => void;
}

export default function HomeScreen({
  entries,
  rankingRecords = [],
  onScreenChange,
  setSelectedEntryId
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<LiquorCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByRank, setSortByRank] = useState(false);

  // 가장 최근 날짜의 랭킹 스냅샷 가져오기
  const sortedRecords = [...rankingRecords].sort((a, b) => b.date.localeCompare(a.date));
  const latestRecord = sortedRecords[0] || null;

  const getLatestRank = (liquorId: string): number | null => {
    if (!latestRecord) return null;
    const found = latestRecord.items.find(item => item.liquorId === liquorId);
    return found ? found.rank : null;
  };

  const categories: { id: LiquorCategory | 'ALL'; label: string; emoji: string }[] = [
    { id: 'ALL', label: '전체', emoji: '🍸' },
    { id: 'Whiskey', label: '위스키', emoji: '🥃' },
    { id: 'Wine', label: '와인', emoji: '🍷' },
    { id: 'Beer', label: '맥주', emoji: '🍺' },
    { id: 'Korean', label: '전통주', emoji: '🍶' },
  ];

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'ALL' || entry.category === activeTab;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (!sortByRank) return 0;
    const rankA = getLatestRank(a.id);
    const rankB = getLatestRank(b.id);
    if (rankA !== null && rankB !== null) return rankA - rankB;
    if (rankA !== null) return -1;
    if (rankB !== null) return 1;
    return 0;
  });

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      {/* App Bar */}
      <div className="bg-white px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-2">
          <img src="/icon.png" alt="My Cellar Icon" className="w-7 h-7 rounded-lg object-cover shadow-sm border border-slate-200" />
          <h1 className="text-base font-black text-slate-900 tracking-tight">My Cellar</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortByRank(!sortByRank)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              sortByRank ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{sortByRank ? '랭킹순' : '기본순'}</span>
          </button>
          <button
            onClick={() => onScreenChange('add')}
            className="w-8 h-8 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
            title="주류 등록"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-3.5 pb-2.5 bg-white shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="술 이름으로 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200/80 flex space-x-2 overflow-x-auto no-scrollbar shrink-0">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center space-x-1.5 ${
              activeTab === cat.id 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="text-sm">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-24 custom-scrollbar">
        {filteredEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
            <span className="text-5xl">📭</span>
            <p className="text-sm font-bold">등록된 주류가 없습니다</p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const avgRating = getAverageRating(entry.reviews);
            const reviewCount = entry.reviews?.length || 0;
            const currentRank = getLatestRank(entry.id);

            return (
              <div
                key={entry.id}
                onClick={() => {
                  setSelectedEntryId(entry.id);
                  onScreenChange('detail');
                }}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.99] hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group relative"
              >
                {/* 랭킹 뱃지 표시 (좌측 상단 모서리) */}
                {currentRank !== null && (
                  <div className={`absolute -top-3 -left-2 px-3 py-1 rounded-full text-xs font-black shadow-md border flex items-center space-x-1 z-10 ${
                    currentRank === 1 ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-amber-500' :
                    currentRank === 2 ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 text-slate-900 border-slate-400' :
                    currentRank === 3 ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white border-amber-800' :
                    'bg-slate-800 text-white border-slate-900'
                  }`}>
                    <Medal className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentRank}위</span>
                  </div>
                )}

                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative shadow-2xs">
                    {entry.imageUrl ? (
                      <img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" />
                    ) : (
                      getCategoryEmoji(entry.category)
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight line-clamp-1">{entry.name}</h3>
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-bold">{getCategoryName(entry.category)}</span>
                      <span>•</span>
                      <span className="font-bold">ABV {entry.abv}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end shrink-0 pl-2 space-y-1.5">
                  <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 shadow-2xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-extrabold text-amber-800">{avgRating}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40">
                    🛒 {entry.purchaseDates?.length || 0}병 보유
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{reviewCount}회 시음</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
