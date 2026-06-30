package com.mycellar.app.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.mycellar.app.data.SampleData
import com.mycellar.app.ui.screens.*

@Composable
fun AppNavHost() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "home"

    var entries by remember { mutableStateOf(SampleData.defaultEntries) }
    var rankings by remember { mutableStateOf(SampleData.defaultRankings) }
    var parties by remember { mutableStateOf(SampleData.defaultParties) }

    Scaffold(
        bottomBar = {
            BottomNavBar(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    navController.navigate(route) {
                        popUpTo(navController.graph.startDestinationId) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            NavHost(navController = navController, startDestination = "home") {
                composable("home") {
                    HomeScreen(
                        entries = entries,
                        rankingRecords = rankings,
                        onNavigate = { navController.navigate(it) }
                    )
                }
                composable("add") {
                    AddLiquorScreen(
                        onAddLiquor = { newEntry ->
                            entries = listOf(newEntry) + entries
                            navController.popBackStack()
                        },
                        onBack = { navController.popBackStack() }
                    )
                }
                composable(
                    route = "detail/{liquorId}",
                    arguments = listOf(navArgument("liquorId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val liquorId = backStackEntry.arguments?.getString("liquorId") ?: ""
                    val entry = entries.find { it.id == liquorId }
                    if (entry != null) {
                        DetailScreen(
                            entry = entry,
                            onBack = { navController.popBackStack() },
                            onDelete = {
                                entries = entries.filter { it.id != liquorId }
                                navController.popBackStack()
                            },
                            onNavigate = { navController.navigate(it) },
                            onDeleteReview = { revId ->
                                entries = entries.map { e ->
                                    if (e.id == liquorId) e.copy(reviews = e.reviews.filter { it.id != revId }) else e
                                }
                            }
                        )
                    }
                }
                composable(
                    route = "edit/{liquorId}",
                    arguments = listOf(navArgument("liquorId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val liquorId = backStackEntry.arguments?.getString("liquorId") ?: ""
                    val entry = entries.find { it.id == liquorId }
                    if (entry != null) {
                        EditLiquorScreen(
                            entry = entry,
                            onUpdate = { updated ->
                                entries = entries.map { if (it.id == updated.id) updated else it }
                                navController.popBackStack()
                            },
                            onBack = { navController.popBackStack() }
                        )
                    }
                }
                composable(
                    route = "add_review/{liquorId}",
                    arguments = listOf(navArgument("liquorId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val liquorId = backStackEntry.arguments?.getString("liquorId") ?: ""
                    val entry = entries.find { it.id == liquorId }
                    if (entry != null) {
                        AddReviewScreen(
                            entry = entry,
                            onAddReview = { newRev ->
                                entries = entries.map { e ->
                                    if (e.id == liquorId) e.copy(reviews = listOf(newRev) + e.reviews) else e
                                }
                                navController.popBackStack()
                            },
                            onBack = { navController.popBackStack() }
                        )
                    }
                }
                composable("ranking") {
                    RankingScreen(
                        entries = entries,
                        rankingRecords = rankings,
                        onDeleteRecord = { recId -> rankings = rankings.filter { it.id != recId } },
                        onNavigateAdd = { navController.navigate("add_ranking") }
                    )
                }
                composable("add_ranking") {
                    AddRankingScreen(
                        entries = entries,
                        onAddRecord = { newRec ->
                            rankings = listOf(newRec) + rankings
                            navController.popBackStack()
                        },
                        onBack = { navController.popBackStack() }
                    )
                }
                composable("parties") {
                    PartyScreen(
                        entries = entries,
                        parties = parties,
                        onDeleteParty = { pId -> parties = parties.filter { it.id != pId } },
                        onNavigateAdd = { navController.navigate("add_party") },
                        onSelectLiquor = { lid -> navController.navigate("detail/$lid") }
                    )
                }
                composable("add_party") {
                    AddPartyScreen(
                        entries = entries,
                        onAddParty = { newP ->
                            parties = listOf(newP) + parties
                            navController.popBackStack()
                        },
                        onBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
