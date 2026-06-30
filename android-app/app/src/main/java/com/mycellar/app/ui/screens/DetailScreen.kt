package com.mycellar.app.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mycellar.app.data.FlavorProfile
import com.mycellar.app.data.TastingEntry
import com.mycellar.app.data.TastingReview
import com.mycellar.app.ui.theme.*
import kotlin.math.cos
import kotlin.math.sin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScreen(
    entry: TastingEntry,
    onBack: () -> Unit,
    onDelete: () -> Unit,
    onNavigate: (String) -> Unit,
    onDeleteReview: (String) -> Unit
) {
    val avgRating = if (entry.reviews.isEmpty()) 0f else entry.reviews.map { it.rating }.average().toFloat()
    val avgFlavors = if (entry.reviews.isEmpty()) {
        FlavorProfile()
    } else {
        FlavorProfile(
            sweet = entry.reviews.map { it.flavors.sweet }.average().toInt(),
            bitter = entry.reviews.map { it.flavors.bitter }.average().toInt(),
            sour = entry.reviews.map { it.flavors.sour }.average().toInt(),
            body = entry.reviews.map { it.flavors.body }.average().toInt(),
            smoky = entry.reviews.map { it.flavors.smoky }.average().toInt()
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(entry.name, fontWeight = FontWeight.Black, color = Slate900) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "뒤로가기", tint = Slate900)
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigate("edit/${entry.id}") }) {
                        Icon(Icons.Default.Edit, contentDescription = "수정", tint = Slate700)
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.Delete, contentDescription = "삭제", tint = Rose600)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { innerPadding ->
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = getCategoryEmoji(entry.category), fontSize = 40.sp)
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(entry.name, style = MaterialTheme.typography.titleLarge, color = Slate900)
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Surface(color = Slate100, shape = RoundedCornerShape(6.dp)) {
                                        Text(
                                            getCategoryKorean(entry.category),
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate700,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                    Surface(color = Slate100, shape = RoundedCornerShape(6.dp)) {
                                        Text(
                                            "도수 ${entry.abv}%",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Slate700,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                    if (!entry.addedDate.isNullOrBlank()) {
                                        Surface(color = Slate100, shape = RoundedCornerShape(6.dp)) {
                                            Text(
                                                "📅 ${entry.addedDate}",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Slate700,
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (entry.reviews.isEmpty()) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Amber50),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp).fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("✨ 아직 등록된 시음 기록이 없습니다", fontWeight = FontWeight.Black, color = Amber800, fontSize = 15.sp)
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = { onNavigate("add_review/${entry.id}") },
                                colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = Slate950),
                                shape = RoundedCornerShape(10.dp),
                                contentPadding = PaddingValues(0.dp),
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "추가", modifier = Modifier.size(20.dp))
                            }
                        }
                    }
                }
            } else {
                // Radar Chart Card (향미 프로필 타이틀 제거 및 향미별 이름 추가)
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Slate900),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .padding(vertical = 24.dp, horizontal = 16.dp)
                                .fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            RadarChart(flavors = avgFlavors)
                        }
                    }
                }

                // History Header with Add Review Button (컨텐츠 가림 방지를 위해 헤더에 + 버튼 이동)
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "📝 시음 히스토리 (${entry.reviews.size})",
                            style = MaterialTheme.typography.titleMedium,
                            color = Slate900
                        )
                        Button(
                            onClick = { onNavigate("add_review/${entry.id}") },
                            colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = Slate950),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(0.dp),
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "추가", modifier = Modifier.size(18.dp))
                        }
                    }
                }

                // Reviews List
                items(entry.reviews) { review ->
                    ReviewCard(review = review, onDelete = { onDeleteReview(review.id) })
                }
            }
        }
    }
}

@Composable
fun RadarChart(flavors: FlavorProfile) {
    val textMeasurer = rememberTextMeasurer()
    val labels = listOf("단맛", "쓴맛", "신맛", "바디감", "스모키")

    Canvas(modifier = Modifier.size(240.dp)) {
        val center = Offset(size.width / 2, size.height / 2)
        val radius = size.width / 2 * 0.65f
        val angles = listOf(-90f, -18f, 54f, 126f, 198f).map { Math.toRadians(it.toDouble()) }

        // Draw Background Web
        for (step in 1..5) {
            val stepRadius = radius * (step / 5f)
            val path = Path()
            angles.forEachIndexed { i, angle ->
                val x = center.x + (stepRadius * cos(angle)).toFloat()
                val y = center.y + (stepRadius * sin(angle)).toFloat()
                if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
            }
            path.close()
            drawPath(path = path, color = Color.Gray.copy(alpha = 0.3f), style = Stroke(width = 1.dp.toPx()))
        }

        // Draw Axes
        angles.forEach { angle ->
            val x = center.x + (radius * cos(angle)).toFloat()
            val y = center.y + (radius * sin(angle)).toFloat()
            drawLine(color = Color.Gray.copy(alpha = 0.3f), start = center, end = Offset(x, y))
        }

        // Draw Data Polygon
        val values = listOf(flavors.sweet, flavors.bitter, flavors.sour, flavors.body, flavors.smoky)
        val dataPath = Path()
        values.forEachIndexed { i, valScore ->
            val r = radius * (valScore / 5f)
            val x = center.x + (r * cos(angles[i])).toFloat()
            val y = center.y + (r * sin(angles[i])).toFloat()
            if (i == 0) dataPath.moveTo(x, y) else dataPath.lineTo(x, y)
        }
        dataPath.close()
        drawPath(path = dataPath, color = Color(0xFFF59E0B).copy(alpha = 0.4f))
        drawPath(path = dataPath, color = Color(0xFFFBBF24), style = Stroke(width = 2.5f.dp.toPx()))

        // Draw Labels
        labels.forEachIndexed { i, label ->
            val labelRadius = radius * 1.30f
            val lx = center.x + (labelRadius * cos(angles[i])).toFloat()
            val ly = center.y + (labelRadius * sin(angles[i])).toFloat()
            val measuredText = textMeasurer.measure(
                text = label,
                style = TextStyle(color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            )
            drawText(
                textLayoutResult = measuredText,
                topLeft = Offset(lx - measuredText.size.width / 2f, ly - measuredText.size.height / 2f)
            )
        }
    }
}

@Composable
fun ReviewCard(review: TastingReview, onDelete: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "📅 ${review.date}", fontSize = 12.sp, color = Slate600, fontWeight = FontWeight.Bold)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Row {
                        repeat(review.rating) {
                            Icon(Icons.Default.Star, contentDescription = null, tint = Amber500, modifier = Modifier.size(16.dp))
                        }
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Delete, contentDescription = "삭제", tint = Rose600, modifier = Modifier.size(16.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Text(review.notes, fontSize = 14.sp, color = Slate800, lineHeight = 20.sp)
        }
    }
}
