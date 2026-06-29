import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Code, Smartphone, Coffee, Layers, ChevronRight, 
  HelpCircle, Check, Copy, Download, RefreshCw, Star, Info, ListFilter
} from 'lucide-react';
import { TastingEntry, TastingReview, RankingRecord, TastingParty } from './types';
import PhoneSimulator from './components/PhoneSimulator';
import CodeViewer from './components/CodeViewer';
import { composeTemplates } from './data/composeTemplates';

const DEFAULT_PARTIES: TastingParty[] = [
  {
    id: "party-init-1",
    date: "2026-06-28",
    title: "✨ 이태원 루프탑 와인 & 위스키 파티",
    location: "이태원 루프탑 테라스",
    companions: "지훈, 수아, 민기",
    notes: "여름밤 테라스에서 즐긴 환상의 모임. 숯불 그릴에 구운 양갈비와 샤토 마고의 마리아주가 일품이었고, 식후주로 맥캘란 12년과 지인 지훈이가 가져온 야마자키를 비교 시음함.",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=60",
    taggedLiquorIds: ["macallan12", "margaux2018"],
    externalLiquors: ["야마자키 12년 (지훈 지참)"]
  }
];

const DEFAULT_RANKINGS: RankingRecord[] = [
  {
    id: "rank-init-1",
    date: "2026-06-28",
    title: "🌟 6월 나만의 최애 주류 명예의 전당",
    items: [
      { liquorId: "macallan12", rank: 1, comment: "변함없는 최고의 셰리 오크 위스키" },
      { liquorId: "chateau-margaux", rank: 2, comment: "특별한 날을 빛내주는 우아하고 섬세한 여운" }
    ]
  }
];

const DEFAULT_TASTINGS: TastingEntry[] = [
  {
    id: "macallan12",
    name: "맥캘란 12년 셰리 오크",
    category: "Whiskey",
    abv: 40,
    imageUrl: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=60",
    reviews: [
      {
        id: "rev-mac-2",
        date: "2026-06-28",
        rating: 5,
        notes: "두 번째 시음. 에어링이 되면서 카라멜과 건포도 향이 더욱 짙어지고 목넘김이 한결 부드러워짐.",
        flavors: { sweet: 5, bitter: 2, sour: 1, body: 4, smoky: 2 },
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=60"
      },
      {
        id: "rev-mac-1",
        date: "2026-06-25",
        rating: 5,
        notes: "개봉 첫날. 셰리 오크 특유의 풍부한 말린 과일 향과 달콤한 카라멜, 시나몬 스파이스가 조화로움.",
        flavors: { sweet: 4, bitter: 2, sour: 1, body: 4, smoky: 2 }
      }
    ]
  },
  {
    id: "margaux2018",
    name: "샤토 마고 2018",
    category: "Wine",
    abv: 13.5,
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=60",
    reviews: [
      {
        id: "rev-mar-1",
        date: "2026-06-20",
        rating: 5,
        notes: "짙은 루비색. 블랙베리, 제비꽃, 흙 내음이 어우러지며 실크처럼 부드러운 타닌과 우아하고 긴 여운을 남김.",
        flavors: { sweet: 1, bitter: 3, sour: 4, body: 5, smoky: 1 }
      }
    ]
  },
  {
    id: "pellong",
    name: "제주 펠롱 에일",
    category: "Beer",
    abv: 5.5,
    reviews: [
      {
        id: "rev-pel-1",
        date: "2026-06-28",
        rating: 4,
        notes: "시트러스한 홉의 향이 신선하게 퍼지며, 가볍고 청량감 넘치게 즐길 수 있는 페일 에일.",
        flavors: { sweet: 2, bitter: 3, sour: 2, body: 2, smoky: 0 }
      }
    ]
  },
  {
    id: "hwayo25",
    name: "화요 25",
    category: "Korean",
    abv: 25,
    reviews: [
      {
        id: "rev-hwa-1",
        date: "2026-06-15",
        rating: 4,
        notes: "쌀 특유의 은은한 향과 부드럽고 깔끔한 목넘김. 얼음과 레몬을 곁들여 온더락으로 마시기 좋음.",
        flavors: { sweet: 2, bitter: 1, sour: 1, body: 3, smoky: 0 }
      }
    ]
  }
];

