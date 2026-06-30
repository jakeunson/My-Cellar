package com.mycellar.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.mycellar.app.ui.navigation.AppNavHost
import com.mycellar.app.ui.theme.MyCellarTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyCellarTheme {
                AppNavHost()
            }
        }
    }
}
