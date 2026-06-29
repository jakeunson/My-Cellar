import React from 'react';
import { LiquorCategory, TastingReview, FlavorProfile } from '../types';

export const getCategoryEmoji = (cat: LiquorCategory): string => {
  switch (cat) {
    case 'Whiskey': return '🥃';
    case 'Wine': return '🍷';
    case 'Beer': return '🍺';
    case 'Sake': return '🍶';
    case 'Korean': return '🍶';
    case 'Cocktail': return '🍸';
    default: return '🍾';
  }
};

export const getCategoryName = (cat: LiquorCategory): string => {
  switch (cat) {
    case 'Whiskey': return '위스키';
    case 'Wine': return '와인';
    case 'Beer': return '맥주';
    case 'Sake': return '사케/청주';
    case 'Korean': return '전통주';
    case 'Cocktail': return '칵테일';
    default: return '기타 주류';
  }
};

export const getAverageRating = (reviews?: TastingReview[]): number => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

export const getAverageFlavors = (reviews?: TastingReview[]): FlavorProfile => {
  if (!reviews || reviews.length === 0) {
    return { sweet: 3, bitter: 2, sour: 2, body: 3, smoky: 1 };
  }
  const count = reviews.length;
  return {
    sweet: Math.round((reviews.reduce((acc, r) => acc + r.flavors.sweet, 0) / count) * 10) / 10,
    bitter: Math.round((reviews.reduce((acc, r) => acc + r.flavors.bitter, 0) / count) * 10) / 10,
    sour: Math.round((reviews.reduce((acc, r) => acc + r.flavors.sour, 0) / count) * 10) / 10,
    body: Math.round((reviews.reduce((acc, r) => acc + r.flavors.body, 0) / count) * 10) / 10,
    smoky: Math.round((reviews.reduce((acc, r) => acc + r.flavors.smoky, 0) / count) * 10) / 10,
  };
};

// 이미지 업로드 변환 핸들러 (FileReader -> Base64 + Canvas 리사이징/압축)
export const handleImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  setUrl: (url: string) => void
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDim = 800;
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
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setUrl(compressedDataUrl);
    };
    if (event.target?.result) {
      img.src = event.target.result as string;
    }
  };
  reader.readAsDataURL(file);
};
