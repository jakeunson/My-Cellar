export type LiquorCategory = 'Whiskey' | 'Wine' | 'Beer' | 'Sake' | 'Korean' | 'Cocktail' | 'Other';

export interface FlavorProfile {
  sweet: number; // 0-5
  bitter: number; // 0-5
  sour: number; // 0-5
  body: number; // 0-5
  smoky: number; // 0-5
}

export interface TastingReview {
  id: string;
  date: string; // YYYY-MM-DD
  rating: number; // 1-5
  notes: string;
  flavors: FlavorProfile;
  imageUrl?: string; // 시음 후기 이미지
}

export interface TastingEntry {
  id: string;
  name: string;
  category: LiquorCategory;
  abv: number; // %
  imageUrl?: string; // 주류 대표 이미지
  reviews: TastingReview[];
}

export interface ComposeFile {
  name: string;
  path: string;
  language: string;
  code: string;
  description: string;
}

export interface RankingItem {
  liquorId: string;
  rank: number; // 1, 2, 3...
  comment?: string;
}

export interface RankingRecord {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  items: RankingItem[];
}

export interface TastingParty {
  id: string;
  date: string; // YYYY-MM-DD
  title: string; // 예: "이태원 루프탑 와인 파티"
  location?: string;
  companions?: string;
  notes: string;
  imageUrl?: string;
  taggedLiquorIds: string[]; // 내 셀러 등록 주류 ID 목록
  externalLiquors?: string[]; // 미보유/지인 지참 외부 주류 이름 목록
}
