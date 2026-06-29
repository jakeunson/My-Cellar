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
        <div className="flex items-center space-x-2.5">
          <PartyPopper className="w-6 h-6 text-rose-600" />
          <h1 className="text-base font-black text-slate-900 tracking-tight">주류 파티 다이어리</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 custom-scrollbar text-xs">
        {parties.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
            <span className="text-5xl">🥳</span>
            <p className="text-sm font-bold">아직 기록된 파티가 없습니다</p>
            <p className="text-xs text-slate-400">좋은 사람들과 나눈 술자리 추억을 기록해보세요.</p>
          </div>
        ) : (
          parties.map(party => (
            <div key={party.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5 relative group">
              {onDeleteParty && (
                <button
                  onClick={() => {
                    if (confirm('이 파티 기록을 삭제하시겠습니까?')) onDeleteParty(party.id);
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 active:scale-95 transition-all p-2 rounded-lg hover:bg-red-50"
                  title="파티 기록 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-rose-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>{party.date}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 pr-8">{party.title}</h3>
              {(party.location || party.companions) && (
                <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {party.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold">{party.location}</span>
                    </span>
                  )}
                  {party.companions && (
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold">{party.companions}</span>
                    </span>
                  )}
                </div>
              )}
              {party.imageUrl && (
                <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={party.imageUrl} alt={party.title} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-sm text-slate-700 leading-relaxed font-medium bg-rose-50/40 p-3.5 rounded-xl border border-rose-100/60 shadow-2xs">{party.notes}</p>
              
              {/* 마신 술 태그 목록 */}
              <div className="pt-2 space-y-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>함께 나눈 주류</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {party.taggedLiquorIds.map(lid => {
                    const liq = entries.find(e => e.id === lid);
                    return liq ? (
                      <span
                        key={lid}
                        onClick={() => { setSelectedEntryId(lid); onScreenChange('detail'); }}
                        className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800 active:scale-95 transition-all flex items-center space-x-1.5 shadow-2xs"
                      >
                        <span>{getCategoryEmoji(liq.category)}</span>
                        <span>{liq.name}</span>
                      </span>
                    ) : null;
                  })}
                  {party.externalLiquors?.map((ext, idx) => (
                    <span key={idx} className="bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-2xs">
                      <span>🍾</span>
                      <span>{ext} (외부/지참)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for Parties */}
      <button
        onClick={onOpenAddParty}
        className="absolute bottom-20 right-5 w-14 h-14 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all border-2 border-rose-500 z-10"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </motion.div>
  );
}
