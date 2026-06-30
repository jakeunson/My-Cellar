import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { TastingEntry, TastingReview, RankingRecord, TastingParty } from '../types';

// Components
import BottomNav from './BottomNav';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import AddLiquorScreen from './screens/AddLiquorScreen';
import EditLiquorScreen from './screens/EditLiquorScreen';
import AddReviewScreen from './screens/AddReviewScreen';
import RankingScreen from './screens/RankingScreen';
import AddRankingScreen from './screens/AddRankingScreen';
import PartyScreen from './screens/PartyScreen';
import AddPartyScreen from './screens/AddPartyScreen';

interface PhoneSimulatorProps {
  entries: TastingEntry[];
  rankingRecords?: RankingRecord[];
  parties?: TastingParty[];
  onAddLiquor: (entry: TastingEntry) => void;
  onUpdateLiquor?: (entry: TastingEntry) => void;
  onAddReview: (liquorId: string, review: TastingReview) => void;
  onDeleteLiquor: (id: string) => void;
  onDeleteReview: (liquorId: string, reviewId: string) => void;
  onAddRankingRecord?: (record: RankingRecord) => void;
  onDeleteRankingRecord?: (recordId: string) => void;
  onAddParty?: (party: TastingParty) => void;
  onDeleteParty?: (partyId: string) => void;
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}

export default function PhoneSimulator({
  entries,
  rankingRecords = [],
  parties = [],
  onAddLiquor,
  onUpdateLiquor,
  onAddReview,
  onDeleteLiquor,
  onDeleteReview,
  onAddRankingRecord,
  onDeleteRankingRecord,
  onAddParty,
  onDeleteParty,
  currentScreen,
  onScreenChange
}: PhoneSimulatorProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // 안드로이드 앱 종료 모달 및 종료 시뮬레이션 상태
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [isAppClosed, setIsAppClosed] = useState<boolean>(false);

  // 안드로이드 제스쳐 및 물리 뒤로가기 버튼(popstate) / ESC 키 입력 감지 핸들러
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);

      if (showExitModal) {
        setShowExitModal(false);
        return;
      }
      if (currentScreen === 'home') {
        setShowExitModal(true);
      } else if (currentScreen === 'add' || currentScreen === 'detail' || currentScreen === 'add_review' || currentScreen === 'edit_liquor') {
        onScreenChange('home');
      } else if (currentScreen === 'add_ranking') {
        onScreenChange('ranking');
      } else if (currentScreen === 'add_party') {
        onScreenChange('parties');
      } else {
        onScreenChange('home');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showExitModal) {
          setShowExitModal(false);
          return;
        }
        if (currentScreen === 'home') {
          setShowExitModal(true);
        } else if (currentScreen === 'add' || currentScreen === 'detail' || currentScreen === 'add_review' || currentScreen === 'edit_liquor') {
          onScreenChange('home');
        } else if (currentScreen === 'add_ranking') {
          onScreenChange('ranking');
        } else if (currentScreen === 'add_party') {
          onScreenChange('parties');
        } else {
          onScreenChange('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentScreen, onScreenChange, showExitModal]);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  return (
    <div className="relative w-full h-screen bg-slate-50 select-none flex flex-col justify-between overflow-hidden">
      {/* Screen Container */}
      <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col">
        {/* Dynamic Screen Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            {/* SCREEN 1: HOME LISTING */}
            {currentScreen === 'home' && (
              <HomeScreen
                entries={entries}
                rankingRecords={rankingRecords}
                onScreenChange={onScreenChange}
                setSelectedEntryId={setSelectedEntryId}
              />
            )}

            {/* SCREEN 2: ADD LIQUOR FORM */}
            {currentScreen === 'add' && (
              <AddLiquorScreen
                onAddLiquor={onAddLiquor}
                onScreenChange={onScreenChange}
              />
            )}

            {/* SCREEN 3: LIQUOR DETAIL */}
            {currentScreen === 'detail' && (
              <DetailScreen
                selectedEntry={selectedEntry || null}
                parties={parties}
                onScreenChange={onScreenChange}
                onDeleteLiquor={onDeleteLiquor}
                onDeleteReview={onDeleteReview}
                onOpenEdit={() => onScreenChange('edit_liquor')}
                onOpenAddReview={() => onScreenChange('add_review')}
                onUpdateLiquor={onUpdateLiquor}
              />
            )}

            {/* SCREEN 4: ADD REVIEW FORM */}
            {currentScreen === 'add_review' && selectedEntry && (
              <AddReviewScreen
                selectedEntry={selectedEntry}
                onAddReview={onAddReview}
                onScreenChange={onScreenChange}
              />
            )}

            {/* SCREEN 5: EDIT LIQUOR FORM */}
            {currentScreen === 'edit_liquor' && selectedEntry && (
              <EditLiquorScreen
                selectedEntry={selectedEntry}
                onUpdateLiquor={onUpdateLiquor}
                onScreenChange={onScreenChange}
              />
            )}

            {/* SCREEN 6: RANKING HALL OF FAME */}
            {currentScreen === 'ranking' && (
              <RankingScreen
                entries={entries}
                rankingRecords={rankingRecords}
                onScreenChange={onScreenChange}
                onDeleteRankingRecord={onDeleteRankingRecord}
                onOpenAddRanking={() => onScreenChange('add_ranking')}
              />
            )}

            {/* SCREEN 7: ADD RANKING SNAPSHOT FORM */}
            {currentScreen === 'add_ranking' && (
              <AddRankingScreen
                entries={entries}
                onAddRankingRecord={onAddRankingRecord}
                onScreenChange={onScreenChange}
              />
            )}

            {/* SCREEN 8: PARTIES TIMELINE */}
            {currentScreen === 'parties' && (
              <PartyScreen
                entries={entries}
                parties={parties}
                onScreenChange={onScreenChange}
                onDeleteParty={onDeleteParty}
                setSelectedEntryId={setSelectedEntryId}
                onOpenAddParty={() => onScreenChange('add_party')}
              />
            )}

            {/* SCREEN 9: ADD PARTY FORM */}
            {currentScreen === 'add_party' && (
              <AddPartyScreen
                entries={entries}
                onAddParty={onAddParty}
                onScreenChange={onScreenChange}
              />
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentScreen={currentScreen}
          onScreenChange={onScreenChange}
        />

        {/* 앱 종료 확인 모달 (Android Back on Home) */}
        {showExitModal && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6 animate-fade-in backdrop-blur-2xs">
            <div className="bg-white rounded-3xl p-5 w-full max-w-[260px] shadow-2xl text-center space-y-4 border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                👋
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm">앱 종료 확인</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  My Cellar 테이스팅 저널을<br />종료하시겠습니까?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    setIsAppClosed(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  종료
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 앱 종료 시뮬레이션 화면 */}
        {isAppClosed && (
          <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-6 text-center space-y-4 text-white">
            <span className="text-4xl animate-bounce">🍷</span>
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-tight">My Cellar 종료됨</h2>
              <p className="text-xs text-slate-400">안전하게 데이터가 백업 및 저장되었습니다.</p>
            </div>
            <button
              onClick={() => setIsAppClosed(false)}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              📱 앱 다시 실행하기
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
