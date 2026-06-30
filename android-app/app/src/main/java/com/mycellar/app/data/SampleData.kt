package com.mycellar.app.data

object SampleData {
    val defaultEntries = listOf(
        TastingEntry(
            id = "macallan12",
            name = "맥캘란 12년 셰리 오크",
            category = LiquorCategory.Whiskey,
            abv = 40f,
            addedDate = "2026-06-25",
            imageUrl = "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=60",
            reviews = listOf(
                TastingReview(
                    id = "rev-mac-2",
                    date = "2026-06-28",
                    rating = 5,
                    notes = "두 번째 시음. 에어링이 되면서 카라멜과 건포도 향이 더욱 짙어지고 목넘김이 한결 부드러워짐.",
                    flavors = FlavorProfile(sweet = 5, bitter = 2, sour = 1, body = 4, smoky = 2),
                    imageUrl = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=60"
                ),
                TastingReview(
                    id = "rev-mac-1",
                    date = "2026-06-25",
                    rating = 5,
                    notes = "개봉 첫날. 셰리 오크 특유의 풍부한 말린 과일 향과 달콤한 카라멜, 시나몬 스파이스가 조화로움.",
                    flavors = FlavorProfile(sweet = 4, bitter = 2, sour = 1, body = 4, smoky = 2)
                )
            )
        ),
        TastingEntry(
            id = "margaux2018",
            name = "샤토 마고 2018",
            category = LiquorCategory.Wine,
            abv = 13.5f,
            addedDate = "2026-06-20",
            imageUrl = "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=60",
            reviews = listOf(
                TastingReview(
                    id = "rev-mar-1",
                    date = "2026-06-20",
                    rating = 5,
                    notes = "우아한 바이올렛 꽃향기와 블랙커런트의 깊은 풍미. 부드러우면서도 단단한 탄닌 구조감이 일품.",
                    flavors = FlavorProfile(sweet = 1, bitter = 3, sour = 4, body = 5, smoky = 1)
                )
            )
        )
    )

    val defaultRankings = listOf(
        RankingRecord(
            id = "rank-init-1",
            date = "2026-06-28",
            title = "🌟 6월 나만의 최애 주류 명예의 전당",
            items = listOf(
                RankingItem(liquorId = "macallan12", rank = 1, comment = "변함없는 최고의 셰리 오크 위스키"),
                RankingItem(liquorId = "margaux2018", rank = 2, comment = "특별한 날을 빛내주는 우아하고 섬세한 여운")
            )
        )
    )

    val defaultParties = listOf(
        TastingParty(
            id = "party-init-1",
            date = "2026-06-28",
            title = "✨ 이태원 루프탑 와인 & 위스키 파티",
            location = "이태원 루프탑 테라스",
            companions = "지훈, 수아, 민기",
            notes = "여름밤 테라스에서 즐긴 환상의 모임. 숯불 그릴에 구운 양갈비와 샤토 마고의 마리아주가 일품이었고, 식후주로 맥캘란 12년과 지인 지훈이가 가져온 야마자키를 비교 시음함.",
            imageUrl = "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=60",
            taggedLiquorIds = listOf("macallan12", "margaux2018"),
            externalLiquors = listOf("야마자키 12년 (지훈 지참)")
        )
    )
}
