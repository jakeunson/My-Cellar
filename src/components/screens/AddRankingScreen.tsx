import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, AlertTriangle, Medal, Plus, Trash2, Search, X } from 'lucide-react';
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
        { id: 'rank-1', rank: 1, liquorId: entries[0].id, comment: '' },
        { id: 'rank-2', rank: 2, liquorId: entries[1]?.id || entries[0].id, comment: '' }
      ];
    }
    return [{ id: 'rank-1', rank: 1, liquorId: '', comment: '' }];
  });

  const [activeSelectingIndex, setActiveSelectingIndex] = useState<number | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const updateItem = (index: number, partial: Partial<RankEditItem>) => {
    setItems(prev => prev.map((it, idx) => idx === index ? { ...it, ...partial } : it));
  };

  const deleteItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index).map((it, idx) => ({ ...it, rank: idx + 1 })));
  };

  const addRank = () => {
    setItems(prev => [
      ...prev,
      { id: 'rank-' + Date.now(), rank: prev.length + 1, liquorId: '', comment: '' }
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

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'whisky', label: '🥃 위스키' },
    { id: 'wine', label: '🍷 와인' },
    { id: 'beer', label: '🍺 맥주' },
    { id: 'sake', label: '🍶 사케' },
    { id: 'traditional', label: '🇰🇷 전통주' },
    { id: 'other', label: '🍸 기타' }
  ];

  const filteredModalEntries = entries.filter(e => {
    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchQuery = !modalSearchQuery.trim() ||
      e.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      getCategoryName(e.category).toLowerCase().includes(modalSearchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <motion.div 
      key="add_ranking"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white relative"
    >
      <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
        <button onClick={() => onScreenChange('ranking')} className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800">명예의 전당 등록</h1>
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

        <div className="space-y-4">
          {items.map((item, index) => {
            const selectedEntry = entries.find(e => e.id === item.liquorId);

            return (
              <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
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

                {selectedEntry ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{selectedEntry.name}</h4>
                      <span className="text-[11px] font-bold text-slate-400">{getCategoryName(selectedEntry.category)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalSearchQuery('');
                        setSelectedCategory('all');
                        setActiveSelectingIndex(index);
                      }}
                      className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 active:scale-95 transition-all"
                    >
                      변경
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setModalSearchQuery('');
                      setSelectedCategory('all');
                      setActiveSelectingIndex(index);
                    }}
                    className="w-full bg-amber-50 border border-amber-400 text-amber-800 font-black py-3 rounded-xl hover:bg-amber-100 transition-all text-xs"
                  >
                    + 셀러에서 주류 선택하기
                  </button>
                )}

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

        <button
          type="button"
          onClick={addRank}
          className="w-full bg-white hover:bg-slate-50 active:scale-95 text-slate-900 border-2 border-slate-900 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>순위 추가하기</span>
        </button>
      </div>

      <div className="border-t border-slate-200 p-3.5 bg-white shrink-0">
        <button
          type="button"
          onClick={handleSaveRankingSnapshot}
          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <Medal className="w-4 h-4 stroke-[2.5]" />
          <span>명예의 전당 등록</span>
        </button>
      </div>

      <AnimatePresence>
        {activeSelectingIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl max-h-[85%] flex flex-col p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-sm">
                  {activeSelectingIndex + 1}위 주류 선택
                </h3>
                <button
                  onClick={() => setActiveSelectingIndex(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="🔍 주류 이름 또는 종류 검색..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 max-h-80">
                {filteredModalEntries.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-xs">조건에 맞는 주류가 없습니다.</p>
                ) : (
                  filteredModalEntries.map(e => {
                    const isSelected = items[activeSelectingIndex]?.liquorId === e.id;
                    return (
                      <div
                        key={e.id}
                        onClick={() => {
                          updateItem(activeSelectingIndex, { liquorId: e.id });
                          setActiveSelectingIndex(null);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{e.name}</p>
                          <p className="text-[11px] font-medium text-slate-500">{getCategoryName(e.category)}</p>
                        </div>
                        {isSelected && <span className="text-xs font-black text-amber-700">✓ 선택됨</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
