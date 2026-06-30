import React from 'react';
import { motion } from 'motion/react';
import { PartyPopper, Trash2, Calendar, MapPin, Users, Tag, Plus } from 'lucide-react';
import { TastingEntry, TastingParty } from '../../types';
import { getCategoryEmoji } from '../../utils/liquorUtils';

interface PartyScreenProps {
  entries: TastingEntry[];
  parties: TastingParty[];
  onScreenChange: (screen: string) => void;
  onDeleteParty?: (id: string) => void;
  setSelectedEntryId: (id: string | null) => void;
  onOpenAddParty: () => void;
}

export default function PartyScreen({
  entries,
  parties,
  onScreenChange,
  onDeleteParty,
  setSelectedEntryId,
  onOpenAddParty
}: PartyScreenProps) {
  return (
    <motion.div
      key="parties"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      {/* App Bar */}
      <div className="bg-white px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-2">
          <PartyPopper className="w-5 h-5 text-rose-600" />
          <h1 className="text-base font-black text-slate-900 tracking-tight">주류 파티 다이어리</h1>
        </div>
        <button
          onClick={onOpenAddParty}
          className="w-8 h-8 rounded-xl bg-rose-600 text-white border border-rose-500 shadow-sm hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center"
          title="모임 등록"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12 custom-scrollbar text-xs">
        {parties.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
            <span className="text-5xl">🥳</span>
            <p className="text-sm font-bold">아직 기록된 파티가 없습니다</p>
            <p className="text-xs text-slate-400">우측 상단의 모임 등록 버튼을 눌러 술자리 추억을 기록해보세요.</p>
          </div>
        ) : (
          parties.map(party => (
            <div key={party.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5 relative group">
              {onDeleteParty && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 파티 기록을 삭제하시겠습니까?')) {
                      onDeleteParty(party.id);
                    }
                  }}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-red-600 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="border-b border-slate-100 pb-3 pr-8">
                <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200/60 shadow-2xs">
                  🎉 {party.date}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-2">{party.title}</h3>
                {party.location && (
                  <p className="text-xs font-bold text-slate-500 mt-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{party.location}</span>
                  </p>
                )}
              </div>

              {party.notes && (
                <p className="text-xs font-medium text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {party.notes}
                </p>
              )}

              {party.imageUrl && (
                <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 mt-2">
                  <img src={party.imageUrl} alt="파티 현장 사진" className="w-full h-full object-cover" />
                </div>
              )}

              {(() => {
                const validTagged = party.taggedLiquorIds
                  .map(id => entries.find(e => e.id === id))
                  .filter((liq): liq is TastingEntry => Boolean(liq));
                const validExternal = party.externalLiquors || [];

                if (validTagged.length === 0 && validExternal.length === 0) {
                  return null;
                }

                return (
                  <div className="space-y-2 pt-1 border-t border-slate-100 mt-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">함께 나눈 주류들</span>
                    <div className="flex flex-wrap gap-1.5">
                      {validTagged.map(liq => (
                        <span
                          key={liq.id}
                          onClick={() => {
                            setSelectedEntryId(liq.id);
                            onScreenChange('detail');
                          }}
                          className="bg-slate-900 text-amber-400 border border-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer hover:bg-slate-800 active:scale-95 transition-all shadow-2xs"
                        >
                          <span>🍷</span>
                          <span>{liq.name}</span>
                        </span>
                      ))}

                      {validExternal.map((ext, idx) => (
                        <span key={idx} className="bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-2xs">
                          <span>🍾</span>
                          <span>{ext} (외부/지참)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
