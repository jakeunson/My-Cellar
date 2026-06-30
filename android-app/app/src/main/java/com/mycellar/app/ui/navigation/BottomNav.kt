package com.mycellar.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.WineBar
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import com.mycellar.app.ui.theme.Amber600
import com.mycellar.app.ui.theme.Rose600
import com.mycellar.app.ui.theme.Slate400
import com.mycellar.app.ui.theme.Slate900

enum class ScreenRoute(val route: String, val title: String) {
    Home("home", "내 셀러"),
    Parties("parties", "파티"),
    Ranking("ranking", "명예의 전당")
}

@Composable
fun BottomNavBar(currentRoute: String, onNavigate: (String) -> Unit) {
    NavigationBar(
        containerColor = Color.White
    ) {
        val items = listOf(ScreenRoute.Home, ScreenRoute.Parties, ScreenRoute.Ranking)
        items.forEach { item ->
            val selected = currentRoute == item.route ||
                    (item == ScreenRoute.Home && (currentRoute == "add" || currentRoute.startsWith("detail") || currentRoute.startsWith("edit") || currentRoute.startsWith("add_review"))) ||
                    (item == ScreenRoute.Parties && currentRoute == "add_party") ||
                    (item == ScreenRoute.Ranking && currentRoute == "add_ranking")

            val activeColor = when (item) {
                ScreenRoute.Home -> Slate900
                ScreenRoute.Parties -> Rose600
                ScreenRoute.Ranking -> Amber600
            }

            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(item.route) },
                icon = {
                    Icon(
                        imageVector = when (item) {
                            ScreenRoute.Home -> Icons.Default.WineBar
                            ScreenRoute.Parties -> Icons.Default.DateRange
                            ScreenRoute.Ranking -> Icons.Default.EmojiEvents
                        },
                        contentDescription = item.title,
                        tint = if (selected) activeColor else Slate400
                    )
                },
                label = {
                    Text(
                        text = item.title,
                        color = if (selected) activeColor else Slate400,
                        fontWeight = if (selected) FontWeight.Black else FontWeight.Bold
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = Color.Transparent
                )
            )
        }
    }
}
