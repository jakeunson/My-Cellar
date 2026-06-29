import { ComposeFile } from '../types';

export const composeTemplates: ComposeFile[] = [
  {
    name: "TastingModels.kt",
    path: "app/src/main/java/com/example/tastingjournal/data/TastingModels.kt",
    language: "kotlin",
    description: "Firebase Firestore 1:N 구조 (주류 1 : 시음 후기 N) 및 향미 프로필 데이터 모델",
    code: `package com.example.tastingjournal.data

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.PropertyName
import java.util.UUID

enum class LiquorCategory(val displayName: String, val emoji: String) {
    WHISKEY("위스키", "🥃"),
    WINE("와인", "🍷"),
    BEER("맥주", "🍺"),
    SAKE("사케/청주", "🍶"),
    KOREAN("전통주", "🍶"),
    COCKTAIL("칵테일", "🍸"),
    OTHER("기타 주류", "🍾")
}

data class FlavorProfile(
    @PropertyName("sweet") val sweet: Int = 0,
    @PropertyName("bitter") val bitter: Int = 0,
    @PropertyName("sour") val sour: Int = 0,
    @PropertyName("body") val body: Int = 0,
    @PropertyName("smoky") val smoky: Int = 0
)

data class TastingReview(
    @DocumentId val id: String = UUID.randomUUID().toString(),
    @PropertyName("date") val date: String = "",
    @PropertyName("rating") val rating: Int = 5,
    @PropertyName("notes") val notes: String = "",
    @PropertyName("flavors") val flavors: FlavorProfile = FlavorProfile(),
    @PropertyName("imageUrl") val imageUrl: String = ""
)

data class TastingEntry(
    @DocumentId val id: String = UUID.randomUUID().toString(),
    @PropertyName("name") val name: String = "",
    @PropertyName("category") val category: LiquorCategory = LiquorCategory.WHISKEY,
    @PropertyName("abv") val abv: Float = 0f,
    @PropertyName("imageUrl") val imageUrl: String = "",
    @PropertyName("reviews") val reviews: List<TastingReview> = emptyList()
) {
    val averageRating: Float
        get() = if (reviews.isEmpty()) 0f else Math.round((reviews.map { it.rating }.average() * 10)).toFloat() / 10f
}

data class RankingItem(
    @PropertyName("liquorId") val liquorId: String = "",
    @PropertyName("rank") val rank: Int = 1,
    @PropertyName("comment") val comment: String = ""
)

data class RankingRecord(
    @DocumentId val id: String = UUID.randomUUID().toString(),
    @PropertyName("date") val date: String = "",
    @PropertyName("title") val title: String = "",
    @PropertyName("items") val items: List<RankingItem> = emptyList()
)

data class TastingParty(
    @DocumentId val id: String = UUID.randomUUID().toString(),
    @PropertyName("date") val date: String = "",
    @PropertyName("title") val title: String = "",
    @PropertyName("location") val location: String = "",
    @PropertyName("companions") val companions: String = "",
    @PropertyName("notes") val notes: String = "",
    @PropertyName("imageUrl") val imageUrl: String = "",
    @PropertyName("taggedLiquorIds") val taggedLiquorIds: List<String> = emptyList(),
    @PropertyName("externalLiquors") val externalLiquors: List<String> = emptyList()
)

// 샘플 초기 데이터
object SampleData {
    val defaultList = listOf(
        TastingEntry(
            id = "macallan12",
            name = "맥캘란 12년 셰리 오크",
            category = LiquorCategory.WHISKEY,
            abv = 40f,
            reviews = listOf(
                TastingReview(
                    id = "rev-2", date = "2026-06-28", rating = 5,
                    notes = "두 번째 시음. 에어링이 되면서 카라멜과 건포도 향이 더욱 짙어지고 목넘김이 한결 부드러워짐.",
                    flavors = FlavorProfile(5, 2, 1, 4, 2)
                ),
                TastingReview(
                    id = "rev-1", date = "2026-06-25", rating = 5,
                    notes = "개봉 첫날. 셰리 오크 특유의 풍부한 말린 과일 향과 달콤한 카라멜, 시나몬 스파이스가 조화로움.",
                    flavors = FlavorProfile(4, 2, 1, 4, 2)
                )
            )
        ),
        TastingEntry(
            id = "margaux2018",
            name = "샤토 마고 2018",
            category = LiquorCategory.WINE,
            abv = 13.5f,
            reviews = listOf(
                TastingReview(
                    id = "rev-mar-1", date = "2026-06-20", rating = 5,
                    notes = "짙은 루비색. 블랙베리, 제비꽃, 흙 내음이 어우러지며 실크처럼 부드러운 타닌과 우아하고 긴 여운을 남김.",
                    flavors = FlavorProfile(1, 3, 4, 5, 1)
                )
            )
        )
    )

    val defaultParties = listOf(
        TastingParty(
            id = "party-1",
            date = "2026-06-28",
            title = "✨ 이태원 루프탑 와인 & 위스키 파티",
            location = "이태원 루프탑 테라스",
            companions = "지훈, 수아, 민기",
            notes = "여름밤 테라스에서 즐긴 환상의 모임. 숯불 그릴에 구운 양갈비와 샤토 마고의 마리아주가 일품이었고, 식후주로 맥캘란 12년과 지인 지훈이가 가져온 야마자키를 비교 시음함.",
            taggedLiquorIds = listOf("macallan12", "margaux2018"),
            externalLiquors = listOf("야마자키 12년 (지훈 지참)")
        )
    )
}`
  },
  {
    name: "TastingListScreen.kt",
    path: "app/src/main/java/com/example/tastingjournal/ui/TastingListScreen.kt",
    language: "kotlin",
    description: "Firebase Firestore 컬렉션 실시간 구독 및 주류별 평균 평점 표시 리스트 화면",
    code: `package com.example.tastingjournal.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tastingjournal.data.TastingEntry

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TastingListScreen(
    entries: List<TastingEntry>,
    onLiquorClick: (String) -> Unit,
    onAddClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Cellar", fontWeight = FontWeight.ExtraBold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onAddClick,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, contentDescription = "주류 추가")
            }
        }
    ) { padding ->
        if (entries.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("등록된 주류가 없습니다. + 버튼을 눌러 추가하세요.", color = Color.Gray)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(entries) { entry ->
                    LiquorCard(entry = entry, onClick = { onLiquorClick(entry.id) })
                }
            }
        }
    }
}

@Composable
fun LiquorCard(entry: TastingEntry, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Text(entry.category.emoji, fontSize = 32.sp, modifier = Modifier.padding(end = 12.dp))
                Column {
                    Text(entry.name, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "\${entry.category.displayName} • ABV \${entry.abv}%",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(entry.averageRating.toString(), fontWeight = FontWeight.ExtraBold)
                }
                Text("\${entry.reviews.size}회 시음", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
        }
    }
}`
  },
  {
    name: "TastingFormScreen.kt",
    path: "app/src/main/java/com/example/tastingjournal/ui/TastingFormScreen.kt",
    language: "kotlin",
    description: "주류 등록 및 첫 번째 시음 후기 입력 Firestore 저장 폼 화면",
    code: `package com.example.tastingjournal.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.tastingjournal.data.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TastingFormScreen(
    onSave: (TastingEntry) -> Unit,
    onBack: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var abvStr by remember { mutableStateOf("") }
    var rating by remember { mutableStateOf(5) }
    var notes by remember { mutableStateOf("") }
    var sweet by remember { mutableStateOf(3f) }
    var bitter by remember { mutableStateOf(2f) }
    var sour by remember { mutableStateOf(2f) }
    var body by remember { mutableStateOf(4f) }
    var smoky by remember { mutableStateOf(1f) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("새 주류 등록") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = null) }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("술 이름") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = abvStr, onValueChange = { abvStr = it }, label = { Text("도수 (ABV %)") }, modifier = Modifier.fillMaxWidth())
            
            HorizontalDivider()
            Text("첫 시음 후기 기록", fontWeight = FontWeight.Bold)
            
            OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text("시음 메모") }, modifier = Modifier.fillMaxWidth(), minLines = 3)

            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        val abv = abvStr.toFloatOrNull() ?: 0f
                        val firstReview = TastingReview(
                            date = "2026-06-29", rating = rating, notes = notes,
                            flavors = FlavorProfile(sweet.toInt(), bitter.toInt(), sour.toInt(), body.toInt(), smoky.toInt())
                        )
                        onSave(TastingEntry(name = name, abv = abv, reviews = listOf(firstReview)))
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("주류 및 첫 시음 저장")
            }
        }
    }
}`
  },
  {
    name: "TastingDetailScreen.kt",
    path: "app/src/main/java/com/example/tastingjournal/ui/TastingDetailScreen.kt",
    language: "kotlin",
    description: "주류 향미 레이더 차트 (Canvas) 및 날짜별 시음 내역 1:N 리스트 화면",
    code: `package com.example.tastingjournal.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlin.math.cos
import kotlin.math.sin
import com.example.tastingjournal.data.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TastingDetailScreen(
    entry: TastingEntry,
    onBack: () -> Unit,
    onAddReviewClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(entry.name) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = null) }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onAddReviewClick,
                icon = { Icon(Icons.Default.Add, contentDescription = null) },
                text = { Text("시음 후기 추가") }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(entry.category.emoji, style = MaterialTheme.typography.displayMedium)
                        Text(entry.name, fontWeight = FontWeight.ExtraBold, style = MaterialTheme.typography.titleLarge)
                        Text("ABV \${entry.abv}% • 총 \${entry.reviews.size}회 시음", color = Color.Gray)
                    }
                }
            }
            
            item {
                Text("향미 레이더 차트", fontWeight = FontWeight.Bold)
                RadarChartCanvas(entry.reviews)
            }

            item {
                Text("날짜별 시음 내역", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
            }

            items(entry.reviews) { review ->
                ReviewItemCard(review)
            }
        }
    }
}

@Composable
fun ReviewItemCard(review: TastingReview) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(review.date, fontWeight = FontWeight.Bold)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
                    Text(review.rating.toString(), fontWeight = FontWeight.Bold)
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(review.notes, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

@Composable
fun RadarChartCanvas(reviews: List<TastingReview>) {
    Canvas(modifier = Modifier.fillMaxWidth().height(180.dp)) {
        val center = Offset(size.width / 2, size.height / 2)
        // 5각 폴리곤 및 그리드 드로잉 로직
        drawCircle(color = Color.LightGray, radius = radius, style = Stroke(width = 2f))
    }
}
`
  },
  {
    name: "TastingRankingScreen.kt",
    path: "app/src/main/java/com/mycellar/journal/ui/TastingRankingScreen.kt",
    language: "kotlin",
    description: "날짜별 주류 선호도 랭킹 명예의 전당 및 수동 스냅샷 등록 화면 (M3)",
    code: `package com.mycellar/journal.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mycellar/journal.model.RankingRecord

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TastingRankingScreen(
    records: List<RankingRecord>,
    onAddClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("🏆 주류 명예의 전당", fontWeight = FontWeight.ExtraBold) }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddClick, containerColor = Color(0xFFF59E0B)) {
                Icon(Icons.Default.Add, contentDescription = "랭킹 추가", tint = Color.White)
            }
        }
    ) { padding ->
        if (records.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("등록된 랭킹 스냅샷이 없습니다.", color = Color.Gray)
            }
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
                items(records) { record ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("📅 " + record.date, fontWeight = FontWeight.Bold, color = Color(0xFFD97706))
                            Text(record.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.ExtraBold)
                            Spacer(modifier = Modifier.height(8.dp))
                            record.items.forEach { item ->
                                Text(item.rank.toString() + "위: 주류 ID (" + item.liquorId + ")")
                            }
                        }
                    }
                }
            }
        }
    }
}
`
  },
  {
    name: "TastingPartyScreen.kt",
    path: "app/src/main/java/com/example/tastingjournal/ui/TastingPartyScreen.kt",
    language: "kotlin",
    description: "파티 다이어리 타임라인 및 외부 미보유 주류 기록을 포함하는 파티 화면",
    code: `package com.example.tastingjournal.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.tastingjournal.data.TastingParty

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TastingPartyScreen(
    parties: List<TastingParty>,
    onAddPartyClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("🎉 주류 파티 다이어리", fontWeight = FontWeight.ExtraBold) }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddPartyClick, containerColor = Color(0xFFE11D48)) {
                Icon(Icons.Default.Add, contentDescription = "파티 기록 추가", tint = Color.White)
            }
        }
    ) { padding ->
        if (parties.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("기록된 주류 파티가 없습니다.", color = Color.Gray)
            }
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
                items(parties) { party ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("📅 " + party.date, fontWeight = FontWeight.Bold, color = Color(0xFFE11D48))
                            Text(party.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.ExtraBold)
                            if (party.location.isNotEmpty()) Text("📍 " + party.location, color = Color.DarkGray)
                            if (party.companions.isNotEmpty()) Text("👥 " + party.companions, color = Color.DarkGray)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(party.notes, style = MaterialTheme.typography.bodyMedium)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("함께 나눈 주류: " + party.taggedLiquorIds.size + "종 (내 셀러) + 외부 지참 " + party.externalLiquors.size + "종", style = MaterialTheme.typography.labelMedium, color = Color.Gray)
                        }
                    }
                }
            }
        }
    }
}
`
  }
];
