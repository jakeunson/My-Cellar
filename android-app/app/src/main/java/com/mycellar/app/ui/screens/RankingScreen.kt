package com.mycellar.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mycellar.app.data.RankingRecord
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.ui.theme.*

@Composable
fun RankingScreen(
    entries: List<TastingEntry>,
    rankingRecords: List<RankingRecord>,
    onDeleteRecord: (String) -> Unit,
    onNavigateAdd: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize()) {
            Surface(color = Color.White, shadowElevation = 2.dp, modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("🌟 명예의 전당", style = MaterialTheme.typography.titleLarge, color = Slate900)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("나만의 최애 주류 랭킹", fontSize = 13.sp, color = Slate500, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = onNavigateAdd,
                        colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = Slate950),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(0.dp),
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "등록", modifier = Modifier.size(20.dp))
                    }
                }
            }

            if (rankingRecords.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("등록된 명예의 전당 기록이 없습니다.", color = Slate400, fontWeight = FontWeight.Bold)
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(rankingRecords) { record ->
                        RankingRecordCard(record = record, entries = entries, onDelete = { onDeleteRecord(record.id) })
                    }
                }
            }
        }
    }
}

@Composable
fun RankingRecordCard(record: RankingRecord, entries: List<TastingEntry>, onDelete: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Surface(color = Slate100, shape = RoundedCornerShape(6.dp)) {
                    Text("📅 ${record.date}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "삭제", tint = Rose600, modifier = Modifier.size(18.dp))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(record.title, style = MaterialTheme.typography.titleMedium, color = Slate900)
            Spacer(modifier = Modifier.height(16.dp))

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                record.items.sortedBy { it.rank }.forEach { item ->
                    val entry = entries.find { it.id == item.liquorId }
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Surface(
                            color = if (item.rank == 1) Amber500 else if (item.rank == 2) Slate300 else Amber800.copy(alpha = 0.6f),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("${item.rank}위", fontSize = 12.sp, fontWeight = FontWeight.Black, color = if (item.rank == 1) Slate950 else Color.White)
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(entry?.name ?: "알 수 없는 주류", fontWeight = FontWeight.Bold, color = Slate900, fontSize = 15.sp)
                            if (!item.comment.isNullOrBlank()) {
                                Text(item.comment, fontSize = 13.sp, color = Slate600)
                            }
                        }
                    }
                }
            }
        }
    }
}
