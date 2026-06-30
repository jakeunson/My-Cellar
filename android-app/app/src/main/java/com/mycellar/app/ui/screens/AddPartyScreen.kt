package com.mycellar.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.data.TastingParty
import com.mycellar.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddPartyScreen(entries: List<TastingEntry>, onAddParty: (TastingParty) -> Unit, onBack: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    var location by remember { mutableStateOf("") }
    var companions by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var taggedIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    var externalLiquorInput by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("새 파티 다이어리 등록", fontWeight = FontWeight.Black, color = Slate900) },
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
            OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("파티 및 모임 제목") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
            OutlinedTextField(value = date, onValueChange = { date = it }, label = { Text("모임 날짜 (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
            OutlinedTextField(value = location, onValueChange = { location = it }, label = { Text("장소 (예: 성수동 와인바)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
            OutlinedTextField(value = companions, onValueChange = { companions = it }, label = { Text("함께한 사람들") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))
            OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text("모임 분위기 및 페어링 후기") }, modifier = Modifier.fillMaxWidth().height(100.dp), shape = RoundedCornerShape(12.dp), maxLines = 4)

            HorizontalDivider()
            Text("🍷 내 셀러 주류 태그", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                entries.forEach { entry ->
                    val selected = taggedIds.contains(entry.id)
                    FilterChip(
                        selected = selected,
                        onClick = {
                            taggedIds = if (selected) taggedIds - entry.id else taggedIds + entry.id
                        },
                        label = { Text(entry.name) }
                    )
                }
            }

            OutlinedTextField(value = externalLiquorInput, onValueChange = { externalLiquorInput = it }, label = { Text("외부 지참 주류 (선택)") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp))

            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        val extList = if (externalLiquorInput.isBlank()) null else listOf(externalLiquorInput)
                        val newParty = TastingParty(
                            id = "party-${System.currentTimeMillis()}",
                            date = date,
                            title = title,
                            location = location.ifBlank { null },
                            companions = companions.ifBlank { null },
                            notes = if (notes.isBlank()) "즐거운 주류 모임" else notes,
                            taggedLiquorIds = taggedIds.toList(),
                            externalLiquors = extList
                        )
                        onAddParty(newParty)
                    }
                },
                modifier = Modifier.fillMaxWidth().height(54.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Rose600)
            ) {
                Text("파티 다이어리 저장", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
            }
        }
    }
}
