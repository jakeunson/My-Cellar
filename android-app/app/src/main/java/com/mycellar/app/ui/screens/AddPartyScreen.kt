package com.mycellar.app.ui.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mycellar.app.data.LiquorCategory
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.data.TastingParty
import com.mycellar.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AddPartyScreen(entries: List<TastingEntry>, onAddParty: (TastingParty) -> Unit, onBack: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    var location by remember { mutableStateOf("") }
    var companions by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var taggedIds by remember { mutableStateOf<Set<String>>(emptySet()) }
    var externalLiquorInput by remember { mutableStateOf("") }
    var imageUrl by remember { mutableStateOf<String?>(null) }

    var showLiquorPicker by remember { mutableStateOf(false) }
    var modalSearchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<LiquorCategory?>(null) }

    val photoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            imageUrl = uri.toString()
        }
    }

    if (showLiquorPicker) {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = { showLiquorPicker = false },
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
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("파티 주류 다중 선택", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Slate900)
                    Text("${taggedIds.size}개 선택됨", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Rose600)
                }

                OutlinedTextField(
                    value = modalSearchQuery,
                    onValueChange = { modalSearchQuery = it },
                    placeholder = { Text("🔍 주류 이름 또는 종류 검색...", fontSize = 13.sp) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

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
                            val isSelected = taggedIds.contains(e.id)
                            Surface(
                                color = if (isSelected) Amber50 else Slate50,
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(1.dp, if (isSelected) Amber500 else Slate200),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        taggedIds = if (isSelected) taggedIds - e.id else taggedIds + e.id
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
                                    if (isSelected) {
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

            // Photo Gallery Picker
            Text("📸 현장 단체/페어링 사진", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
            if (imageUrl != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                ) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = "선택된 파티 사진",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Slate100, RoundedCornerShape(12.dp))
                    )
                    Button(
                        onClick = { imageUrl = null },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Black.copy(alpha = 0.6f)),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.align(Alignment.TopEnd).padding(8.dp)
                    ) {
                        Text("삭제", color = Color.White, fontSize = 12.sp)
                    }
                }
            } else {
                Surface(
                    color = Slate50,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp)
                        .clickable {
                            photoLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                        }
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.CameraAlt, contentDescription = null, tint = Slate500)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("디바이스 갤러리에서 사진 첨부하기 (클릭)", fontWeight = FontWeight.Bold, color = Slate600, fontSize = 13.sp)
                    }
                }
            }

            HorizontalDivider()
            Text("🍷 내 셀러 주류 태그 (${taggedIds.size}개 선택됨)", fontWeight = FontWeight.Bold, fontSize = 14.sp)

            if (taggedIds.isNotEmpty()) {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    taggedIds.forEach { lid ->
                        val entry = entries.find { it.id == lid }
                        if (entry != null) {
                            Surface(
                                color = Slate900,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.clickable { taggedIds = taggedIds - lid }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("🍷 ${entry.name}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Amber400)
                                    Text("✕", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate400)
                                }
                            }
                        }
                    }
                }
            }

            Button(
                onClick = {
                    modalSearchQuery = ""
                    selectedCategory = null
                    showLiquorPicker = true
                },
                colors = ButtonDefaults.buttonColors(containerColor = Amber50, contentColor = Amber800),
                border = BorderStroke(1.dp, Amber400),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Text("+ 셀러에서 주류 태그 선택하기", fontWeight = FontWeight.Black)
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
                            imageUrl = imageUrl,
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
