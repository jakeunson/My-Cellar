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
