import { TastingEntry, RankingRecord, TastingParty } from '../types';

export const DEFAULT_PARTIES: TastingParty[] = [
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

export const DEFAULT_RANKINGS: RankingRecord[] = [
  {
    id: "rank-init-1",
    date: "2026-06-28",
    title: "🌟 6월 나만의 최애 주류 명예의 전당",
    items: [
      { liquorId: "macallan12", rank: 1, comment: "변함없는 최고의 셰리 오크 위스키" },
      { liquorId: "margaux2018", rank: 2, comment: "특별한 날을 빛내주는 우아하고 섬세한 여운" }
    ]
  }
];

export const DEFAULT_TASTINGS: TastingEntry[] = [
  {
    id: "macallan12",
    name: "맥캘란 12년 셰리 오크",
    category: "Whiskey",
    abv: 40,
    imageUrl: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=60",
    purchaseDates: ["2026-06-25"],
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
    purchaseDates: ["2026-06-20"],
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
    purchaseDates: ["2026-06-28"],
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
    purchaseDates: ["2026-06-15"],
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
