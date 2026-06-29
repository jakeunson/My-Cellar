import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, AlertTriangle, Camera, Star, Image } from 'lucide-react';
import { TastingEntry, TastingReview, LiquorCategory } from '../../types';
import { handleImageUpload } from '../../utils/liquorUtils';

interface AddLiquorScreenProps {
  onAddLiquor: (entry: TastingEntry) => void;
  onScreenChange: (screen: string) => void;
}

export default function AddLiquorScreen({ onAddLiquor, onScreenChange }: AddLiquorScreenProps) {
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<LiquorCategory>('Whiskey');
  const [formAbv, setFormAbv] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formError, setFormError] = useState('');

  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formRating, setFormRating] = useState<number>(5);
  const [formNotes, setFormNotes] = useState('');
  const [formSweet, setFormSweet] = useState<number>(3);
  const [formBitter, setFormBitter] = useState<number>(2);
  const [formSour, setFormSour] = useState<number>(2);
  const [formBody, setFormBody] = useState<number>(4);
  const [formSmoky, setFormSmoky] = useState<number>(1);
  const [formReviewImageUrl, setFormReviewImageUrl] = useState<string>('');

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
      notes: formNotes.trim() || '첫 시음 기록입니다.',
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
    onScreenChange('home');
  };

  return (
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
          className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800">새 주류 및 첫 시음 등록</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs pb-24 custom-scrollbar">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">술 이름</label>
          <input 
            type="text" 
            placeholder="예: 발베니 12년 더블우드"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">주종 종류</label>
            <select 
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as LiquorCategory)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
            >
              <option value="Whiskey">🥃 위스키</option>
              <option value="Wine">🍷 와인</option>
              <option value="Beer">🍺 맥주</option>
              <option value="Korean">🍶 전통주</option>
              <option value="Cocktail">🍸 칵테일</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">도수 (ABV %)</label>
            <input 
              type="number" step="0.1" placeholder="예: 40"
              value={formAbv}
              onChange={(e) => setFormAbv(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-3.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>🍾 주류 대표 사진 (선택)</span>
            {formImageUrl && (
              <button type="button" onClick={() => setFormImageUrl('')} className="text-red-500 hover:underline font-bold">삭제</button>
            )}
          </label>
          {formImageUrl ? (
            <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 relative group shadow-2xs">
              <img src={formImageUrl} alt="주류 미리보기" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="w-full h-24 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-500">술병 사진 첨부 (클릭)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormImageUrl)} />
            </label>
          )}
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">첫 번째 시음 평가</h3>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-700 text-sm">시음 날짜</span>
            <input 
              type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs shadow-2xs"
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-extrabold text-slate-700 text-sm">만족도 별점</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setFormRating(star)} className="p-1 active:scale-95 transition-transform">
                  <Star className={`w-7 h-7 ${star <= formRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <h4 className="text-xs font-extrabold text-slate-700">향미 슬라이더 (0~5점)</h4>
          {[
            { label: '단맛 (Sweet)', val: formSweet, set: setFormSweet },
            { label: '쓴맛 (Bitter)', val: formBitter, set: setFormBitter },
            { label: '신맛 (Sour)', val: formSour, set: setFormSour },
            { label: '바디감 (Body)', val: formBody, set: setFormBody },
            { label: '스모키함', val: formSmoky, set: setFormSmoky },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5">
              <span className="w-20 font-extrabold text-slate-700">{item.label}</span>
              <input type="range" min="0" max="5" value={item.val} onChange={(e) => item.set(parseInt(e.target.value))} className="flex-1 mx-3 accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer" />
              <span className="w-6 text-right font-black text-slate-900 text-sm">{item.val}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>📸 시음 현장 사진 (선택)</span>
            {formReviewImageUrl && (
              <button type="button" onClick={() => setFormReviewImageUrl('')} className="text-red-500 hover:underline font-bold">삭제</button>
            )}
          </label>
          {formReviewImageUrl ? (
            <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 relative shadow-2xs">
              <img src={formReviewImageUrl} alt="시음 사진 미리보기" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="w-full h-20 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-slate-50 transition-colors">
              <Image className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">시음 사진 첨부 (클릭)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormReviewImageUrl)} />
            </label>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">시음 메모</label>
          <textarea 
            placeholder="향, 맛, 피니시 등을 자유롭게 기록하세요..." value={formNotes} rows={3} onChange={(e) => setFormNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-slate-800 resize-none shadow-2xs"
          />
        </div>

        <button type="button" onClick={handleSaveLiquor} className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl mt-3 transition-all">
          주류 및 시음 저장하기
        </button>
      </div>
    </motion.div>
  );
}
