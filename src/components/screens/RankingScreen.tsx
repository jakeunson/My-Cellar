import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Trash2, Plus } from 'lucide-react';
import { TastingEntry, RankingRecord } from '../../types';

interface RankingScreenProps {
  entries: TastingEntry[];
  rankingRecords: RankingRecord[];
  onScreenChange: (screen: string) => void;
  onDeleteRankingRecord?: (id: string) => void;
  onOpenAddRanking: () => void;
}

export default function RankingScreen({
  entries,
  rankingRecords,
  onDeleteRankingRecord,
  onOpenAddRanking
}: RankingScreenProps) {
  const sortedRecords = [...rankingRecords].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <motion.div 
      key="ranking"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      {/* App Bar */}
      <div className="bg-white px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h1 className="text-base font-black text-slate-900 tracking-tight">명예의 전당 히스토리</h1>
        </div>
      </div>

      {/* Ranking Records List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 custom-scrollbar text-xs">
        {sortedRecords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-bold">등록된 랭킹 스냅샷이 없습니다.<br/>[+] 버튼을 눌러 순위를 기록해보세요!</p>
          </div>
        ) : (
          sortedRecords.map(rec => (
            <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 relative group">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <div className="mb-1.5">
                    <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 shadow-2xs">
                      📅 {rec.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-1">{rec.title}</h3>
                </div>
                {onDeleteRankingRecord && (
                  <button
                    onClick={() => {
                      if (confirm('이 날짜의 랭킹 스냅샷을 삭제하시겠습니까?')) {
                        onDeleteRankingRecord(rec.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 active:scale-95 transition-all p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Ranked Items */}
              <div className="space-y-3 pt-1">
                {rec.items.map(item => {
                  const liq = entries.find(e => e.id === item.liquorId);
                  return (
                    <div key={item.liquorId} className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-2xs ${
                          item.rank === 1 ? 'bg-amber-400 text-slate-950' :
                          item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                          item.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-800 text-white'
                        }`}>
                          {item.rank}
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm">{liq ? liq.name : '(삭제된 주류)'}</span>
                      </div>
                      {item.comment && (
                        <span className="text-xs font-medium text-slate-500 line-clamp-1 max-w-[140px]">{item.comment}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for Ranking */}
      <button
        onClick={onOpenAddRanking}
        className="absolute bottom-20 right-5 w-14 h-14 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all border-2 border-amber-400 z-10"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </motion.div>
  );
}
