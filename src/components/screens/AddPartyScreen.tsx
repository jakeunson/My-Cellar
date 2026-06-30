import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, AlertTriangle, Camera, X, Search } from 'lucide-react';
import { TastingEntry, TastingParty } from '../../types';
import { getCategoryEmoji, handleImageUpload, getCategoryKorean } from '../../utils/liquorUtils';

interface AddPartyScreenProps {
  entries: TastingEntry[];
  onAddParty?: (party: TastingParty) => void;
  onScreenChange: (screen: string) => void;
}

export default function AddPartyScreen({
  entries,
  onAddParty,
  onScreenChange
}: AddPartyScreenProps) {
  const [partyDate, setPartyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [partyTitle, setPartyTitle] = useState('');
  const [partyLocation, setPartyLocation] = useState('');
  const [partyCompanions, setPartyCompanions] = useState('');
  const [partyNotes, setPartyNotes] = useState('');
  const [partyImageUrl, setPartyImageUrl] = useState<string>('');
  const [partyTaggedLiquors, setPartyTaggedLiquors] = useState<string[]>([]);
  const [partyExternalLiquors, setPartyExternalLiquors] = useState<string[]>([]);
  const [partyExternalLiquorInput, setPartyExternalLiquorInput] = useState('');
  const [partyError, setPartyError] = useState('');

  const [showLiquorPicker, setShowLiquorPicker] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const handleSaveParty = () => {
    if (!onAddParty) return;
    if (!partyTitle.trim()) {
      setPartyError('모임/파티 제목을 입력해주세요.');
      return;
    }

    const newParty: TastingParty = {
      id: 'party-' + Date.now(),
      date: partyDate || new Date().toISOString().split('T')[0],
      title: partyTitle.trim(),
      location: partyLocation.trim() || undefined,
      companions: partyCompanions.trim() ? partyCompanions.split(',').map(c => c.trim()).filter(Boolean) : undefined,
      notes: partyNotes.trim() || '즐거웠던 주류 파티 기록',
      imageUrl: partyImageUrl || undefined,
      taggedLiquorIds: partyTaggedLiquors.length > 0 ? partyTaggedLiquors : undefined,
      externalLiquors: partyExternalLiquors.length > 0 ? partyExternalLiquors : undefined
    };

    onAddParty(newParty);
    onScreenChange('party');
  };

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'whisky', label: '🥃 위스키' },
    { id: 'wine', label: '🍷 와인' },
    { id: 'beer', label: '🍺 맥주' },
    { id: 'sake', label: '🍶 사케' },
    { id: 'traditional', label: '🇰🇷 전통주' },
    { id: 'other', label: '🍸 기타' }
  ];

  const filteredModalEntries = entries.filter(e => {
    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchQuery = !modalSearchQuery.trim() ||
      e.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      getCategoryKorean(e.category).toLowerCase().includes(modalSearchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <motion.div 
      key="add_party"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white relative"
    >
      <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
        <button onClick={() => onScreenChange('party')} className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800">새 파티 다이어리 작성</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs pb-24 custom-scrollbar">
        {partyError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{partyError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">모임 날짜</label>
          <input 
            type="date" value={partyDate} onChange={(e) => setPartyDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-bold text-slate-800 text-sm shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">파티 및 모임 제목 (필수)</label>
          <input 
            type="text" placeholder="예: 성수동 퇴근 후 위스키 파티"
            value={partyTitle} onChange={(e) => setPartyTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-bold text-slate-800 text-sm shadow-2xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">장소 (선택)</label>
            <input 
              type="text" placeholder="예: 몰트바 라벨"
              value={partyLocation} onChange={(e) => setPartyLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-bold text-slate-800 text-xs shadow-2xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">동행인 (콤마 구분)</label>
            <input 
              type="text" placeholder="예: 민수, 지영"
              value={partyCompanions} onChange={(e) => setPartyCompanions(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-bold text-slate-800 text-xs shadow-2xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">모임 분위기 및 페어링 후기</label>
          <textarea 
            rows={3} placeholder="어떤 음식과 페어링했나요? 사람들의 반응과 분위기를 자유롭게 남겨보세요."
            value={partyNotes} onChange={(e) => setPartyNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-medium text-slate-800 text-xs shadow-2xs leading-relaxed resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase flex justify-between">
            <span>📸 현장 단체/페어링 사진 (선택)</span>
            {partyImageUrl && <button type="button" onClick={() => setPartyImageUrl('')} className="text-red-500 hover:underline font-bold">삭제</button>}
          </label>
          {partyImageUrl ? (
            <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-2xs"><img src={partyImageUrl} alt="미리보기" className="w-full h-full object-cover" /></div>
          ) : (
            <label className="w-full h-24 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-500">디바이스 갤러리에서 사진 첨부 (클릭)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setPartyImageUrl)} />
            </label>
          )}
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-extrabold text-slate-700 uppercase flex items-center justify-between">
            <span>🍷 내 셀러 보유 주류 태그 ({partyTaggedLiquors.length}개 선택됨)</span>
          </label>

          {partyTaggedLiquors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {partyTaggedLiquors.map(lid => {
                const entry = entries.find(e => e.id === lid);
                if (!entry) return null;
                return (
                  <span
                    key={lid}
                    onClick={() => setPartyTaggedLiquors(partyTaggedLiquors.filter(id => id !== lid))}
                    className="bg-slate-900 text-amber-400 border border-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    <span>🍷 {entry.name}</span>
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setModalSearchQuery('');
              setSelectedCategory('all');
              setShowLiquorPicker(true);
            }}
            className="w-full bg-amber-50 border border-amber-400 text-amber-800 font-black py-3 rounded-xl hover:bg-amber-100 transition-all text-xs"
          >
            + 셀러에서 주류 태그 선택하기
          </button>
        </div>

        <div className="space-y-2 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/60 shadow-2xs">
          <label className="text-xs font-extrabold text-rose-800 uppercase">🍾 미보유/지인 지참 외부 주류 기록</label>
          <div className="flex space-x-2">
            <input
              type="text" placeholder="예: 야마자키 12년 (지훈 지참)"
              value={partyExternalLiquorInput}
              onChange={(e) => setPartyExternalLiquorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExternalLiquor())}
              className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            />
            <button
              type="button" onClick={handleAddExternalLiquor}
              className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black px-4 rounded-xl text-xs transition-all shrink-0"
            >
              추가
            </button>
          </div>

          {partyExternalLiquors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {partyExternalLiquors.map(name => (
                <span key={name} className="bg-white border border-rose-200 text-rose-900 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center space-x-1 shadow-2xs">
                  <span>🍾 {name}</span>
                  <button type="button" onClick={() => handleRemoveExternalLiquor(name)} className="hover:text-red-600"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="border-t border-slate-200 p-3.5 bg-white shrink-0">
        <button
          type="button" onClick={handleSaveParty}
          className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black py-3.5 rounded-xl text-sm transition-all shadow-md"
        >
          파티 다이어리 저장
        </button>
      </div>

      {/* Modal Picker */}
      <AnimatePresence>
        {showLiquorPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl max-h-[85%] flex flex-col p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">파티 주류 다중 선택</h3>
                  <p className="text-[11px] font-bold text-rose-600">{partyTaggedLiquors.length}개 선택됨</p>
                </div>
                <button
                  onClick={() => setShowLiquorPicker(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="🔍 주류 이름 또는 종류 검색..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 max-h-80">
                {filteredModalEntries.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-xs">조건에 맞는 주류가 없습니다.</p>
                ) : (
                  filteredModalEntries.map(e => {
                    const isSelected = partyTaggedLiquors.includes(e.id);
                    return (
                      <div
                        key={e.id}
                        onClick={() => {
                          if (isSelected) setPartyTaggedLiquors(partyTaggedLiquors.filter(id => id !== e.id));
                          else setPartyTaggedLiquors([...partyTaggedLiquors, e.id]);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{e.name}</p>
                          <p className="text-[11px] font-medium text-slate-500">{getCategoryKorean(e.category)}</p>
                        </div>
                        {isSelected && <span className="text-xs font-black text-amber-700">✓ 선택됨</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
