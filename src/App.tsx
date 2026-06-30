import React, { useState } from 'react';
import PhoneSimulator from './components/PhoneSimulator';
import { useFirestore } from './hooks/useFirestore';

export default function App() {
  const {
    entries,
    rankingRecords,
    parties,
    isLoading,
    addLiquor,
    updateLiquor,
    deleteLiquor,
    addReview,
    deleteReview,
    addRankingRecord,
    deleteRankingRecord,
    addParty,
    deleteParty
  } = useFirestore();

  const [currentScreen, setCurrentScreen] = useState<string>('home');

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <span className="font-black text-sm tracking-widest text-slate-400 uppercase">My Cellar 동기화 중...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white overflow-hidden relative font-sans">
      <PhoneSimulator 
        entries={entries}
        rankingRecords={rankingRecords}
        parties={parties}
        onAddLiquor={addLiquor}
        onUpdateLiquor={updateLiquor}
        onAddReview={addReview}
        onDeleteLiquor={deleteLiquor}
        onDeleteReview={deleteReview}
        onAddRankingRecord={addRankingRecord}
        onDeleteRankingRecord={deleteRankingRecord}
        onAddParty={addParty}
        onDeleteParty={deleteParty}
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />
    </div>
  );
}