export default function App() {
  const [entries, setEntries] = useState<TastingEntry[]>(() => {
    const saved = localStorage.getItem('tasting_entries_1n');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].reviews)) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_TASTINGS;
  });

  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedFileName, setSelectedFileName] = useState<string>('TastingModels.kt');
  const [gradleCopied, setGradleCopied] = useState(false);

  const [rankingRecords, setRankingRecords] = useState<RankingRecord[]>(() => {
    const saved = localStorage.getItem('tasting_rankings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_RANKINGS;
  });

  const [parties, setParties] = useState<TastingParty[]>(() => {
    const saved = localStorage.getItem('tasting_parties');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { /* ignore */ }
    }
    return DEFAULT_PARTIES;
  });

  useEffect(() => {
    localStorage.setItem('tasting_entries_1n', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('tasting_rankings', JSON.stringify(rankingRecords));
  }, [rankingRecords]);

  useEffect(() => {
    localStorage.setItem('tasting_parties', JSON.stringify(parties));
  }, [parties]);

  const handleAddRankingRecord = (newRecord: RankingRecord) => {
    setRankingRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteRankingRecord = (recordId: string) => {
    setRankingRecords(prev => prev.filter(r => r.id !== recordId));
  };

  const handleAddParty = (newParty: TastingParty) => {
    setParties(prev => [newParty, ...prev]);
  };

  const handleDeleteParty = (partyId: string) => {
    setParties(prev => prev.filter(p => p.id !== partyId));
  };

  const handleAddLiquor = (newLiquor: TastingEntry) => {
    setEntries(prev => [newLiquor, ...prev]);
  };

  const handleUpdateLiquor = (updatedLiquor: TastingEntry) => {
    setEntries(prev => prev.map(item => item.id === updatedLiquor.id ? updatedLiquor : item));
  };

  const handleAddReview = (liquorId: string, newReview: TastingReview) => {
    setEntries(prev => prev.map(item => {
      if (item.id === liquorId) {
        return { ...item, reviews: [newReview, ...item.reviews] };
      }
      return item;
    }));
  };

  const handleDeleteLiquor = (liquorId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== liquorId));
  };

  const handleDeleteReview = (liquorId: string, reviewId: string) => {
    setEntries(prev => prev.map(item => {
      if (item.id === liquorId) {
        return { ...item, reviews: item.reviews.filter(r => r.id !== reviewId) };
      }
      return item;
    }));
  };

  const handleResetData = () => {
    if (confirm('모든 데이터를 초기 상태(더미 데이터)로 다시 세팅하시겠습니까?')) {
      setEntries(DEFAULT_TASTINGS);
      setRankingRecords(DEFAULT_RANKINGS);
      setParties(DEFAULT_PARTIES);
      setCurrentScreen('home');
    }
  };

  // Synchronize: When active code file changes or simulator navigates, keep both sides in sync
  const handleSyncSimulator = (target: string) => {
    if (target.endsWith('.kt')) {
      setSelectedFileName(target);
      if (target === 'TastingListScreen.kt') setCurrentScreen('home');
      else if (target === 'TastingFormScreen.kt') setCurrentScreen('add');
      else if (target === 'TastingDetailScreen.kt') setCurrentScreen('detail');
      else if (target === 'TastingRankingScreen.kt') setCurrentScreen('ranking');
      else if (target === 'TastingPartyScreen.kt') setCurrentScreen('parties');
    } else {
      setCurrentScreen(target);
      if (target === 'home') setSelectedFileName('TastingListScreen.kt');
      else if (target === 'add') setSelectedFileName('TastingFormScreen.kt');
      else if (target === 'detail') setSelectedFileName('TastingDetailScreen.kt');
      else if (target === 'ranking' || target === 'add_ranking') setSelectedFileName('TastingRankingScreen.kt');
      else if (target === 'parties' || target === 'add_party') setSelectedFileName('TastingPartyScreen.kt');
    }
  };

  const handleSelectFile = (fileName: string) => {
    handleSyncSimulator(fileName);
  };

  const handleDownloadAll = () => {
    // Generate a single text payload representing all files
    const separator = "========================================\n";
    const content = composeTemplates.map(f => {
      return `// 파일명: ${f.name}\n// 경로: ${f.path}\n// 설명: ${f.description}\n${separator}\n${f.code}\n\n`;
    }).join("\n");

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = "jetpack_compose_tasting_journal_code.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const gradleCode = `// app/build.gradle.kts (Dependencies Configuration)
dependencies {
    // Jetpack Compose Bom & UI Libraries
    val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Jetpack Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Activity integration for Compose
    implementation("androidx.activity:activity-compose:1.8.2")
}`;

  const copyGradle = () => {
    navigator.clipboard.writeText(gradleCode);
    setGradleCopied(true);
    setTimeout(() => setGradleCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-500/20 selection:text-slate-950">
      
      {/* Premium Elegant Header */}
      <header className="border-b-4 border-slate-900 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md font-black text-xl tracking-tight">
              🥃
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">My Cellar (주류 테이스팅 저널)</h1>
                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Material 3</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">홈 리스트 • 작성 입력 폼 • 상세 조회 화면 네비게이션 구조 설계 및 코드 생성기</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button 
              onClick={handleResetData}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition-all border-2 border-slate-200"
              title="초기 더미데이터로 리셋"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>샘플 데이터 리셋</span>
            </button>

            <button 
              onClick={handleDownloadAll}
              className="flex items-center space-x-1.5 px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>전체 코드 다운로드 (.txt)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Core Architecture Block */}
        <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold tracking-wider uppercase">
              <Layers className="w-4 h-4" />
              <span>Jetpack Compose UI & Navigation Architecture</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">안드로이드 단일 액티비티 기반 테이스팅 다이어리 구조</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl font-medium">
              본 앱은 구글의 공식 디자인 철학인 <strong>Material Design 3 (M3)</strong>를 충족하며, 단일 액티비티(<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px] border border-slate-200">MainActivity</code>) 내에서 <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px] border border-slate-200">NavHost</code>를 사용해 부드럽게 화면을 전환하는 선언형 네비게이션으로 구축되어 있습니다. 좌측 시뮬레이터에서 저장하고 삭제하는 동작이 우측 코드 파일들에 완벽히 매핑되어 제공됩니다.
            </p>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 shrink-0 flex items-center space-x-3 text-xs">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-amber-900">상호작용 연동 기능</p>
              <p className="text-amber-800 text-[11px] mt-0.5 font-medium">시뮬레이터에서 화면을 전환하면<br/>우측 IDE 탭 코드도 자동 동기화됩니다!</p>
            </div>
          </div>
        </div>

        {/* Dual Pane Layout (Simulator Left, Code Editor Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Phone Mockup & Controls (4 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="flex items-center space-x-2 mb-4 self-start">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-950 uppercase tracking-wider">가상 디바이스 실시간 테스트</span>
              </div>
              
              <PhoneSimulator 
                entries={entries}
                rankingRecords={rankingRecords}
                parties={parties}
                onAddLiquor={handleAddLiquor}
                onUpdateLiquor={handleUpdateLiquor}
                onAddReview={handleAddReview}
                onDeleteLiquor={handleDeleteLiquor}
                onDeleteReview={handleDeleteReview}
                onAddRankingRecord={handleAddRankingRecord}
                onDeleteRankingRecord={handleDeleteRankingRecord}
                onAddParty={handleAddParty}
                onDeleteParty={handleDeleteParty}
                currentScreen={currentScreen}
                onScreenChange={handleSyncSimulator}
              />
            </div>

            {/* Jetpack Compose Core Navigation Guide */}
            <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>주요 네비게이션 구조 가이드</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                안드로이드에서 화면 전환 시 데이터의 유연한 조작과 안전한 인수 전달을 위해 아래 라우팅 경로를 설계하였습니다:
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <div>
                    <strong className="text-slate-900 font-extrabold">Screen.Home ("home")</strong>
                    <p className="text-[11px] text-slate-500 font-medium">등록된 모든 테이스팅 내역을 카테고리별로 정렬/조회하는 메인 진입 대시보드</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <div>
                    <strong className="text-slate-900 font-extrabold">Screen.Add ("add")</strong>
                    <p className="text-[11px] text-slate-500 font-medium">별점 컴포넌트와 5대 향미(단맛, 쓴맛, 신맛 등)를 슬라이더로 조절하여 저장하는 신규 폼</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <div>
                    <strong className="text-slate-900 font-extrabold">Screen.Detail ("detail/{"{id}"}")</strong>
                    <p className="text-[11px] text-slate-500 font-medium">선택한 고유 ID값을 안전하게 인수로 받아, 해당 주류의 상세 세부 속성을 렌더링</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Code View Panel & Gradle Settings (7-8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Kotlin Code Editor Panel */}
            <CodeViewer 
              files={composeTemplates}
              selectedFileName={selectedFileName}
              onSelectFile={handleSelectFile}
              onSyncSimulator={handleSyncSimulator}
            />

            {/* Gradle Dependencies Block */}
            <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-slate-100 border-2 border-slate-200 rounded-lg">
                    <Coffee className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">프로젝트 의존성 추가 (Gradle Setup)</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">안드로이드 스튜디오에서 Jetpack Compose 빌드를 진행하기 위해 필수적인 라이브러리 목록</p>
                  </div>
                </div>

                <button
                  onClick={copyGradle}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all border border-slate-800"
                >
                  {gradleCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">복사완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>의존성 복사</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-900 p-4 rounded-2xl font-mono text-[11px] text-slate-200 leading-relaxed overflow-x-auto border border-slate-800">
                {gradleCode}
              </pre>
            </div>

            {/* Technical Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white border-4 border-slate-900 p-5 rounded-[2rem] space-y-2 shadow-sm">
                <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase">
                  <span>🛠️ M3 State Management</span>
                </div>
                <h4 className="text-sm font-bold text-slate-950">상태 보존 및 호이스팅 패턴</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Compose에서는 단방향 데이터 흐름(UDF)이 핵심입니다. 본 코드 구조에서는 <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[10px] border border-slate-200 font-mono">remember</code>와 <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[10px] border border-slate-200 font-mono">mutableStateOf</code>를 활용해 폼 입력값 및 리스트 필터 상태를 하위 컴포넌트로 전달하며 완벽한 상태 호이스팅을 실현합니다.
                </p>
              </div>

              <div className="bg-white border-4 border-slate-900 p-5 rounded-[2rem] space-y-2 shadow-sm">
                <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase">
                  <span>🎨 Premium Visual Styling</span>
                </div>
                <h4 className="text-sm font-bold text-slate-950">시각적 테마 브랜딩 (Honey & Oak)</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  주류 테이스팅에 매치되도록 꿀빛 위스키 골드와 차분한 참나무 오크통 갈색 톤을 바탕으로 한 커스텀 Material 3 컬러 팔레트를 설계했습니다. 다크 모드에 최적화되어 눈의 피로를 최소화합니다.
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Decorative footer */}
      <footer className="border-t-4 border-slate-900 bg-white mt-16 py-8 text-center text-xs text-slate-400 font-semibold">
        <p>My Cellar - Jetpack Compose Liquor Tasting Journal • Designed for Android Material Design 3</p>
        <p className="mt-1 text-[10px] text-slate-400">Built using React, Tailwind CSS and Lucide Icons in AI Studio Workspace</p>
      </footer>

    </div>
  );
}
