import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Star, Trash2, ArrowLeft, Check, 
  Wifi, Battery, ShieldAlert, AlertTriangle, Calendar, Award, MessageSquarePlus,
  Image, Camera, Upload, X, Edit, Trophy, Medal, ListFilter, PlusCircle, MinusCircle, Wine,
  PartyPopper, Users, MapPin, Tag
} from 'lucide-react';
import { TastingEntry, TastingReview, LiquorCategory, FlavorProfile, RankingRecord, RankingItem, TastingParty } from '../types';

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
  isStandalone?: boolean;
}

// 오각 레이더 차트 컴포넌트 (타이틀 제거됨)
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
  onScreenChange,
  isStandalone = false
}: PhoneSimulatorProps) {
  const [activeTab, setActiveTab] = useState<LiquorCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByRank, setSortByRank] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  
  // 주류 등록 폼 상태
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<LiquorCategory>('Whiskey');
  const [formAbv, setFormAbv] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formError, setFormError] = useState('');

  // 주류 수정 폼 상태
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<LiquorCategory>('Whiskey');
  const [editAbv, setEditAbv] = useState<string>('');
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [editError, setEditError] = useState('');

  // 첫 시음 또는 추가 시음 후기 폼 상태
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formRating, setFormRating] = useState<number>(5);
  const [formNotes, setFormNotes] = useState('');
  const [formSweet, setFormSweet] = useState<number>(3);
  const [formBitter, setFormBitter] = useState<number>(2);
  const [formSour, setFormSour] = useState<number>(2);
  const [formBody, setFormBody] = useState<number>(4);
  const [formSmoky, setFormSmoky] = useState<number>(1);
  const [formReviewImageUrl, setFormReviewImageUrl] = useState<string>('');

  // 랭킹 등록 폼 상태 (수동 저장 방식, 자유 1~N위)
  const [rankingDate, setRankingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rankingTitle, setRankingTitle] = useState<string>('🏆 오늘의 최애 주류 순위');
  const [rankingItems, setRankingItems] = useState<RankingItem[]>([]);
  const [selectedLiquorToAdd, setSelectedLiquorToAdd] = useState<string>('');
  const [rankingComment, setRankingComment] = useState<string>('');
  const [rankingError, setRankingError] = useState<string>('');
  const [rankingSearchKeyword, setRankingSearchKeyword] = useState<string>('');

  // 파티(Party) 등록 폼 상태
  const [partyDate, setPartyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [partyTitle, setPartyTitle] = useState<string>('✨ 주말 와인 & 위스키 파티');
  const [partyLocation, setPartyLocation] = useState<string>('');
  const [partyCompanions, setPartyCompanions] = useState<string>('');
  const [partyNotes, setPartyNotes] = useState<string>('');
  const [partyImageUrl, setPartyImageUrl] = useState<string>('');
  const [partyTaggedLiquors, setPartyTaggedLiquors] = useState<string[]>([]);
  const [partyExternalLiquorInput, setPartyExternalLiquorInput] = useState<string>('');
  const [partyExternalLiquors, setPartyExternalLiquors] = useState<string[]>([]);
  const [partyError, setPartyError] = useState<string>('');

  // 안드로이드 앱 종료 모달 및 종료 시뮬레이션 상태
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [isAppClosed, setIsAppClosed] = useState<boolean>(false);

  // 안드로이드 제스쳐 및 물리 뒤로가기 버튼(popstate) / ESC 키 입력 감지 핸들러
  useEffect(() => {
    // 뒤로가기 제스쳐 감지를 위해 history에 현재 상태 push
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // 제스쳐 발생 시 페이지 탈출을 방지하기 위해 state를 다시 덮어씀
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

  // 가장 최근 날짜의 랭킹 스냅샷 가져오기
  const sortedRecords = [...rankingRecords].sort((a, b) => b.date.localeCompare(a.date));
  const latestRecord = sortedRecords[0] || null;

  // 특정 주류의 최신 랭킹 순위 조회
  const getLatestRank = (liquorId: string): number | null => {
    if (!latestRecord) return null;
    const found = latestRecord.items.find(item => item.liquorId === liquorId);
    return found ? found.rank : null;
  };

  // 이미지 업로드 변환 핸들러 (FileReader -> Base64 + Canvas 리사이징/압축으로 폰 카메라 고용량 이미지 완벽 대응)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800; // 최대 해상도 800px 제한 (localStorage 용량 보호)
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // JPEG 0.7 압축으로 용량 최적화 (약 50KB 수준)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setUrl(compressedDataUrl);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // 검색, 카테고리, 랭킹 정렬 필터링
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'ALL' || entry.category === activeTab;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (!sortByRank) return 0; // 기본 등록순
    const rankA = getLatestRank(a.id);
    const rankB = getLatestRank(b.id);
    if (rankA !== null && rankB !== null) return rankA - rankB;
    if (rankA !== null) return -1; // 순위 있는 술 상위 노출
    if (rankB !== null) return 1;
    return 0;
  });

  // 주류 평균 별점 계산
  const getAverageRating = (reviews: TastingReview[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  // 평균 향미 계산
  const getAverageFlavors = (reviews: TastingReview[]): FlavorProfile => {
    if (!reviews || reviews.length === 0) {
      return { sweet: 3, bitter: 2, sour: 2, body: 3, smoky: 1 };
    }
    const count = reviews.length;
    return {
      sweet: Math.round(reviews.reduce((acc, r) => acc + r.flavors.sweet, 0) / count),
      bitter: Math.round(reviews.reduce((acc, r) => acc + r.flavors.bitter, 0) / count),
      sour: Math.round(reviews.reduce((acc, r) => acc + r.flavors.sour, 0) / count),
      body: Math.round(reviews.reduce((acc, r) => acc + r.flavors.body, 0) / count),
      smoky: Math.round(reviews.reduce((acc, r) => acc + r.flavors.smoky, 0) / count),
    };
  };

  // 새 주류 등록 핸들러
  const handleSaveLiquor = () => {
    if (!formName.trim()) {
      setFormError('술 이름을 입력해주세요.');
      return;
    }
    const parsedAbv = parseFloat(formAbv);
    if (isNaN(parsedAbv) || parsedAbv < 0 || parsedAbv > 100) {
      setFormError('올바른 도수(0~100%)를 입력해주세요.');
      return;
    }

    const firstReview: TastingReview = {
      id: 'rev-' + Date.now(),
      date: formDate || new Date().toISOString().split('T')[0],
      rating: formRating,
      notes: formNotes.trim() || "첫 시음 기록입니다.",
      flavors: { sweet: formSweet, bitter: formBitter, sour: formSour, body: formBody, smoky: formSmoky },
      imageUrl: formReviewImageUrl || undefined
    };

    const newLiquor: TastingEntry = {
      id: 'liq-' + Date.now(),
      name: formName.trim(),
      category: formCategory,
      abv: parsedAbv,
      imageUrl: formImageUrl || undefined,
      reviews: [firstReview]
    };

    onAddLiquor(newLiquor);
    setFormName('');
    setFormAbv('');
    setFormNotes('');
    setFormImageUrl('');
    setFormReviewImageUrl('');
    setFormError('');
    onScreenChange('home');
  };

  // 주류 정보 수정 핸들러
  const handleOpenEdit = () => {
    if (!selectedEntry) return;
    setEditName(selectedEntry.name);
    setEditCategory(selectedEntry.category);
    setEditAbv(selectedEntry.abv.toString());
    setEditImageUrl(selectedEntry.imageUrl || '');
    setEditError('');
    onScreenChange('edit_liquor');
  };

  const handleSaveEditLiquor = () => {
    if (!selectedEntry || !onUpdateLiquor) return;
    if (!editName.trim()) {
      setEditError('술 이름을 입력해주세요.');
      return;
    }
    const parsedAbv = parseFloat(editAbv);
    if (isNaN(parsedAbv) || parsedAbv < 0 || parsedAbv > 100) {
      setEditError('올바른 도수(0~100%)를 입력해주세요.');
      return;
    }

    const updated: TastingEntry = {
      ...selectedEntry,
      name: editName.trim(),
      category: editCategory,
      abv: parsedAbv,
      imageUrl: editImageUrl || undefined
    };

    onUpdateLiquor(updated);
    onScreenChange('detail');
  };

  // 시음 후기 추가 핸들러
  const handleSaveReview = () => {
    if (!selectedEntryId) return;
    const newReview: TastingReview = {
      id: 'rev-' + Date.now(),
      date: formDate || new Date().toISOString().split('T')[0],
      rating: formRating,
      notes: formNotes.trim() || "시음 후기를 남겼습니다.",
      flavors: { sweet: formSweet, bitter: formBitter, sour: formSour, body: formBody, smoky: formSmoky },
      imageUrl: formReviewImageUrl || undefined
    };

    onAddReview(selectedEntryId, newReview);
    setFormNotes('');
    setFormReviewImageUrl('');
    onScreenChange('detail');
  };

  // 랭킹 항목 목록에 추가
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
    setRankingSearchKeyword('');
    setRankingError('');
  };

  // 랭킹 항목 삭제 및 순위 재정렬
  const handleRemoveItemFromRanking = (liquorId: string) => {
    const updated = rankingItems
      .filter(i => i.liquorId !== liquorId)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
    setRankingItems(updated);
  };

  // 최종 랭킹 스냅샷 저장
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
    setRankingItems([]);
    setRankingSearchKeyword('');
    setRankingError('');
    onScreenChange('ranking');
  };

  // 외부 주류 이름 추가 핸들러
  const handleAddExternalLiquor = () => {
    if (!partyExternalLiquorInput.trim()) return;
    if (partyExternalLiquors.includes(partyExternalLiquorInput.trim())) {
      setPartyError('이미 목록에 추가된 외부 주류입니다.');
      return;
    }
    setPartyExternalLiquors([...partyExternalLiquors, partyExternalLiquorInput.trim()]);
    setPartyExternalLiquorInput('');
    setPartyError('');
  };

  const handleRemoveExternalLiquor = (name: string) => {
    setPartyExternalLiquors(partyExternalLiquors.filter(l => l !== name));
  };

  // 파티 세션 저장 핸들러
  const handleSaveParty = () => {
    if (!onAddParty) return;
    if (!partyTitle.trim()) {
      setPartyError('파티 명칭을 입력해주세요.');
      return;
    }
    if (partyTaggedLiquors.length === 0 && partyExternalLiquors.length === 0) {
      setPartyError('내 셀러 주류를 선택하거나 외부 지참 주류를 최소 1개 이상 기록해주세요.');
      return;
    }
    const newParty: TastingParty = {
      id: 'party-' + Date.now(),
      date: partyDate || new Date().toISOString().split('T')[0],
      title: partyTitle.trim(),
      location: partyLocation.trim() || undefined,
      companions: partyCompanions.trim() || undefined,
      notes: partyNotes.trim() || "즐거웠던 파티 시음 기록입니다.",
      imageUrl: partyImageUrl || undefined,
      taggedLiquorIds: partyTaggedLiquors,
      externalLiquors: partyExternalLiquors.length > 0 ? partyExternalLiquors : undefined
    };
    onAddParty(newParty);
    setPartyTitle('✨ 주말 와인 & 위스키 파티');
    setPartyLocation('');
    setPartyCompanions('');
    setPartyNotes('');
    setPartyImageUrl('');
    setPartyTaggedLiquors([]);
    setPartyExternalLiquors([]);
    setPartyError('');
    onScreenChange('parties');
  };

  const getCategoryEmoji = (cat: LiquorCategory) => {
    switch(cat) {
      case 'Whiskey': return '🥃';
      case 'Wine': return '🍷';
      case 'Beer': return '🍺';
      case 'Sake': return '🍶';
      case 'Korean': return '🍶';
      case 'Cocktail': return '🍸';
      default: return '🍾';
    }
  };

  const getCategoryName = (cat: LiquorCategory) => {
    switch(cat) {
      case 'Whiskey': return '위스키';
      case 'Wine': return '와인';
      case 'Beer': return '맥주';
      case 'Sake': return '사케/청주';
      case 'Korean': return '전통주';
      case 'Cocktail': return '칵테일';
      default: return '기타 주류';
    }
  };

  // 랭킹 추가 시 키워드 검색 및 가나다 정렬된 주류 목록
  const rankingAvailableLiquors = entries
    .filter(e => {
      if (!rankingSearchKeyword.trim()) return true;
      const kw = rankingSearchKeyword.toLowerCase();
      return e.name.toLowerCase().includes(kw) || getCategoryName(e.category).includes(kw);
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const categories: { id: LiquorCategory | 'ALL'; label: string; emoji: string }[] = [
    { id: 'ALL', label: '전체', emoji: '🍸' },
    { id: 'Whiskey', label: '위스키', emoji: '🥃' },
    { id: 'Wine', label: '와인', emoji: '🍷' },
    { id: 'Beer', label: '맥주', emoji: '🍺' },
    { id: 'Korean', label: '전통주', emoji: '🍶' },
  ];

  return (
    <div className={isStandalone ? "relative w-full h-screen bg-white select-none flex flex-col justify-between overflow-hidden" : "relative w-[320px] h-[640px] bg-slate-950 rounded-[3rem] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-900/5 select-none flex flex-col justify-between"}>
      
      {/* Speaker / Sensor Notch (시뮬레이터 모드에서만 표시) */}
      {!isStandalone && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
        </div>
      )}

      {/* Screen Container */}
      <div className={isStandalone ? "w-full h-full bg-slate-50 overflow-hidden flex flex-col" : "relative w-full h-full bg-slate-50 rounded-[2.2rem] overflow-hidden flex flex-col pt-6 border border-slate-200/60 shadow-inner"}>
        
        {/* Status Bar (시뮬레이터 모드에서만 표시) */}
        {!isStandalone && (
          <div className="px-6 py-1 flex justify-between items-center text-[10px] font-bold text-slate-800 bg-white/80 backdrop-blur-md z-20 border-b border-slate-100 shrink-0">
            <span>9:41</span>
            <div className="flex items-center space-x-1.5">
              <Wifi className="w-3 h-3 text-slate-800" />
              <Battery className="w-3 h-3 text-slate-800 fill-slate-800" />
            </div>
          </div>
        )}

        {/* Dynamic Screen Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            {/* SCREEN 1: HOME LISTING */}
            {currentScreen === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* App Bar */}
                <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🍷</span>
                    <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">My Cellar</h1>
                  </div>
                  <button
                    onClick={() => setSortByRank(!sortByRank)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      sortByRank ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Trophy className="w-3 h-3" />
                    <span>{sortByRank ? '랭킹순' : '기본순'}</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 pt-3 pb-2 bg-white shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="술 이름으로 검색..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 transition-all"
                    />
                  </div>
                </div>

                {/* Category Chips */}
                <div className="px-4 py-2 bg-white border-b border-slate-200/80 flex space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center space-x-1 ${
                        activeTab === cat.id 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-20 custom-scrollbar">
                  {filteredEntries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                      <span className="text-3xl">📭</span>
                      <p className="text-xs font-bold">등록된 주류가 없습니다</p>
                    </div>
                  ) : (
                    filteredEntries.map(entry => {
                      const avgRating = getAverageRating(entry.reviews);
                      const reviewCount = entry.reviews?.length || 0;
                      const currentRank = getLatestRank(entry.id);

                      return (
                        <div
                          key={entry.id}
                          onClick={() => {
                            setSelectedEntryId(entry.id);
                            onScreenChange('detail');
                          }}
                          className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group relative"
                        >
                          {/* 랭킹 뱃지 표시 (좌측 상단 모서리) */}
                          {currentRank !== null && (
                            <div className={`absolute -top-2.5 -left-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md border flex items-center space-x-1 z-10 ${
                              currentRank === 1 ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-amber-500' :
                              currentRank === 2 ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 text-slate-900 border-slate-400' :
                              currentRank === 3 ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white border-amber-800' :
                              'bg-slate-800 text-white border-slate-900'
                            }`}>
                              <Medal className="w-3 h-3 shrink-0" />
                              <span>{currentRank}위</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative">
                              {entry.imageUrl ? (
                                <img src={entry.imageUrl} alt={entry.name} className="w-full h-full object-cover" />
                              ) : (
                                getCategoryEmoji(entry.category)
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <h3 className="text-xs font-extrabold text-slate-900 leading-tight line-clamp-1">{entry.name}</h3>
                              <div className="flex items-center space-x-1.5 text-[10px] font-medium text-slate-500">
                                <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 font-bold">{getCategoryName(entry.category)}</span>
                                <span>•</span>
                                <span>ABV {entry.abv}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <div className="flex items-center space-x-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="text-[11px] font-extrabold text-amber-800">{avgRating}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 mt-1">{reviewCount}회 시음</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Floating Action Button */}
                <button
                  onClick={() => {
                    setFormError('');
                    setFormImageUrl('');
                    setFormReviewImageUrl('');
                    onScreenChange('add');
                  }}
                  className="absolute bottom-16 right-4 w-12 h-12 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all border-2 border-slate-700 z-10"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </motion.div>
            )}

            {/* SCREEN 2: ADD LIQUOR FORM */}
            {currentScreen === 'add' && (
              <motion.div 
                key="add"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col h-full overflow-hidden bg-white"
              >
                <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
                  <button 
                    onClick={() => onScreenChange('home')}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xs font-bold text-slate-800">새 주류 및 첫 시음 등록</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs pb-16 custom-scrollbar">
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">술 이름</label>
                    <input 
                      type="text" 
                      placeholder="예: 발베니 12년 더블우드"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">주종 종류</label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as LiquorCategory)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800"
                      >
                        <option value="Whiskey">🥃 위스키</option>
                        <option value="Wine">🍷 와인</option>
                        <option value="Beer">🍺 맥주</option>
                        <option value="Korean">🍶 전통주</option>
                        <option value="Cocktail">🍸 칵테일</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">도수 (ABV %)</label>
                      <input 
                        type="number" step="0.1" placeholder="예: 40"
                        value={formAbv}
                        onChange={(e) => setFormAbv(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  {/* 주류 대표 이미지 등록 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>🍾 주류 대표 사진 (선택)</span>
                      {formImageUrl && (
                        <button type="button" onClick={() => setFormImageUrl('')} className="text-red-500 hover:underline">삭제</button>
                      )}
                    </label>
                    {formImageUrl ? (
                      <div className="w-full h-28 rounded-xl overflow-hidden border border-slate-200 relative group">
                        <img src={formImageUrl} alt="주류 미리보기" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="w-full h-20 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">술병 사진 첨부 (클릭)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormImageUrl)} />
                      </label>
                    )}
                  </div>

                  <hr className="border-slate-200" />

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">첫 번째 시음 평가</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">시음 날짜</span>
                      <input 
                        type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">만족도 별점</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setFormRating(star)}>
                            <Star className={`w-5 h-5 ${star <= formRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <h4 className="text-[10px] font-bold text-slate-600">향미 슬라이더 (0~5점)</h4>
                    {[
                      { label: '단맛 (Sweet)', val: formSweet, set: setFormSweet },
                      { label: '쓴맛 (Bitter)', val: formBitter, set: setFormBitter },
                      { label: '신맛 (Sour)', val: formSour, set: setFormSour },
                      { label: '바디감 (Body)', val: formBody, set: setFormBody },
                      { label: '스모키함', val: formSmoky, set: setFormSmoky },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <span className="w-16 font-bold text-slate-600">{item.label}</span>
                        <input type="range" min="0" max="5" value={item.val} onChange={(e) => item.set(parseInt(e.target.value))} className="flex-1 mx-2 accent-amber-500 h-1 bg-slate-200 rounded-lg cursor-pointer" />
                        <span className="w-5 text-right font-bold text-slate-900">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* 첫 시음 인증 사진 등록 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>📸 시음 현장 사진 (선택)</span>
                      {formReviewImageUrl && (
                        <button type="button" onClick={() => setFormReviewImageUrl('')} className="text-red-500 hover:underline">삭제</button>
                      )}
                    </label>
                    {formReviewImageUrl ? (
                      <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 relative">
                        <img src={formReviewImageUrl} alt="시음 사진 미리보기" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="w-full h-16 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-slate-50 transition-colors">
                        <Image className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">시음 사진 첨부 (클릭)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormReviewImageUrl)} />
                      </label>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">시음 메모</label>
                    <textarea 
                      placeholder="향, 맛, 피니시 등을 자유롭게 기록하세요..." value={formNotes} rows={3} onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800 resize-none"
                    />
                  </div>

                  <button type="button" onClick={handleSaveLiquor} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs shadow-md mt-2">
                    주류 및 시음 저장하기
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: DETAIL VIEW (1:N Reviews) */}
            {currentScreen === 'detail' && selectedEntry && (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col h-full overflow-hidden bg-white"
              >
                <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onScreenChange('home')} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-xs font-bold text-slate-800">주류 시음 히스토리</h1>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={handleOpenEdit}
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                      title="주류 정보 수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('이 주류와 모든 시음 기록을 삭제하시겠습니까?')) {
                          onDeleteLiquor(selectedEntry.id);
                          onScreenChange('home');
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20 custom-scrollbar text-xs">
                  {/* Hero Summary with Image */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 text-center shadow-md relative overflow-hidden flex flex-col items-center">
                    {selectedEntry.imageUrl ? (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md mb-2">
                        <img src={selectedEntry.imageUrl} alt={selectedEntry.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-4xl block mb-1">{getCategoryEmoji(selectedEntry.category)}</span>
                    )}
                    <h2 className="text-sm font-extrabold tracking-tight">{selectedEntry.name}</h2>
                    <div className="flex justify-center gap-2 mt-2">
                      <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400">{getCategoryName(selectedEntry.category)}</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-300">ABV {selectedEntry.abv}%</span>
                    </div>
                  </div>

                  {/* Radar Chart (타이틀 제거됨) */}
                  <RadarChart flavors={getAverageFlavors(selectedEntry.reviews)} />

                  {/* Reviews Timeline Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>날짜별 시음 기록 ({selectedEntry.reviews?.length || 0}회)</span>
                    </span>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {!selectedEntry.reviews || selectedEntry.reviews.length === 0 ? (
                      <p className="text-center text-slate-400 py-4 font-bold">아직 시음 기록이 없습니다.</p>
                    ) : (
                      selectedEntry.reviews.map((rev) => (
                        <div key={rev.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 relative group">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                              📅 {rev.date}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-amber-500 font-extrabold text-xs">
                                <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                                <span>{rev.rating}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  if (confirm('이 시음 후기를 삭제하시겠습니까?')) {
                                    onDeleteReview(selectedEntry.id, rev.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {rev.imageUrl && (
                            <div className="w-full h-36 rounded-lg overflow-hidden border border-slate-200 mt-1">
                              <img src={rev.imageUrl} alt="시음 현장 사진" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <p className="text-slate-700 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-slate-100 text-[11px]">
                            {rev.notes}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 이 술이 함께했던 파티 기록 */}
                  {parties.filter(p => p.taggedLiquorIds.includes(selectedEntry.id)).length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <h3 className="font-extrabold text-rose-600 flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                        <PartyPopper className="w-3.5 h-3.5" />
                        <span>이 술이 함께했던 파티 ({parties.filter(p => p.taggedLiquorIds.includes(selectedEntry.id)).length}회)</span>
                      </h3>
                      <div className="space-y-1.5">
                        {parties.filter(p => p.taggedLiquorIds.includes(selectedEntry.id)).map(p => (
                          <div
                            key={p.id}
                            onClick={() => onScreenChange('parties')}
                            className="bg-rose-50/60 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:bg-rose-100/60 transition-colors"
                          >
                            <div>
                              <span className="text-[10px] font-extrabold text-rose-600 block">{p.date}</span>
                              <span className="text-xs font-black text-slate-800">{p.title}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">보러가기 →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Review Button Bottom Bar */}
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <button
                    onClick={() => {
                      setFormNotes('');
                      setFormRating(5);
                      setFormReviewImageUrl('');
                      onScreenChange('add_review');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white py-3 rounded-2xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all border-2 border-amber-400"
                  >
                    <MessageSquarePlus className="w-4 h-4 stroke-[2.5]" />
                    <span>➕ 새 날짜 시음 후기 추가</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 4: ADD REVIEW FORM */}
            {currentScreen === 'add_review' && selectedEntry && (
              <motion.div 
                key="add_review"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col h-full overflow-hidden bg-white"
              >
                <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
                  <button onClick={() => onScreenChange('detail')} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xs font-bold text-slate-800">[{selectedEntry.name}] 후기 추가</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs pb-16 custom-scrollbar">
                  <div className="space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">시음 날짜</span>
                      <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 font-bold" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">이번 시음 별점</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setFormRating(star)}>
                            <Star className={`w-5 h-5 ${star <= formRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <h4 className="text-[10px] font-bold text-slate-600">이번 시음의 향미 평가 (0~5점)</h4>
                    {[
                      { label: '단맛 (Sweet)', val: formSweet, set: setFormSweet },
                      { label: '쓴맛 (Bitter)', val: formBitter, set: setFormBitter },
                      { label: '신맛 (Sour)', val: formSour, set: setFormSour },
                      { label: '바디감 (Body)', val: formBody, set: setFormBody },
                      { label: '스모키함', val: formSmoky, set: setFormSmoky },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <span className="w-16 font-bold text-slate-600">{item.label}</span>
                        <input type="range" min="0" max="5" value={item.val} onChange={(e) => item.set(parseInt(e.target.value))} className="flex-1 mx-2 accent-amber-500 h-1 bg-slate-200 rounded-lg cursor-pointer" />
                        <span className="w-5 text-right font-bold text-slate-900">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* 시음 인증 사진 등록 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>📸 이번 시음 현장 사진 (선택)</span>
                      {formReviewImageUrl && (
                        <button type="button" onClick={() => setFormReviewImageUrl('')} className="text-red-500 hover:underline">삭제</button>
                      )}
                    </label>
                    {formReviewImageUrl ? (
                      <div className="w-full h-28 rounded-xl overflow-hidden border border-slate-200 relative">
                        <img src={formReviewImageUrl} alt="시음 사진 미리보기" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="w-full h-20 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 transition-colors">
                        <Camera className="w-5 h-5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">시음 사진 첨부 (클릭)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormReviewImageUrl)} />
                      </label>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">오늘의 시음 노트</label>
                    <textarea 
                      placeholder="에어링 상태나 페어링 안주, 분위기 등을 기록하세요..." value={formNotes} rows={3} onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-slate-800 resize-none"
                    />
                  </div>

                  <button type="button" onClick={handleSaveReview} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold text-xs shadow-md mt-2">
                    후기 추가 저장하기
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 5: EDIT LIQUOR FORM */}
            {currentScreen === 'edit_liquor' && selectedEntry && (
              <motion.div 
                key="edit_liquor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col h-full overflow-hidden bg-white"
              >
                <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
                  <button onClick={() => onScreenChange('detail')} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xs font-bold text-slate-800">[{selectedEntry.name}] 정보 수정</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs pb-16 custom-scrollbar">
                  {editError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">술 이름</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">주종 종류</label>
                      <select 
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as LiquorCategory)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800"
                      >
                        <option value="Whiskey">🥃 위스키</option>
                        <option value="Wine">🍷 와인</option>
                        <option value="Beer">🍺 맥주</option>
                        <option value="Korean">🍶 전통주</option>
                        <option value="Cocktail">🍸 칵테일</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">도수 (ABV %)</label>
                      <input 
                        type="number" step="0.1" 
                        value={editAbv}
                        onChange={(e) => setEditAbv(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span>🍾 주류 대표 사진 변경 (선택)</span>
                      {editImageUrl && (
                        <button type="button" onClick={() => setEditImageUrl('')} className="text-red-500 hover:underline">삭제</button>
                      )}
                    </label>
                    {editImageUrl ? (
                      <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 relative">
                        <img src={editImageUrl} alt="주류 미리보기" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <label className="w-full h-20 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">새 술병 사진 첨부 (클릭)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setEditImageUrl)} />
                      </label>
                    )}
                  </div>

                  <button type="button" onClick={handleSaveEditLiquor} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs shadow-md mt-4">
                    수정 내용 저장하기
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 6: RANKING HALL OF FAME (🏆 명예의 전당) */}
            {currentScreen === 'ranking' && (
              <motion.div 
                key="ranking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* App Bar */}
                <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">명예의 전당 히스토리</h1>
                  </div>
                </div>

                {/* Ranking Records List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 custom-scrollbar text-xs">
                  {sortedRecords.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                      <Trophy className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs font-bold">등록된 랭킹 스냅샷이 없습니다.<br/>[+] 버튼을 눌러 순위를 기록해보세요!</p>
                    </div>
                  ) : (
                    sortedRecords.map(rec => (
                      <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2 relative group">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <div>
                            <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              📅 {rec.date}
                            </span>
                            <h3 className="text-xs font-extrabold text-slate-900 mt-1">{rec.title}</h3>
                          </div>
                          {onDeleteRankingRecord && (
                            <button
                              onClick={() => {
                                if (confirm('이 날짜의 랭킹 스냅샷을 삭제하시겠습니까?')) {
                                  onDeleteRankingRecord(rec.id);
                                }
                              }}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Ranked Items */}
                        <div className="space-y-1.5 pt-1">
                          {rec.items.map(item => {
                            const liq = entries.find(e => e.id === item.liquorId);
                            return (
                              <div key={item.liquorId} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                    item.rank === 1 ? 'bg-amber-400 text-slate-950' :
                                    item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                                    item.rank === 3 ? 'bg-amber-700 text-white' :
                                    'bg-slate-800 text-white'
                                  }`}>
                                    {item.rank}
                                  </span>
                                  <span className="font-bold text-slate-800">{liq ? liq.name : '(삭제된 주류)'}</span>
                                </div>
                                {item.comment && (
                                  <span className="text-[10px] font-medium text-slate-500 line-clamp-1 max-w-[120px]">{item.comment}</span>
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
                  onClick={() => {
                    setRankingItems([]);
                    setRankingTitle('🏆 오늘의 최애 주류 순위');
                    setRankingError('');
                    onScreenChange('add_ranking');
                  }}
                  className="absolute bottom-16 right-4 w-12 h-12 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all border-2 border-amber-400 z-10"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </motion.div>
            )}

            {/* SCREEN 7: ADD RANKING SNAPSHOT FORM (수동 유연한 1~N위) */}
            {currentScreen === 'add_ranking' && (
              <motion.div 
                key="add_ranking"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col h-full overflow-hidden bg-white"
              >
                <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
                  <button onClick={() => onScreenChange('ranking')} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xs font-bold text-slate-800">새 랭킹 스냅샷 등록</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs pb-16 custom-scrollbar">
                  {rankingError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{rankingError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">기준 날짜</label>
                    <input 
                      type="date" value={rankingDate} onChange={(e) => setRankingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">랭킹 제목</label>
                    <input 
                      type="text" placeholder="예: 2026 여름 최애 위스키 순위"
                      value={rankingTitle} onChange={(e) => setRankingTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-bold text-slate-800"
                    />
                  </div>

                  <hr className="border-slate-200" />

                  {/* 유연한 순위 목록 추가 컨트롤 */}
                  <div className="space-y-2 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60">
                    <h3 className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest flex items-center gap-1">
                      <Medal className="w-3.5 h-3.5 text-amber-600" />
                      <span>1위부터 순서대로 추가하기</span>
                    </h3>

                    <div className="space-y-1.5">
                      <select
                        value={selectedLiquorToAdd}
                        onChange={(e) => setSelectedLiquorToAdd(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-2.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- 순위에 추가할 술 선택 --</option>
                        {entries.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({getCategoryName(e.category)})</option>
                        ))}
                      </select>
                      <input
                        type="text" placeholder="선정 이유 짧은 메모 (선택)"
                        value={rankingComment} onChange={(e) => setRankingComment(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-[11px]"
                      />
                      <button
                        type="button" onClick={handleAddItemToRanking}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{rankingItems.length + 1}위로 추가하기</span>
                      </button>
                    </div>
                  </div>

                  {/* 확정된 랭킹 항목 목록 */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                      현재 선정된 순위 ({rankingItems.length}개)
                    </h4>
                    {rankingItems.length === 0 ? (
                      <p className="text-center text-slate-400 py-4 font-medium text-[11px]">위 박스에서 술을 선택해 순위를 채워보세요.</p>
                    ) : (
                      rankingItems.map((item) => {
                        const liq = entries.find(e => e.id === item.liquorId);
                        return (
                          <div key={item.liquorId} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                                {item.rank}
                              </span>
                              <div>
                                <h5 className="font-extrabold text-slate-800">{liq?.name}</h5>
                                {item.comment && <p className="text-[10px] text-slate-500">{item.comment}</p>}
                              </div>
                            </div>
                            <button
                              type="button" onClick={() => handleRemoveItemFromRanking(item.liquorId)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button" onClick={handleSaveRankingSnapshot}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-extrabold text-xs shadow-md mt-4"
                  >
                    랭킹 스냅샷 저장하기
                  </button>
                </div>
              </motion.div>
            )}

            {/* 7. 파티(Party) 타임라인 목록 화면 */}
            {currentScreen === 'parties' && (
              <motion.div
                key="parties"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* App Bar */}
                <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <PartyPopper className="w-5 h-5 text-rose-600" />
                    <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">주류 파티 다이어리</h1>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 custom-scrollbar text-xs">
                  {parties.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                      <span className="text-3xl">🥳</span>
                      <p className="text-xs font-bold">아직 기록된 파티가 없습니다</p>
                      <p className="text-[10px] text-slate-400">좋은 사람들과 나눈 술자리 추억을 기록해보세요.</p>
                    </div>
                  ) : (
                    parties.map(party => (
                      <div key={party.id} className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm space-y-2.5 relative group">
                        {onDeleteParty && (
                          <button
                            onClick={() => {
                              if (confirm('이 파티 기록을 삭제하시겠습니까?')) onDeleteParty(party.id);
                            }}
                            className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="파티 기록 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="flex items-center space-x-1.5 text-[10px] font-extrabold text-rose-600">
                          <Calendar className="w-3 h-3" />
                          <span>{party.date}</span>
                        </div>
                        <h3 className="text-xs font-black text-slate-900 pr-6">{party.title}</h3>
                        {(party.location || party.companions) && (
                          <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            {party.location && (
                              <span className="flex items-center space-x-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{party.location}</span>
                              </span>
                            )}
                            {party.companions && (
                              <span className="flex items-center space-x-0.5">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span>{party.companions}</span>
                              </span>
                            )}
                          </div>
                        )}
                        {party.imageUrl && (
                          <div className="w-full h-28 rounded-xl overflow-hidden border border-slate-200">
                            <img src={party.imageUrl} alt={party.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-[11px] text-slate-700 leading-relaxed font-medium bg-rose-50/40 p-2 rounded-xl border border-rose-100/60">{party.notes}</p>
                        
                        {/* 마신 술 태그 목록 */}
                        <div className="pt-1 space-y-1">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            <span>함께 나눈 주류</span>
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {party.taggedLiquorIds.map(lid => {
                              const liq = entries.find(e => e.id === lid);
                              return liq ? (
                                <span
                                  key={lid}
                                  onClick={() => { setSelectedEntryId(lid); onScreenChange('detail'); }}
                                  className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer hover:bg-slate-800 transition-colors flex items-center space-x-1 shadow-2xs"
                                >
                                  <span>{getCategoryEmoji(liq.category)}</span>
                                  <span>{liq.name}</span>
                                </span>
                              ) : null;
                            })}
                            {party.externalLiquors?.map((ext, idx) => (
                              <span key={idx} className="bg-rose-100 text-rose-900 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
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
                  onClick={() => {
                    setPartyError('');
                    setPartyDate(new Date().toISOString().split('T')[0]);
                    setPartyTitle('');
                    setPartyLocation('');
                    setPartyCompanions('');
                    setPartyNotes('');
                    setPartyImageUrl('');
                    setPartyTaggedLiquors([]);
                    setPartyExternalLiquors([]);
                    setPartyExternalLiquorInput('');
                    onScreenChange('add_party');
                  }}
                  className="absolute bottom-16 right-4 w-12 h-12 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all border-2 border-rose-500 z-10"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </motion.div>
            )}

            {/* 8. 새 파티(Party) 기록 추가 화면 */}
            {currentScreen === 'add_party' && (
              <motion.div
                key="add_party"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full overflow-hidden bg-white"
              >
                <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
                  <button onClick={() => onScreenChange('parties')} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xs font-bold text-slate-800">새 파티 기록 추가</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs pb-16 custom-scrollbar">
                  {partyError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{partyError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">파티 날짜</label>
                      <input type="date" value={partyDate} onChange={(e) => setPartyDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 font-bold text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">장소 (선택)</label>
                      <input type="text" placeholder="예: 루프탑 테라스" value={partyLocation} onChange={(e) => setPartyLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 font-bold text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">파티 명칭 / 모임명</label>
                    <input type="text" placeholder="예: 주말 연남동 와인 바 모임" value={partyTitle} onChange={(e) => setPartyTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-bold text-xs" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">함께한 동석자 (선택)</label>
                    <input type="text" placeholder="예: 지훈, 수아, 민기" value={partyCompanions} onChange={(e) => setPartyCompanions(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 font-bold text-xs" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase">분위기 및 페어링 안주 총평</label>
                    <textarea rows={3} placeholder="파티 분위기, 함께 먹은 요리, 술들의 마리아주 평 등을 자유롭게 적어보세요." value={partyNotes} onChange={(e) => setPartyNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-bold text-xs resize-none" />
                  </div>

                  {/* 사진 첨부 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase flex justify-between">
                      <span>📸 현장 단체/페어링 사진 (선택)</span>
                      {partyImageUrl && <button type="button" onClick={() => setPartyImageUrl('')} className="text-red-500 hover:underline">삭제</button>}
                    </label>
                    {partyImageUrl ? (
                      <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200"><img src={partyImageUrl} alt="미리보기" className="w-full h-full object-cover" /></div>
                    ) : (
                      <label className="w-full h-16 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50">
                        <Camera className="w-4 h-4 text-slate-400 mb-0.5" />
                        <span className="text-[10px] font-bold text-slate-500">사진 첨부 (클릭)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setPartyImageUrl)} />
                      </label>
                    )}
                  </div>

                  <hr className="border-slate-200" />

                  {/* 내 셀러 주류 선택 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-700 uppercase flex items-center justify-between">
                      <span>🍷 내 셀러 보유 주류 태그 ({partyTaggedLiquors.length}개 선택됨)</span>
                    </label>
                    <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50 custom-scrollbar">
                      {entries.map(e => {
                        const checked = partyTaggedLiquors.includes(e.id);
                        return (
                          <label key={e.id} className="flex items-center space-x-2 text-xs font-bold cursor-pointer hover:bg-white p-1 rounded">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) setPartyTaggedLiquors(partyTaggedLiquors.filter(id => id !== e.id));
                                else setPartyTaggedLiquors([...partyTaggedLiquors, e.id]);
                              }}
                              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                            />
                            <span>{getCategoryEmoji(e.category)}</span>
                            <span className="text-slate-800">{e.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 미보유 외부 주류 추가 */}
                  <div className="space-y-1.5 bg-rose-50/50 p-2.5 rounded-xl border border-rose-200/60">
                    <label className="text-[10px] font-extrabold text-rose-800 uppercase">🍾 미보유/지인 지참 외부 주류 기록</label>
                    <div className="flex space-x-1.5">
                      <input
                        type="text" placeholder="예: 야마자키 12년 (지훈 지참)"
                        value={partyExternalLiquorInput}
                        onChange={(e) => setPartyExternalLiquorInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold"
                      />
                      <button
                        type="button" onClick={handleAddExternalLiquor}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-xl text-xs font-extrabold shrink-0"
                      >
                        추가
                      </button>
                    </div>
                    {partyExternalLiquors.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {partyExternalLiquors.map((ext, idx) => (
                          <span key={idx} className="bg-white border border-rose-200 text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-2xs">
                            <span>{ext}</span>
                            <button type="button" onClick={() => handleRemoveExternalLiquor(ext)} className="text-rose-400 hover:text-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={handleSaveParty} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-xs shadow-md mt-4">
                    파티 기록 저장하기
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Navigation Bar (홈 vs 파티 vs 랭킹) */}
        <div className="h-14 bg-white border-t border-slate-200/80 flex items-center justify-around shrink-0 z-20 px-2">
          <button
            onClick={() => onScreenChange('home')}
            className={`flex flex-col items-center justify-center space-y-0.5 flex-1 py-1 transition-colors ${
              currentScreen === 'home' || currentScreen === 'add' || currentScreen === 'detail' || currentScreen === 'add_review' || currentScreen === 'edit_liquor'
                ? 'text-slate-950 font-extrabold'
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <Wine className={`w-5 h-5 ${currentScreen === 'home' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">내 셀러</span>
          </button>

          <button
            onClick={() => onScreenChange('parties')}
            className={`flex flex-col items-center justify-center space-y-0.5 flex-1 py-1 transition-colors ${
              currentScreen === 'parties' || currentScreen === 'add_party'
                ? 'text-rose-600 font-extrabold'
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <PartyPopper className={`w-5 h-5 ${currentScreen === 'parties' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">파티</span>
          </button>

          <button
            onClick={() => onScreenChange('ranking')}
            className={`flex flex-col items-center justify-center space-y-0.5 flex-1 py-1 transition-colors ${
              currentScreen === 'ranking' || currentScreen === 'add_ranking'
                ? 'text-amber-600 font-extrabold'
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <Trophy className={`w-5 h-5 ${currentScreen === 'ranking' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">명예의 전당</span>
          </button>
        </div>

        {/* Full-screen Gesture Navigation Bar (최소화된 제스쳐 홈 바 - 시뮬레이터 모드 전용) */}
        {!isStandalone && (
          <div className="h-4 w-full bg-white flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
          </div>
        )}

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
