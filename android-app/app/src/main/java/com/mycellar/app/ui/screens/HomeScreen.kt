package com.mycellar.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mycellar.app.data.LiquorCategory
import com.mycellar.app.data.RankingRecord
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    entries: List<TastingEntry>,
    rankingRecords: List<RankingRecord>,
    onNavigate: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<String>("ALL") }

    val filteredEntries = entries.filter { entry ->
        val matchesSearch = entry.name.contains(searchQuery, ignoreCase = true)
        val matchesCat = if (selectedCategory == "ALL") true else entry.category.name == selectedCategory
        matchesSearch && matchesCat
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize()) {
            // App Bar
            Surface(
                color = Color.White,
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "🍷 My Cellar",
                            style = MaterialTheme.typography.titleLarge,
                            color = Slate900
                        )
                        Button(
                            onClick = { onNavigate("add") },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate900, contentColor = Color.White),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(0.dp),
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "등록", modifier = Modifier.size(20.dp))
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("주류 이름 검색...", fontSize = 13.sp) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Slate400) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Slate50,
                            unfocusedContainerColor = Slate50,
                            focusedBorderColor = Amber500,
                            unfocusedBorderColor = Slate200
                        ),
                        singleLine = true
                    )
                }
            }

            // Category Filter Chips
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val categories = listOf("ALL" to "전체") + LiquorCategory.entries.map { it.name to getCategoryKorean(it) }
                items(categories) { (key, label) ->
                    val isSelected = selectedCategory == key
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedCategory = key },
                        label = { Text(label, fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Slate900,
                            selectedLabelColor = Color.White,
                            containerColor = Color.White,
                            labelColor = Slate600
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = Slate200
                        )
                    )
                }
            }

            // List
            if (filteredEntries.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("등록된 시음 주류가 없습니다.", color = Slate400, fontWeight = FontWeight.Bold)
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredEntries) { entry ->
                        LiquorCard(entry = entry, onClick = { onNavigate("detail/${entry.id}") })
                    }
                }
            }
        }
    }
}

@Composable
fun LiquorCard(entry: TastingEntry, onClick: () -> Unit) {
    val avgRating = if (entry.reviews.isEmpty()) 0f else entry.reviews.map { it.rating }.average().toFloat()

    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = Slate100,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(text = getCategoryEmoji(entry.category), fontSize = 28.sp)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = entry.name, style = MaterialTheme.typography.titleMedium, color = Slate900)
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Surface(color = Slate100, shape = RoundedCornerShape(6.dp)) {
                        Text(
                            text = getCategoryKorean(entry.category),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate700,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Text(text = "${entry.abv}%", fontSize = 12.sp, color = Slate500, fontWeight = FontWeight.Bold)
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Surface(color = Amber50, shape = RoundedCornerShape(8.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Star, contentDescription = null, tint = Amber500, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = String.format("%.1f", avgRating), fontSize = 12.sp, fontWeight = FontWeight.Black, color = Amber800)
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "${entry.reviews.size}회 시음", fontSize = 11.sp, color = Slate400, fontWeight = FontWeight.Bold)
            }
        }
    }
}

fun getCategoryKorean(cat: LiquorCategory): String = when (cat) {
    LiquorCategory.Whiskey -> "위스키"
    LiquorCategory.Wine -> "와인"
    LiquorCategory.Traditional -> "전통주"
    LiquorCategory.Brandy -> "브랜디"
    LiquorCategory.Other -> "기타"
}

fun getCategoryEmoji(cat: LiquorCategory): String = when (cat) {
    LiquorCategory.Whiskey -> "🥃"
    LiquorCategory.Wine -> "🍷"
    LiquorCategory.Traditional -> "🍶"
    LiquorCategory.Brandy -> "🍸"
    LiquorCategory.Other -> "🍾"
}
