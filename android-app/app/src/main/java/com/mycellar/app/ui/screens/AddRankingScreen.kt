package com.mycellar.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mycellar.app.data.LiquorCategory
import com.mycellar.app.data.RankingItem
import com.mycellar.app.data.RankingRecord
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

data class RankEditItem(
    val id: String = UUID.randomUUID().toString(),
    val rank: Int,
    val liquorId: String = "",
    val comment: String = "",
    val isSelecting: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AddRankingScreen(
    entries: List<TastingEntry>,
    onAddRecord: (RankingRecord) -> Unit,
    onBack: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    var rankItems by remember {
        mutableStateOf(
            listOf(
                RankEditItem(rank = 1),
                RankEditItem(rank = 2),
                RankEditItem(rank = 3)
            )
        )
    }

    var activeSelectingIndex by remember { mutableStateOf<Int?>(null) }
    var modalSearchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<LiquorCategory?>(null) }

    fun updateItem(index: Int, update: (RankEditItem) -> RankEditItem) {
        rankItems = rankItems.mapIndexed { idx, item ->
            if (idx == index) update(item) else item
        }
    }

    fun addRank() {
        val nextRank = rankItems.size + 1
        rankItems = rankItems + RankEditItem(rank = nextRank)
    }

    fun deleteItem(index: Int) {
        val newItems = rankItems.filterIndexed { idx, _ -> idx != index }
        rankItems = newItems.mapIndexed { idx, item -> item.copy(rank = idx + 1) }
    }

    if (activeSelectingIndex != null) {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = { activeSelectingIndex = null },
            sheetState = sheetState,
            containerColor = Color.White
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    "${activeSelectingIndex!! + 1}위 주류 선택",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )

                OutlinedTextField(
                    value = modalSearchQuery,
                    onValueChange = { modalSearchQuery = it },
                    placeholder = { Text("🔍 주류 이름 또는 종류 검색...", fontSize = 13.sp) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                // Category Filter Chips
                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(
                        selected = selectedCategory == null,
                        onClick = { selectedCategory = null },
                        label = { Text("전체") }
                    )
                    LiquorCategory.values().forEach { cat ->
                        FilterChip(
                            selected = selectedCategory == cat,
                            onClick = { selectedCategory = cat },
                            label = { Text(getCategoryKorean(cat)) }
                        )
                    }
                }

                HorizontalDivider(color = Slate200)

                val filteredEntries = entries.filter { e ->
                    val matchCat = selectedCategory == null || e.category == selectedCategory
                    val matchQuery = modalSearchQuery.isBlank() ||
                            e.name.contains(modalSearchQuery, ignoreCase = true) ||
                            getCategoryKorean(e.category).contains(modalSearchQuery, ignoreCase = true)
                    matchCat && matchQuery
                }

                if (filteredEntries.isEmpty()) {
                    Box(modifier = Modifier.fillMaxWidth().height(150.dp), contentAlignment = Alignment.Center) {
                        Text("조건에 맞는 주류가 없습니다.", color = Slate400, fontSize = 14.sp)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 400.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(filteredEntries) { e ->
                            val currentIdx = activeSelectingIndex!!
                            val isCurrentSelected = rankItems.getOrNull(currentIdx)?.liquorId == e.id
                            Surface(
                                color = if (isCurrentSelected) Amber50 else Slate50,
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(1.dp, if (isCurrentSelected) Amber500 else Slate200),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        updateItem(currentIdx) {
                                            it.copy(liquorId = e.id, isSelecting = false)
                                        }
                                        activeSelectingIndex = null
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(e.name, fontWeight = FontWeight.Bold, color = Slate900, fontSize = 14.sp)
                                        Text(getCategoryKorean(e.category), fontWeight = FontWeight.Medium, color = Slate500, fontSize = 12.sp)
                                    }
                                    if (isCurrentSelected) {
                                        Text("✓ 선택됨", fontWeight = FontWeight.Black, color = Amber800, fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("명예의 전당 등록", fontWeight = FontWeight.Black, color = Slate900) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "뒤로가기", tint = Slate900)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("테마 제목 (예: 6월 최애 위스키 TOP 3)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )
            OutlinedTextField(
                value = date,
                onValueChange = { date = it },
                label = { Text("날짜 (YYYY-MM-DD)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            HorizontalDivider(color = Slate200)

            rankItems.forEachIndexed { index, item ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Slate50),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                color = when (item.rank) {
                                    1 -> Amber500
                                    2 -> Slate400
                                    3 -> Amber700
                                    else -> Slate800
                                },
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "${item.rank}위 주류",
                                    color = Color.White,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                            if (rankItems.size > 1) {
                                IconButton(
                                    onClick = { deleteItem(index) },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Delete,
                                        contentDescription = "순위 삭제",
                                        tint = Color.Red.copy(alpha = 0.7f),
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }

                        val selectedEntry = entries.find { it.id == item.liquorId }
                        if (selectedEntry != null) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color.White, RoundedCornerShape(12.dp))
                                    .border(1.dp, Slate200, RoundedCornerShape(12.dp))
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(text = selectedEntry.name, fontWeight = FontWeight.Black, color = Slate900, fontSize = 15.sp)
                                    Text(text = getCategoryKorean(selectedEntry.category), fontWeight = FontWeight.Bold, color = Slate500, fontSize = 12.sp)
                                }
                                Button(
                                    onClick = {
                                        modalSearchQuery = ""
                                        selectedCategory = null
                                        activeSelectingIndex = index
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Slate900, contentColor = Color.White),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                    modifier = Modifier.height(34.dp)
                                ) {
                                    Text("변경", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        } else {
                            Button(
                                onClick = {
                                    modalSearchQuery = ""
                                    selectedCategory = null
                                    activeSelectingIndex = index
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Amber50, contentColor = Amber800),
                                border = BorderStroke(1.dp, Amber400),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth().height(48.dp)
                            ) {
                                Text("+ 셀러에서 주류 선택하기", fontWeight = FontWeight.Black)
                            }
                        }

                        OutlinedTextField(
                            value = item.comment,
                            onValueChange = { c -> updateItem(index) { it.copy(comment = c) } },
                            label = { Text("${item.rank}위 선정 이유 / 코멘트") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }
                }
            }

            // Add Rank Button (+ 순위 추가)
            OutlinedButton(
                onClick = { addRank() },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Slate900),
                border = BorderStroke(1.5.dp, Slate900)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("순위 추가 (다음 순위 생성)", fontWeight = FontWeight.Black, fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Submit Button
            Button(
                onClick = {
                    val validItems = rankItems.filter { it.liquorId.isNotBlank() }.map {
                        RankingItem(it.liquorId, it.rank, it.comment.ifBlank { null })
                    }
                    if (title.isNotBlank() && validItems.isNotEmpty()) {
                        onAddRecord(RankingRecord("rank-${System.currentTimeMillis()}", date, title, validItems))
                    }
                },
                modifier = Modifier.fillMaxWidth().height(54.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = Slate950)
            ) {
                Text("명예의 전당 등록하기", fontSize = 16.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}
