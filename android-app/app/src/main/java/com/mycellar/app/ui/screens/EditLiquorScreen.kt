package com.mycellar.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mycellar.app.data.LiquorCategory
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditLiquorScreen(entry: TastingEntry, onUpdate: (TastingEntry) -> Unit, onBack: () -> Unit) {
    var name by remember { mutableStateOf(entry.name) }
    var category by remember { mutableStateOf(entry.category) }
    var abv by remember { mutableStateOf(entry.abv.toString()) }
    var addedDate by remember { mutableStateOf(entry.addedDate ?: "") }
    var imageUrl by remember { mutableStateOf(entry.imageUrl ?: "") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("주류 정보 수정", fontWeight = FontWeight.Black, color = Slate900) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "뒤로가기", tint = Slate900)
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
                value = name,
                onValueChange = { name = it },
                label = { Text("주류 이름") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Text("주종 선택", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(LiquorCategory.entries) { cat ->
                    FilterChip(
                        selected = category == cat,
                        onClick = { category = cat },
                        label = { Text(getCategoryKorean(cat)) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Slate900,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            OutlinedTextField(
                value = abv,
                onValueChange = { abv = it },
                label = { Text("알코올 도수 (%)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = addedDate,
                onValueChange = { addedDate = it },
                label = { Text("셀러 등록 날짜 (YYYY-MM-DD)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            OutlinedTextField(
                value = imageUrl,
                onValueChange = { imageUrl = it },
                label = { Text("이미지 URL 수정 (선택)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        onUpdate(
                            entry.copy(
                                name = name.trim(),
                                category = category,
                                abv = abv.toFloatOrNull() ?: entry.abv,
                                addedDate = addedDate.ifBlank { null },
                                imageUrl = imageUrl.ifBlank { null }
                            )
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth().height(54.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Slate900)
            ) {
                Text("변경사항 저장", fontSize = 16.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}
