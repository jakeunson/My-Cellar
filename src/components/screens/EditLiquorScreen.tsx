import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, AlertTriangle, Camera } from 'lucide-react';
import { TastingEntry, LiquorCategory } from '../../types';
import { handleImageUpload, getCategoryKorean, getCategoryEmoji } from '../../utils/liquorUtils';

interface EditLiquorScreenProps {
  selectedEntry: TastingEntry;
  onUpdateLiquor?: (entry: TastingEntry) => void;
  onScreenChange: (screen: string) => void;
}

const CATEGORIES: LiquorCategory[] = ['Whiskey', 'Wine', 'Beer', 'Sake', 'Korean', 'Cocktail', 'Other'];

export default function EditLiquorScreen({
  selectedEntry,
  onUpdateLiquor,
  onScreenChange
}: EditLiquorScreenProps) {
  const [editName, setEditName] = useState(selectedEntry.name);
  const [editCategory, setEditCategory] = useState<LiquorCategory>(selectedEntry.category);
  const [editAbv, setEditAbv] = useState<string>(selectedEntry.abv.toString());
  const [editAddedDate, setEditAddedDate] = useState<string>(selectedEntry.addedDate || '');
  const [editImageUrl, setEditImageUrl] = useState<string>(selectedEntry.imageUrl || '');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setEditName(selectedEntry.name);
    setEditCategory(selectedEntry.category);
    setEditAbv(selectedEntry.abv.toString());
    setEditAddedDate(selectedEntry.addedDate || '');
    setEditImageUrl(selectedEntry.imageUrl || '');
    setEditError('');
  }, [selectedEntry]);

  const handleSaveEditLiquor = () => {
    if (!editName.trim()) {
      setEditError('술 이름을 입력해주세요.');
      return;
    }
    const parsedAbv = parseFloat(editAbv);
    if (isNaN(parsedAbv) || parsedAbv < 0 || parsedAbv > 100) {
      setEditError('올바른 도수(0~100%)를 입력해주세요.');
      return;
    }
    if (!onUpdateLiquor) return;

    const updated: TastingEntry = {
      ...selectedEntry,
      name: editName.trim(),
      category: editCategory,
      abv: parsedAbv,
      addedDate: editAddedDate || undefined,
      imageUrl: editImageUrl || undefined
    };

    onUpdateLiquor(updated);
    onScreenChange('detail');
  };

  return (
    <motion.div 
      key="edit_liquor"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white"
    >
      <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
        <button onClick={() => onScreenChange('detail')} className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800">[{selectedEntry.name}] 정보 수정</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs pb-24 custom-scrollbar">
        {editError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{editError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">술 이름</label>
          <input 
            type="text" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">주종 선택</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = editCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEditCategory(cat)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{getCategoryEmoji(cat)}</span>
                  <span>{getCategoryKorean(cat)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">도수 (ABV %)</label>
            <input 
              type="number" step="0.1" 
              value={editAbv}
              onChange={(e) => setEditAbv(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">셀러 등록 날짜</label>
            <input 
              type="date" 
              value={editAddedDate}
              onChange={(e) => setEditAddedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>🍾 주류 대표 사진 변경 (선택)</span>
            {editImageUrl && (
              <button type="button" onClick={() => setEditImageUrl('')} className="text-red-500 hover:underline font-bold">삭제</button>
            )}
          </label>
          {editImageUrl ? (
            <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 relative shadow-2xs">
              <img src={editImageUrl} alt="주류 미리보기" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="w-full h-24 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-500">새 술병 사진 첨부 (클릭)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setEditImageUrl)} />
            </label>
          )}
        </div>

        <button type="button" onClick={handleSaveEditLiquor} className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl mt-4 transition-all">
          수정 내용 저장하기
        </button>
      </div>
    </motion.div>
  );
}
