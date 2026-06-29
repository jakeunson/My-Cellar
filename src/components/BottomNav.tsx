import React from 'react';
import { Wine, PartyPopper, Trophy } from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}

export default function BottomNav({ currentScreen, onScreenChange }: BottomNavProps) {
  const isHomeActive = currentScreen === 'home' || currentScreen === 'add' || currentScreen === 'detail' || currentScreen === 'add_review' || currentScreen === 'edit_liquor';
  const isPartiesActive = currentScreen === 'parties' || currentScreen === 'add_party';
  const isRankingActive = currentScreen === 'ranking' || currentScreen === 'add_ranking';

  return (
    <div className="h-16 bg-white border-t border-slate-200/80 flex items-center justify-around shrink-0 z-20 px-2 shadow-lg">
      <button
        onClick={() => onScreenChange('home')}
        className={`flex flex-col items-center justify-center space-y-1 flex-1 py-1.5 transition-colors active:scale-95 ${
          isHomeActive
            ? 'text-slate-950 font-black'
            : 'text-slate-400 font-bold hover:text-slate-600'
        }`}
      >
        <Wine className={`w-6 h-6 ${isHomeActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-xs">내 셀러</span>
      </button>

      <button
        onClick={() => onScreenChange('parties')}
        className={`flex flex-col items-center justify-center space-y-1 flex-1 py-1.5 transition-colors active:scale-95 ${
          isPartiesActive
            ? 'text-rose-600 font-black'
            : 'text-slate-400 font-bold hover:text-slate-600'
        }`}
      >
        <PartyPopper className={`w-6 h-6 ${isPartiesActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-xs">파티</span>
      </button>

      <button
        onClick={() => onScreenChange('ranking')}
        className={`flex flex-col items-center justify-center space-y-1 flex-1 py-1.5 transition-colors active:scale-95 ${
          isRankingActive
            ? 'text-amber-600 font-black'
            : 'text-slate-400 font-bold hover:text-slate-600'
        }`}
      >
        <Trophy className={`w-6 h-6 ${isRankingActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-xs">명예의 전당</span>
      </button>
    </div>
  );
}
