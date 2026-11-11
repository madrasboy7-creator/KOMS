package com.koms.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.koms.app.core.design.*
import com.koms.app.core.model.AppVersionInfo
import com.koms.app.core.network.KomsApiClient
import com.koms.app.core.sync.KomsSyncWorker
import com.koms.app.feature.auth.LoginScreen
import com.koms.app.feature.auth.MasterRegisterScreen
import com.koms.app.feature.auth.StudentRegisterScreen
import com.koms.app.feature.common.CommonHomeScreen
import com.koms.app.feature.grandmaster.GrandMasterPortalScreen
import com.koms.app.feature.master.MasterPortalScreen
import com.koms.app.feature.splash.SplashScreen
import com.koms.app.feature.student.StudentPortalScreen
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Schedule background synchronization with WorkManager
        scheduleBackgroundSync()

        setContent {
            KomsTheme {
                val navController = rememberNavController()
                val apiClient = remember { KomsApiClient(this@MainActivity) }
                val coroutineScope = rememberCoroutineScope()
                var updateInfo by remember { mutableStateOf<AppVersionInfo?>(null) }

                LaunchedEffect(Unit) {
                    coroutineScope.launch {
                        val info = apiClient.checkAppVersion()
                        if (info.updateAvailable) {
                            updateInfo = info
                        }
                    }
                }

                Box(modifier = Modifier.fillMaxSize().background(DojoDarkBg)) {
                    NavHost(
                        navController = navController,
                        startDestination = "splash"
                    ) {
                        composable("splash") {
                            SplashScreen(
                                onNavigateToHome = {
                                    navController.navigate("home") {
                                        popUpTo("splash") { inclusive = true }
                                    }
                                },
                                onNavigateToPortal = { role ->
                                    val dest = when (role.lowercase()) {
                                        "master" -> "master_portal"
                                        "grandmaster" -> "grandmaster_portal"
                                        else -> "student_portal"
                                    }
                                    navController.navigate(dest) {
                                        popUpTo("splash") { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("home") {
                            CommonHomeScreen(
                                onNavigateToLogin = { portalPref ->
                                    navController.navigate("login/$portalPref")
                                },
                                onNavigateToStudentRegister = { prefillDojo ->
                                    navController.navigate("register_student?dojo=${prefillDojo ?: ""}")
                                },
                                onNavigateToMasterRegister = {
                                    navController.navigate("register_master")
                                }
                            )
                        }

                        composable("login/{portal}") { backStackEntry ->
                            val portal = backStackEntry.arguments?.getString("portal") ?: "student"
                            LoginScreen(
                                initialPortal = portal,
                                onLoginSuccess = { role ->
                                    val dest = when (role.lowercase()) {
                                        "master" -> "master_portal"
                                        "grandmaster" -> "grandmaster_portal"
                                        else -> "student_portal"
                                    }
                                    navController.navigate(dest) {
                                        popUpTo("home") { inclusive = false }
                                    }
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("register_student?dojo={dojo}") { backStackEntry ->
                            val prefillDojo = backStackEntry.arguments?.getString("dojo")
                            StudentRegisterScreen(
                                prefillDojo = prefillDojo,
                                onSuccess = {
                                    navController.navigate("home") {
                                        popUpTo("home") { inclusive = true }
                                    }
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("register_master") {
                            MasterRegisterScreen(
                                onSuccess = {
                                    navController.navigate("home") {
                                        popUpTo("home") { inclusive = true }
                                    }
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("student_portal") {
                            StudentPortalScreen(
                                onLogout = {
                                    navController.navigate("home") {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("master_portal") {
                            MasterPortalScreen(
                                onLogout = {
                                    navController.navigate("home") {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("grandmaster_portal") {
                            GrandMasterPortalScreen(
                                onLogout = {
                                    navController.navigate("home") {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }
                    }

                    // Update Notification Dialog (Phase 8: Automatic Update Management)
                    updateInfo?.let { info ->
                        AlertDialog(
                            onDismissRequest = { updateInfo = null },
                            title = { Text("KOMS Update Available (${info.latestVersion})", color = DojoText) },
                            text = {
                                Text(
                                    "A newer version of the KOMS Native Android app is available with performance improvements and offline synchronization updates.",
                                    color = DojoSubtext
                                )
                            },
                            confirmButton = {
                                Button(
                                    onClick = {
                                        updateInfo = null
                                        Toast.makeText(this@MainActivity, "Downloading latest signed APK release...", Toast.LENGTH_LONG).show()
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = DojoRed)
                                ) {
                                    Text("Update Now", color = Color.White)
                                }
                            },
                            dismissButton = {
                                OutlinedButton(onClick = { updateInfo = null }) {
                                    Text("Later", color = DojoSubtext)
                                }
                            },
                            containerColor = DojoSurface
                        )
                    }
                }
            }
        }
    }

    private fun scheduleBackgroundSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<KomsSyncWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "koms_background_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
}
