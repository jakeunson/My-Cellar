import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit, Trash2, Calendar, Star, PartyPopper, MessageSquarePlus } from 'lucide-react';
import { TastingEntry, TastingParty, FlavorProfile } from '../../types';
import { getCategoryEmoji, getCategoryName, getAverageFlavors } from '../../utils/liquorUtils';

interface DetailScreenProps {
  selectedEntry: TastingEntry | null;
  parties: TastingParty[];
  onScreenChange: (screen: string) => void;
  onDeleteLiquor: (id: string) => void;
  onDeleteReview: (liquorId: string, reviewId: string) => void;
  onOpenEdit: () => void;
  onOpenAddReview: () => void;
}

// 오각 레이더 차트 컴포넌트
function RadarChart({ flavors }: { flavors: FlavorProfile }) {
  const categories = [
    { key: 'sweet', label: '단맛', value: flavors.sweet },
    { key: 'bitter', label: '쓴맛', value: flavors.bitter },
    { key: 'sour', label: '신맛', value: flavors.sour },
    { key: 'body', label: '바디감', value: flavors.body },
    { key: 'smoky', label: '스모키', value: flavors.smoky },
  ];

  const size = 180;
  const center = size / 2;
  const radius = (size / 2) - 25;
  const maxVal = 5;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const distance = (radius * value) / maxVal;
    return [
      center + distance * Math.cos(angle),
      center + distance * Math.sin(angle)
    ];
  };

  const points = categories
    .map((cat, i) => getCoordinates(i, cat.value).join(','))
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {[1, 2, 3, 4, 5].map((level) => {
            const levelPoints = categories
              .map((_, i) => getCoordinates(i, level).join(','))
              .join(' ');
            return (
              <polygon
                key={level}
                points={levelPoints}
                fill="none"
                stroke={level === 5 ? '#cbd5e1' : '#f1f5f9'}
                strokeWidth={level === 5 ? '1.5' : '1'}
                strokeDasharray={level === 3 ? '2 2' : 'none'}
              />
            );
          })}
          {categories.map((_, i) => {
            const [x, y] = getCoordinates(i, maxVal);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}
          <polygon
            points={points}
            fill="rgba(245, 158, 11, 0.25)"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          {categories.map((cat, i) => {
            const [x, y] = getCoordinates(i, cat.value);
            const [labelX, labelY] = getCoordinates(i, maxVal + 1.2);
            return (
              <g key={cat.key}>
                <circle cx={x} cy={y} r="3.5" fill="#f59e0b" className="drop-shadow-sm" />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] font-extrabold fill-slate-700 select-none"
                >
                  {cat.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function DetailScreen({
  selectedEntry,
  parties,
  onScreenChange,
  onDeleteLiquor,
  onDeleteReview,
  onOpenEdit,
  onOpenAddReview
}: DetailScreenProps) {
  if (!selectedEntry) return null;

  return (
    <motion.div 
      key="detail"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white"
    >
      <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-2">
          <button onClick={() => onScreenChange('home')} className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full text-slate-700 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-extrabold text-slate-800">주류 시음 히스토리</h1>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onOpenEdit}
            className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full text-slate-700 transition-all"
            title="주류 정보 수정"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              if (confirm('이 주류와 모든 시음 기록을 삭제하시겠습니까?')) {
                onDeleteLiquor(selectedEntry.id);
                onScreenChange('home');
              }
            }}
            className="p-2.5 hover:bg-red-50 active:scale-95 rounded-full text-red-600 transition-all"
            title="삭제"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24 custom-scrollbar text-xs">
        {/* Hero Summary with Image */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 text-center shadow-lg relative overflow-hidden flex flex-col items-center">
          {selectedEntry.imageUrl ? (
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md mb-3">
              <img src={selectedEntry.imageUrl} alt={selectedEntry.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="text-5xl block mb-2">{getCategoryEmoji(selectedEntry.category)}</span>
          )}
          <h2 className="text-base font-black tracking-tight">{selectedEntry.name}</h2>
          <div className="flex justify-center gap-2 mt-2.5">
            <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-slate-700">{getCategoryName(selectedEntry.category)}</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-300 border border-slate-700">ABV {selectedEntry.abv}%</span>
          </div>
        </div>

        {/* Radar Chart */}
        <RadarChart flavors={getAverageFlavors(selectedEntry.reviews)} />

        {/* Reviews Timeline Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-black text-slate-900 text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>날짜별 시음 기록 ({selectedEntry.reviews?.length || 0}회)</span>
          </span>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {!selectedEntry.reviews || selectedEntry.reviews.length === 0 ? (
            <p className="text-center text-slate-400 py-6 font-bold text-sm">아직 시음 기록이 없습니다.</p>
          ) : (
            selectedEntry.reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 relative group shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    📅 {rev.date}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500 font-black text-sm bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                      <Star className="w-4 h-4 fill-amber-500 mr-1" />
                      <span>{rev.rating}</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('이 시음 후기를 삭제하시겠습니까?')) {
                          onDeleteReview(selectedEntry.id, rev.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 active:scale-95 transition-all p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {rev.imageUrl && (
                  <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 mt-2">
                    <img src={rev.imageUrl} alt="시음 현장 사진" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-slate-700 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-200/80 text-sm shadow-2xs">
                  {rev.notes}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 이 술이 함께했던 파티 기록 */}
        {parties.filter(p => p.taggedLiquorIds.includes(selectedEntry.id)).length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="font-black text-rose-600 flex items-center space-x-1.5 uppercase tracking-wider text-xs">
              <PartyPopper className="w-4 h-4" />
              <span>이 술이 함께했던 파티 ({parties.filter(p => p.taggedLiquorIds.includes(selectedEntry.id)).length}회)</span>
            </h3>
            <div className="space-y-2.5">
              {parties.filter(p => p.taggedLiquorIds.includes(selectedEntry.id)).map(p => (
                <div
                  key={p.id}
                  onClick={() => onScreenChange('parties')}
                  className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-rose-100/60 active:scale-[0.99] transition-all shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-black text-rose-600 block">{p.date}</span>
                    <span className="text-sm font-black text-slate-900 mt-1 block">{p.title}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs shrink-0 ml-2">보러가기 →</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Review Button Bottom Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <button
          onClick={onOpenAddReview}
          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all border-2 border-amber-400"
        >
          <MessageSquarePlus className="w-5 h-5 stroke-[2.5]" />
          <span>새 날짜 시음 후기 추가</span>
        </button>
      </div>
    </motion.div>
  );
}
