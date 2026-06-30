package com.mycellar.app.ui.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.mycellar.app.data.FlavorProfile
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.data.TastingReview
import com.mycellar.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddReviewScreen(entry: TastingEntry, onAddReview: (TastingReview) -> Unit, onBack: () -> Unit) {
    var date by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    var rating by remember { mutableStateOf(5) }
    var notes by remember { mutableStateOf("") }
    var sweet by remember { mutableStateOf(3f) }
    var bitter by remember { mutableStateOf(2f) }
    var sour by remember { mutableStateOf(2f) }
    var body by remember { mutableStateOf(3f) }
    var smoky by remember { mutableStateOf(1f) }
    var imageUrl by remember { mutableStateOf<String?>(null) }

    val photoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            imageUrl = uri.toString()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("${entry.name} 시음 추가", fontWeight = FontWeight.Black, color = Slate900) },
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
                value = date,
                onValueChange = { date = it },
                label = { Text("시음 날짜 (YYYY-MM-DD)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            Text("별점 평가", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                (1..5).forEach { star ->
                    FilterChip(
                        selected = rating == star,
                        onClick = { rating = star },
                        label = { Text("${star}점") }
                    )
                }
            }

            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("시음 노트 및 소감") },
                modifier = Modifier.fillMaxWidth().height(100.dp),
                shape = RoundedCornerShape(12.dp),
                maxLines = 4
            )

            Text("📸 시음 인증 사진", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
            if (imageUrl != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                ) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = "선택된 시음 사진",
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

            Text("향미 평가", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            FlavorSlider("단맛 (Sweet)", sweet) { sweet = it }
            FlavorSlider("쓴맛 (Bitter)", bitter) { bitter = it }
            FlavorSlider("신맛 (Sour)", sour) { sour = it }
            FlavorSlider("바디감 (Body)", body) { body = it }
            FlavorSlider("스모키 (Smoky)", smoky) { smoky = it }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    val newRev = TastingReview(
                        id = "rev-${System.currentTimeMillis()}",
                        date = date,
                        rating = rating,
                        notes = if (notes.isBlank()) "시음 기록 완료" else notes,
                        imageUrl = imageUrl,
                        flavors = FlavorProfile(sweet.toInt(), bitter.toInt(), sour.toInt(), body.toInt(), smoky.toInt())
                    )
                    onAddReview(newRev)
                },
                modifier = Modifier.fillMaxWidth().height(54.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = Slate950)
            ) {
                Text("기록 저장하기", fontSize = 16.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}
