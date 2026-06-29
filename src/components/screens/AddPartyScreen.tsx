import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, AlertTriangle, Camera, X } from 'lucide-react';
import { TastingEntry, TastingParty } from '../../types';
import { getCategoryEmoji, handleImageUpload } from '../../utils/liquorUtils';

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
      notes: partyNotes.trim() || '즐거웠던 파티 시음 기록입니다.',
      imageUrl: partyImageUrl || undefined,
      taggedLiquorIds: partyTaggedLiquors,
      externalLiquors: partyExternalLiquors.length > 0 ? partyExternalLiquors : undefined
    };
    onAddParty(newParty);
    onScreenChange('parties');
  };

  return (
    <motion.div
      key="add_party"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white"
    >
      <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
        <button onClick={() => onScreenChange('parties')} className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800">새 파티 기록 추가</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs pb-24 custom-scrollbar">
        {partyError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{partyError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase">파티 날짜</label>
            <input type="date" value={partyDate} onChange={(e) => setPartyDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 font-bold text-sm shadow-2xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase">장소 (선택)</label>
            <input type="text" placeholder="예: 루프탑 테라스" value={partyLocation} onChange={(e) => setPartyLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 font-bold text-sm shadow-2xs" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase">파티 명칭 / 모임명</label>
          <input type="text" placeholder="예: 주말 연남동 와인 바 모임" value={partyTitle} onChange={(e) => setPartyTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3.5 font-bold text-sm shadow-2xs" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase">함께한 동석자 (선택)</label>
          <input type="text" placeholder="예: 지훈, 수아, 민기" value={partyCompanions} onChange={(e) => setPartyCompanions(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-bold text-sm shadow-2xs" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase">분위기 및 페어링 안주 총평</label>
          <textarea rows={3} placeholder="파티 분위기, 함께 먹은 요리, 술들의 마리아주 평 등을 자유롭게 적어보세요." value={partyNotes} onChange={(e) => setPartyNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3.5 font-medium text-sm resize-none shadow-2xs" />
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
              <span className="text-xs font-bold text-slate-500">사진 첨부 (클릭)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setPartyImageUrl)} />
            </label>
          )}
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 uppercase flex items-center justify-between">
            <span>🍷 내 셀러 보유 주류 태그 ({partyTaggedLiquors.length}개 선택됨)</span>
          </label>
          <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50 custom-scrollbar shadow-2xs">
            {entries.map(e => {
              const checked = partyTaggedLiquors.includes(e.id);
              return (
                <label key={e.id} className="flex items-center space-x-2.5 text-sm font-bold cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) setPartyTaggedLiquors(partyTaggedLiquors.filter(id => id !== e.id));
                      else setPartyTaggedLiquors([...partyTaggedLiquors, e.id]);
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-base">{getCategoryEmoji(e.category)}</span>
                  <span className="text-slate-800">{e.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/60 shadow-2xs">
          <label className="text-xs font-extrabold text-rose-800 uppercase">🍾 미보유/지인 지참 외부 주류 기록</label>
          <div className="flex space-x-2">
            <input
              type="text" placeholder="예: 야마자키 12년 (지훈 지참)"
              value={partyExternalLiquorInput}
              onChange={(e) => setPartyExternalLiquorInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold shadow-2xs"
            />
            <button
              type="button" onClick={handleAddExternalLiquor}
              className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-black shrink-0 transition-all shadow-sm"
            >
              추가
            </button>
          </div>
          {partyExternalLiquors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {partyExternalLiquors.map((ext, idx) => (
                <span key={idx} className="bg-white border border-rose-200 text-rose-900 text-xs font-bold px-3 py-1 rounded-lg flex items-center space-x-1.5 shadow-2xs">
                  <span>{ext}</span>
                  <button type="button" onClick={() => handleRemoveExternalLiquor(ext)} className="text-rose-400 hover:text-red-600 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="button" onClick={handleSaveParty} className="w-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl mt-4 transition-all">
          파티 기록 저장하기
        </button>
      </div>
    </motion.div>
  );
}
