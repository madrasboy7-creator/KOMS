package com.koms.app.feature.auth

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.koms.app.core.design.*
import com.koms.app.core.network.KomsApiClient
import com.koms.app.core.security.SessionManager
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    initialPortal: String = "student",
    onLoginSuccess: (role: String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val apiClient = remember { KomsApiClient(context) }
    val sessionManager = remember { SessionManager(context) }
    val scope = rememberCoroutineScope()

    var selectedPortal by remember { mutableStateOf(initialPortal) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showServerSettings by remember { mutableStateOf(false) }
    var customServerUrl by remember { mutableStateOf(sessionManager.getServerUrl()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Portal Authentication", color = DojoText, fontSize = 17.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = DojoText)
                    }
                },
                actions = {
                    TextButton(onClick = { showServerSettings = !showServerSettings }) {
                        Text("Server", color = DojoGold, fontSize = 12.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DojoDarkBg)
            )
        },
        containerColor = DojoDarkBg
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Portal Selector Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF141926), RoundedCornerShape(10.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                listOf(
                    "student" to "Student",
                    "master" to "Master",
                    "grandmaster" to "Grand Master"
                ).forEach { (roleKey, label) ->
                    val isSelected = selectedPortal == roleKey
                    Button(
                        onClick = { selectedPortal = roleKey },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) DojoRed else Color.Transparent,
                            contentColor = if (isSelected) Color.White else DojoSubtext
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(vertical = 6.dp)
                    ) {
                        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Subtitle
            val portalTitle = when (selectedPortal) {
                "master" -> "Dojo Master Control Center"
                "grandmaster" -> "Grand Master Administration"
                else -> "Karate Student Portal"
            }
            Text(
                text = portalTitle,
                color = DojoGold,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Enter your verified credentials to access your dashboard.",
                color = DojoSubtext,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
            )

            // Server Settings if toggled
            if (showServerSettings) {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = DojoSurface)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("API Server Configuration:", color = DojoGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = customServerUrl,
                            onValueChange = { customServerUrl = it },
                            label = { Text("Base URL", fontSize = 11.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = {
                                    sessionManager.setServerUrl(customServerUrl)
                                    showServerSettings = false
                                    Toast.makeText(context, "Server URL updated", Toast.LENGTH_SHORT).show()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Save", fontSize = 11.sp)
                            }
                            OutlinedButton(
                                onClick = {
                                    customServerUrl = SessionManager.DEFAULT_PRODUCTION_URL
                                    sessionManager.setServerUrl(SessionManager.DEFAULT_PRODUCTION_URL)
                                    showServerSettings = false
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Reset Prod", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            // Inputs
            OutlinedTextField(
                value = email,
                onValueChange = { email = it; errorMessage = null },
                label = { Text("Email or Member ID", color = DojoSubtext) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = DojoCardBg,
                    unfocusedContainerColor = DojoCardBg,
                    focusedBorderColor = DojoRed,
                    unfocusedBorderColor = DojoBorder,
                    focusedTextColor = DojoText,
                    unfocusedTextColor = DojoText
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it; errorMessage = null },
                label = { Text("Password", color = DojoSubtext) },
                singleLine = true,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = "Toggle password",
                            tint = DojoSubtext
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = DojoCardBg,
                    unfocusedContainerColor = DojoCardBg,
                    focusedBorderColor = DojoRed,
                    unfocusedBorderColor = DojoBorder,
                    focusedTextColor = DojoText,
                    unfocusedTextColor = DojoText
                )
            )

            errorMessage?.let { err ->
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = err,
                    color = DojoRed,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    if (email.isBlank() || password.isBlank()) {
                        errorMessage = "Please enter both email and password."
                        return@Button
                    }
                    isLoading = true
                    errorMessage = null
                    scope.launch {
                        val res = apiClient.login(email.trim(), password, selectedPortal)
                        isLoading = false
                        if (res.isSuccess) {
                            val user = res.getOrNull()
                            val actualRole = user?.role ?: selectedPortal
                            Toast.makeText(context, "Welcome Sensei / Student: ${user?.name}", Toast.LENGTH_SHORT).show()
                            onLoginSuccess(actualRole)
                        } else {
                            errorMessage = res.exceptionOrNull()?.message ?: "Login authentication failed"
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(10.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text("Secure Login →", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Kobudo Renmei Bukenkan - India\nCentral Organization Database",
                color = DojoSubtext,
                fontSize = 11.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}
