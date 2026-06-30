package com.mycellar.app.data

enum class LiquorCategory {
    Whiskey, Wine, Traditional, Brandy, Other
}

data class FlavorProfile(
    val sweet: Int = 3,
    val bitter: Int = 2,
    val sour: Int = 2,
    val body: Int = 3,
    val smoky: Int = 1
)

data class TastingReview(
    val id: String,
    val date: String,
    val rating: Int,
    val notes: String,
    val flavors: FlavorProfile,
    val imageUrl: String? = null
)

data class TastingEntry(
    val id: String,
    val name: String,
    val category: LiquorCategory,
    val abv: Float,
    val addedDate: String? = null,
    val imageUrl: String? = null,
    val reviews: List<TastingReview> = emptyList()
)

data class RankingItem(
    val liquorId: String,
    val rank: Int,
    val comment: String? = null
)

data class RankingRecord(
    val id: String,
    val date: String,
    val title: String,
    val items: List<RankingItem>
)

data class TastingParty(
    val id: String,
    val date: String,
    val title: String,
    val location: String? = null,
    val companions: String? = null,
    val notes: String,
    val imageUrl: String? = null,
    val taggedLiquorIds: List<String> = emptyList(),
    val externalLiquors: List<String>? = null
)
