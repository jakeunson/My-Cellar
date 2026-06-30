package com.mycellar.app.ui.screens

import androidx.compose.foundation.clickable
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
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.data.TastingParty
import com.mycellar.app.ui.theme.*

@Composable
fun PartyScreen(
    entries: List<TastingEntry>,
    parties: List<TastingParty>,
    onDeleteParty: (String) -> Unit,
    onNavigateAdd: () -> Unit,
    onSelectLiquor: (String) -> Unit
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
                        Text("🎉 파티 다이어리", style = MaterialTheme.typography.titleLarge, color = Slate900)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("주류 모임 기록", fontSize = 13.sp, color = Slate500, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = onNavigateAdd,
                        colors = ButtonDefaults.buttonColors(containerColor = Rose600, contentColor = Color.White),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(0.dp),
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "등록", modifier = Modifier.size(20.dp))
                    }
                }
            }

            if (parties.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("등록된 파티 다이어리가 없습니다.", color = Slate400, fontWeight = FontWeight.Bold)
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(parties) { party ->
                        PartyCard(party = party, entries = entries, onDelete = { onDeleteParty(party.id) }, onSelectLiquor = onSelectLiquor)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun PartyCard(party: TastingParty, entries: List<TastingEntry>, onDelete: () -> Unit, onSelectLiquor: (String) -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Surface(color = Slate100, shape = RoundedCornerShape(6.dp)) {
                    Text("📅 ${party.date}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "삭제", tint = Rose600, modifier = Modifier.size(18.dp))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(party.title, style = MaterialTheme.typography.titleMedium, color = Slate900)
            if (!party.location.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text("📍 ${party.location}", fontSize = 13.sp, color = Slate600, fontWeight = FontWeight.Medium)
            }
            if (!party.companions.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(2.dp))
                Text("👥 함께한 사람들: ${party.companions}", fontSize = 13.sp, color = Slate600)
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(party.notes, fontSize = 14.sp, color = Slate800, lineHeight = 20.sp)

            // Tagged Liquors
            if (party.taggedLiquorIds.isNotEmpty() || !party.externalLiquors.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = Slate100)
                Spacer(modifier = Modifier.height(12.dp))
                Text("🍾 함께 즐긴 주류", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = Slate500)
                Spacer(modifier = Modifier.height(8.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    party.taggedLiquorIds.forEach { lid ->
                        val entry = entries.find { it.id == lid }
                        if (entry != null) {
                            Surface(
                                color = Amber50,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.clickable { onSelectLiquor(lid) }
                            ) {
                                Text("🍷 ${entry.name}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Amber800, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                            }
                        }
                    }
                    party.externalLiquors?.forEach { ext ->
                        Surface(color = Slate100, shape = RoundedCornerShape(8.dp)) {
                            Text("✨ $ext", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate700, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                        }
                    }
                }
            }
        }
    }
}
