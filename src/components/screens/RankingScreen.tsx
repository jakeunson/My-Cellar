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
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-black text-slate-900 tracking-tight">명예의 전당 히스토리</h1>
        </div>
        <button
          onClick={onOpenAddRanking}
          className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 border border-amber-400 shadow-sm hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center"
          title="랭킹 등록"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Ranking Records List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12 custom-scrollbar text-xs">
        {sortedRecords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-bold">등록된 랭킹 스냅샷이 없습니다.<br/>우측 상단의 랭킹 등록 버튼을 눌러 순위를 기록해보세요!</p>
          </div>
        ) : (
          sortedRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white border-2 border-slate-900 rounded-2xl p-4 space-y-3 shadow-md relative overflow-hidden"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div className="flex flex-col space-y-1.5 min-w-0 pr-2">
                  <div className="flex items-center">
                    <span className="bg-slate-900 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                      {record.date}
                    </span>
                  </div>
                  <h2 className="font-extrabold text-slate-800 text-sm leading-snug break-all">
                    {record.title}
                  </h2>
                </div>
                {onDeleteRankingRecord && (
                  <button
                    onClick={() => {
                      if (confirm('이 랭킹 스냅샷을 삭제하시겠습니까?')) {
                        onDeleteRankingRecord(record.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {record.items.map((item) => {
                  const entry = entries.find(e => e.id === item.liquorId);
                  return (
                    <div
                      key={item.liquorId}
                      className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                          item.rank === 1 ? 'bg-amber-500 text-white' :
                          item.rank === 2 ? 'bg-slate-400 text-white' :
                          item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.rank}
                        </span>
                        <span className="font-bold text-slate-800 text-xs">{entry ? entry.name : '(삭제된 주류)'}</span>
                      </div>
                      {item.comment && (
                        <span className="text-[11px] text-slate-500 font-medium italic truncate max-w-[130px]">
                          {item.comment}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
