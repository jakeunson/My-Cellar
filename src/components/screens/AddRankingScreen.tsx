import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, AlertTriangle, Medal, PlusCircle, MinusCircle } from 'lucide-react';
import { TastingEntry, RankingRecord } from '../../types';
import { getCategoryName } from '../../utils/liquorUtils';

interface AddRankingScreenProps {
  entries: TastingEntry[];
  onAddRankingRecord?: (record: RankingRecord) => void;
  onScreenChange: (screen: string) => void;
}

export default function AddRankingScreen({
  entries,
  onAddRankingRecord,
  onScreenChange
}: AddRankingScreenProps) {
  const [rankingDate, setRankingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rankingTitle, setRankingTitle] = useState('🏆 오늘의 최애 주류 순위');
  const [rankingItems, setRankingItems] = useState<{ liquorId: string; rank: number; comment?: string }[]>([]);
  const [selectedLiquorToAdd, setSelectedLiquorToAdd] = useState('');
  const [rankingComment, setRankingComment] = useState('');
  const [rankingError, setRankingError] = useState('');

  const handleAddItemToRanking = () => {
    if (!selectedLiquorToAdd) {
      setRankingError('순위에 추가할 술을 선택해주세요.');
      return;
    }
    if (rankingItems.some(i => i.liquorId === selectedLiquorToAdd)) {
      setRankingError('이미 순위에 등록된 술입니다.');
      return;
    }
    const nextRank = rankingItems.length + 1;
    setRankingItems([...rankingItems, { liquorId: selectedLiquorToAdd, rank: nextRank, comment: rankingComment.trim() || undefined }]);
    setSelectedLiquorToAdd('');
    setRankingComment('');
    setRankingError('');
  };

  const handleRemoveItemFromRanking = (liquorId: string) => {
    const updated = rankingItems
      .filter(i => i.liquorId !== liquorId)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
    setRankingItems(updated);
  };

  const handleSaveRankingSnapshot = () => {
    if (!onAddRankingRecord) return;
    if (rankingItems.length === 0) {
      setRankingError('최소 1개 이상의 술을 순위에 등록해주세요.');
      return;
    }
    const newRecord: RankingRecord = {
      id: 'rank-' + Date.now(),
      date: rankingDate || new Date().toISOString().split('T')[0],
      title: rankingTitle.trim() || '🏆 나의 주류 명예의 전당',
      items: rankingItems
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
        <h1 className="text-sm font-extrabold text-slate-800">새 랭킹 스냅샷 등록</h1>
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3.5 font-bold text-slate-800 text-sm shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">랭킹 제목</label>
          <input 
            type="text" placeholder="예: 2026 여름 최애 위스키 순위"
            value={rankingTitle} onChange={(e) => setRankingTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3.5 font-bold text-slate-800 text-sm shadow-2xs"
          />
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 shadow-2xs">
          <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
            <Medal className="w-4 h-4 text-amber-600" />
            <span>1위부터 순서대로 추가하기</span>
          </h3>

          <div className="space-y-2">
            <select
              value={selectedLiquorToAdd}
              onChange={(e) => setSelectedLiquorToAdd(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-3 font-bold text-slate-800 text-sm focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="">-- 순위에 추가할 술 선택 --</option>
              {entries.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({getCategoryName(e.category)})</option>
              ))}
            </select>
            <input
              type="text" placeholder="선정 이유 짧은 메모 (선택)"
              value={rankingComment} onChange={(e) => setRankingComment(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3.5 text-xs font-medium shadow-2xs"
            />
            <button
              type="button" onClick={handleAddItemToRanking}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all mt-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{rankingItems.length + 1}위로 추가하기</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
            현재 선정된 순위 ({rankingItems.length}개)
          </h4>
          {rankingItems.length === 0 ? (
            <p className="text-center text-slate-400 py-6 font-medium text-xs">위 박스에서 술을 선택해 순위를 채워보세요.</p>
          ) : (
            rankingItems.map((item) => {
              const liq = entries.find(e => e.id === item.liquorId);
              return (
                <div key={item.liquorId} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                      {item.rank}
                    </span>
                    <div>
                      <h5 className="font-black text-slate-900 text-sm">{liq?.name}</h5>
                      {item.comment && <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.comment}</p>}
                    </div>
                  </div>
                  <button
                    type="button" onClick={() => handleRemoveItemFromRanking(item.liquorId)}
                    className="text-slate-400 hover:text-red-600 active:scale-95 p-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button" onClick={handleSaveRankingSnapshot}
          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl mt-4 transition-all"
        >
          랭킹 스냅샷 저장하기
        </button>
      </div>
    </motion.div>
  );
}
