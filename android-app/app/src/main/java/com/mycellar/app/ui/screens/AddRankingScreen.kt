package com.mycellar.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
    val searchQuery: String = "",
    val isSelecting: Boolean = true
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddRankingScreen(entries: List<TastingEntry>, onAddRecord: (RankingRecord) -> Unit, onBack: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    
    var items by remember {
        mutableStateOf(
            if (entries.isNotEmpty()) {
                listOf(
                    RankEditItem(rank = 1, liquorId = entries.first().id, isSelecting = false),
                    RankEditItem(rank = 2, liquorId = entries.getOrNull(1)?.id ?: entries.first().id, isSelecting = false)
                )
            } else {
                listOf(RankEditItem(rank = 1, isSelecting = true))
            }
        )
    }

    fun updateItem(index: Int, update: (RankEditItem) -> RankEditItem) {
        items = items.mapIndexed { idx, item -> if (idx == index) update(item) else item }
    }

    fun deleteItem(index: Int) {
        val updated = items.filterIndexed { idx, _ -> idx != index }
            .mapIndexed { idx, item -> item.copy(rank = idx + 1) }
        items = updated
    }

    fun addRank() {
        val nextRank = items.size + 1
        items = items + RankEditItem(rank = nextRank, isSelecting = true)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("새 명예의 전당 등록", fontWeight = FontWeight.Black, color = Slate900) },
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

            // Dynamic Ranks List
            items.forEachIndexed { index, item ->
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
                        // Rank Header & Delete Button
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
                            if (items.size > 1) {
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

                        // Selected Liquor Display or Search & List Picker
                        val selectedEntry = entries.find { it.id == item.liquorId }
                        if (selectedEntry != null && !item.isSelecting) {
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
                                    onClick = { updateItem(index) { it.copy(isSelecting = true) } },
                                    colors = ButtonDefaults.buttonColors(containerColor = Slate900, contentColor = Color.White),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                    modifier = Modifier.height(34.dp)
                                ) {
                                    Text("변경", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        } else {
                            // Search Box + Filtered List View
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color.White, RoundedCornerShape(12.dp))
                                    .border(1.dp, Amber400, RoundedCornerShape(12.dp))
                                    .padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedTextField(
                                    value = item.searchQuery,
                                    onValueChange = { q -> updateItem(index) { it.copy(searchQuery = q) } },
                                    placeholder = { Text("🔍 주류 이름 또는 종류 검색...", fontSize = 13.sp) },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp)
                                )

                                val filteredEntries = entries.filter { e ->
                                    item.searchQuery.isBlank() ||
                                            e.name.contains(item.searchQuery, ignoreCase = true) ||
                                            getCategoryKorean(e.category).contains(item.searchQuery, ignoreCase = true)
                                }

                                if (filteredEntries.isEmpty()) {
                                    Text(
                                        text = "검색된 주류가 없습니다.",
                                        color = Slate400,
                                        fontSize = 12.sp,
                                        modifier = Modifier.padding(vertical = 8.dp)
                                    )
                                } else {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .heightIn(max = 180.dp)
                                            .verticalScroll(rememberScrollState()),
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        filteredEntries.forEach { e ->
                                            Surface(
                                                color = if (item.liquorId == e.id) Amber50 else Slate50,
                                                shape = RoundedCornerShape(8.dp),
                                                border = BorderStroke(1.dp, if (item.liquorId == e.id) Amber500 else Slate200),
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clickable {
                                                        updateItem(index) {
                                                            it.copy(
                                                                liquorId = e.id,
                                                                isSelecting = false,
                                                                searchQuery = ""
                                                            )
                                                        }
                                                    }
                                            ) {
                                                Row(
                                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                                                    horizontalArrangement = Arrangement.SpaceBetween,
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    Text(text = e.name, fontWeight = FontWeight.Bold, color = Slate900, fontSize = 13.sp)
                                                    Text(text = getCategoryKorean(e.category), fontWeight = FontWeight.Medium, color = Slate500, fontSize = 11.sp)
                                                }
                                            }
                                        }
                                    }
                                }
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
                    val validItems = items.filter { it.liquorId.isNotBlank() }.map {
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
