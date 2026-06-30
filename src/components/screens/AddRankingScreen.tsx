import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, AlertTriangle, Medal, Plus, Trash2, Search } from 'lucide-react';
import { TastingEntry, RankingRecord } from '../../types';
import { getCategoryName } from '../../utils/liquorUtils';

interface AddRankingScreenProps {
  entries: TastingEntry[];
  onAddRankingRecord?: (record: RankingRecord) => void;
  onScreenChange: (screen: string) => void;
}

interface RankEditItem {
  id: string;
  rank: number;
  liquorId: string;
  comment: string;
  searchQuery: string;
  isSelecting: boolean;
}

export default function AddRankingScreen({
  entries,
  onAddRankingRecord,
  onScreenChange
}: AddRankingScreenProps) {
  const [rankingDate, setRankingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rankingTitle, setRankingTitle] = useState('🏆 오늘의 최애 주류 순위');
  const [rankingError, setRankingError] = useState('');

  const [items, setItems] = useState<RankEditItem[]>(() => {
    if (entries.length > 0) {
      return [
        { id: 'rank-1', rank: 1, liquorId: entries[0].id, comment: '', searchQuery: '', isSelecting: false },
        { id: 'rank-2', rank: 2, liquorId: entries[1]?.id || entries[0].id, comment: '', searchQuery: '', isSelecting: false }
      ];
    }
    return [{ id: 'rank-1', rank: 1, liquorId: '', comment: '', searchQuery: '', isSelecting: true }];
  });

  const updateItem = (index: number, partial: Partial<RankEditItem>) => {
    setItems(prev => prev.map((it, idx) => idx === index ? { ...it, ...partial } : it));
  };

  const deleteItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index).map((it, idx) => ({ ...it, rank: idx + 1 })));
  };

  const addRank = () => {
    setItems(prev => [
      ...prev,
      { id: 'rank-' + Date.now(), rank: prev.length + 1, liquorId: '', comment: '', searchQuery: '', isSelecting: true }
    ]);
  };

  const handleSaveRankingSnapshot = () => {
    if (!onAddRankingRecord) return;
    const validItems = items.filter(it => it.liquorId.trim() !== '').map(it => ({
      liquorId: it.liquorId,
      rank: it.rank,
      comment: it.comment.trim() || undefined
    }));

    if (validItems.length === 0) {
      setRankingError('최소 1개 이상의 주류 순위를 지정해주세요.');
      return;
    }

    const newRecord: RankingRecord = {
      id: 'rank-' + Date.now(),
      date: rankingDate || new Date().toISOString().split('T')[0],
      title: rankingTitle.trim() || '🏆 나의 주류 명예의 전당',
      items: validItems
    };
    onAddRankingRecord(newRecord);
    onScreenChange('ranking');
  };

  return (
    <motion.div 
      key="add_ranking"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white"
    >
      <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
        <button onClick={() => onScreenChange('ranking')} className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800">새 명예의 전당 등록</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs pb-24 custom-scrollbar">
        {rankingError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{rankingError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">기준 날짜</label>
          <input 
            type="date" value={rankingDate} onChange={(e) => setRankingDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-bold text-slate-800 text-sm shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">테마 제목</label>
          <input 
            type="text" placeholder="예: 6월 최애 위스키 TOP 3"
            value={rankingTitle} onChange={(e) => setRankingTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-bold text-slate-800 text-sm shadow-2xs"
          />
        </div>

        <hr className="border-slate-200" />

        {/* Dynamic Ranks List */}
        <div className="space-y-4">
          {items.map((item, index) => {
            const selectedEntry = entries.find(e => e.id === item.liquorId);
            const filteredEntries = entries.filter(e =>
              item.searchQuery.trim() === '' ||
              e.name.toLowerCase().includes(item.searchQuery.toLowerCase()) ||
              e.category.toLowerCase().includes(item.searchQuery.toLowerCase())
            );

            return (
              <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                {/* Rank Header */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-white font-black text-xs ${
                    item.rank === 1 ? 'bg-amber-500' :
                    item.rank === 2 ? 'bg-slate-400' :
                    item.rank === 3 ? 'bg-amber-700' : 'bg-slate-800'
                  }`}>
                    {item.rank}위 주류
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteItem(index)}
                      className="text-slate-400 hover:text-red-600 active:scale-95 p-1 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Liquor Picker / Selected State */}
                {selectedEntry && !item.isSelecting ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{selectedEntry.name}</h4>
                      <span className="text-[11px] font-bold text-slate-400">{getCategoryName(selectedEntry.category)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateItem(index, { isSelecting: true })}
                      className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 active:scale-95 transition-all"
                    >
                      변경
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-amber-400 rounded-xl p-3 space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="🔍 주류 이름 또는 종류 검색..."
                        value={item.searchQuery}
                        onChange={(e) => updateItem(index, { searchQuery: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                      {filteredEntries.length === 0 ? (
                        <p className="text-center text-slate-400 py-3 text-xs">검색된 주류가 없습니다.</p>
                      ) : (
                        filteredEntries.map(e => (
                          <div
                            key={e.id}
                            onClick={() => updateItem(index, { liquorId: e.id, isSelecting: false, searchQuery: '' })}
                            className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              item.liquorId === e.id ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="font-bold text-slate-800 text-xs">{e.name}</span>
                            <span className="text-[11px] font-medium text-slate-500">{getCategoryName(e.category)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Comment Input */}
                <input
                  type="text"
                  placeholder={`${item.rank}위 선정 이유 / 코멘트 (선택)`}
                  value={item.comment}
                  onChange={(e) => updateItem(index, { comment: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-medium text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            );
          })}
        </div>

        {/* Add Rank Button */}
        <button
          type="button"
          onClick={addRank}
          className="w-full bg-white hover:bg-slate-50 active:scale-95 text-slate-900 border-2 border-slate-900 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>순위 추가 (다음 순위 생성)</span>
        </button>

        {/* Submit Button */}
        <button
          type="button" onClick={handleSaveRankingSnapshot}
          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 py-4 rounded-2xl font-black text-sm shadow-xl transition-all"
        >
          명예의 전당 등록하기
        </button>
      </div>
    </motion.div>
  );
}
