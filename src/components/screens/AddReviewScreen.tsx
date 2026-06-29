import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Camera } from 'lucide-react';
import { TastingEntry, TastingReview } from '../../types';
import { handleImageUpload } from '../../utils/liquorUtils';

interface AddReviewScreenProps {
  selectedEntry: TastingEntry;
  onAddReview: (liquorId: string, review: TastingReview) => void;
  onScreenChange: (screen: string) => void;
}

export default function AddReviewScreen({
  selectedEntry,
  onAddReview,
  onScreenChange
}: AddReviewScreenProps) {
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formRating, setFormRating] = useState<number>(5);
  const [formNotes, setFormNotes] = useState('');
  const [formSweet, setFormSweet] = useState<number>(3);
  const [formBitter, setFormBitter] = useState<number>(2);
  const [formSour, setFormSour] = useState<number>(2);
  const [formBody, setFormBody] = useState<number>(4);
  const [formSmoky, setFormSmoky] = useState<number>(1);
  const [formReviewImageUrl, setFormReviewImageUrl] = useState<string>('');

  const handleSaveReview = () => {
    const newReview: TastingReview = {
      id: 'rev-' + Date.now(),
      date: formDate || new Date().toISOString().split('T')[0],
      rating: formRating,
      notes: formNotes.trim() || '시음 후기를 남겼습니다.',
      flavors: { sweet: formSweet, bitter: formBitter, sour: formSour, body: formBody, smoky: formSmoky },
      imageUrl: formReviewImageUrl || undefined
    };

    onAddReview(selectedEntry.id, newReview);
    onScreenChange('detail');
  };

  return (
    <motion.div 
      key="add_review"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col h-full overflow-hidden bg-white"
    >
      <div className="bg-white border-b border-slate-200 px-3 py-3 flex items-center space-x-2 shrink-0 shadow-sm">
        <button onClick={() => onScreenChange('detail')} className="p-2.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-extrabold text-slate-800">[{selectedEntry.name}] 후기 추가</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs pb-24 custom-scrollbar">
        <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-800 text-sm">시음 날짜</span>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-xs shadow-2xs" />
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-extrabold text-slate-800 text-sm">이번 시음 별점</span>
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
          <h4 className="text-xs font-extrabold text-slate-700">이번 시음의 향미 평가 (0~5점)</h4>
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
            <span>📸 이번 시음 현장 사진 (선택)</span>
            {formReviewImageUrl && (
              <button type="button" onClick={() => setFormReviewImageUrl('')} className="text-red-500 hover:underline font-bold">삭제</button>
            )}
          </label>
          {formReviewImageUrl ? (
            <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 relative shadow-2xs">
              <img src={formReviewImageUrl} alt="시음 사진 미리보기" className="w-full h-full object-cover" />
            </div>
          ) : (
            <label className="w-full h-24 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 transition-colors">
              <Camera className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">시음 사진 첨부 (클릭)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormReviewImageUrl)} />
            </label>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">오늘의 시음 노트</label>
          <textarea 
            placeholder="에어링 상태나 페어링 안주, 분위기 등을 기록하세요..." value={formNotes} rows={3} onChange={(e) => setFormNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-slate-800 resize-none shadow-2xs"
          />
        </div>

        <button type="button" onClick={handleSaveReview} className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white py-4 rounded-2xl font-black text-sm shadow-xl mt-3 transition-all">
          후기 추가 저장하기
        </button>
      </div>
    </motion.div>
  );
}
