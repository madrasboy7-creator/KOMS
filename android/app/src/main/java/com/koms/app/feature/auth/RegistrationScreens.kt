package com.koms.app.feature.auth

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.koms.app.core.design.*
import com.koms.app.core.network.KomsApiClient
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentRegisterScreen(
    prefillDojo: String? = null,
    onSuccess: () -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val apiClient = remember { KomsApiClient(context) }
    val scope = rememberCoroutineScope()

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var dojoName by remember { mutableStateOf(prefillDojo ?: "Central Honbu Dojo") }
    var dob by remember { mutableStateOf("2010-01-01") }
    var gender by remember { mutableStateOf("Male") }
    var guardianName by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Student Registration", color = DojoText, fontSize = 17.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = DojoText)
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
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Personal & Training Information", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full Name *", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address *", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone Number", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password *", color = DojoSubtext) },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = dojoName,
                onValueChange = { dojoName = it },
                label = { Text("Selected Dojo", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = guardianName,
                onValueChange = { guardianName = it },
                label = { Text("Guardian / Parent Name", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = {
                    if (name.isBlank() || email.isBlank() || password.isBlank()) {
                        Toast.makeText(context, "Name, email, and password are required.", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    isLoading = true
                    scope.launch {
                        val payload = mapOf(
                            "name" to name.trim(),
                            "email" to email.trim(),
                            "phone" to phone.trim(),
                            "password" to password,
                            "dojo_name" to dojoName.trim(),
                            "guardian_name" to guardianName.trim(),
                            "dob" to dob,
                            "gender" to gender
                        )
                        val res = apiClient.registerStudent(payload)
                        isLoading = false
                        if (res.isSuccess) {
                            Toast.makeText(context, res.getOrNull(), Toast.LENGTH_LONG).show()
                            onSuccess()
                        } else {
                            Toast.makeText(context, "Error: ${res.exceptionOrNull()?.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(10.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                } else {
                    Text("Submit Student Application", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MasterRegisterScreen(
    onSuccess: () -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val apiClient = remember { KomsApiClient(context) }
    val scope = rememberCoroutineScope()

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var style by remember { mutableStateOf("Okinawa Shorin Ryu & Kobudo") }
    var danRank by remember { mutableStateOf("4th Dan Black Belt") }
    var experience by remember { mutableStateOf("12 Years") }
    var dojoName by remember { mutableStateOf("") }
    var dojoAddress by remember { mutableStateOf("") }
    var dojoCity by remember { mutableStateOf("Chennai") }
    var isLoading by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Master & Dojo Application", color = DojoText, fontSize = 17.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = DojoText)
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
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Sensei Personal & Martial Credentials", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Sensei / Master Full Name *", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address *", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Contact Phone", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Portal Password *", color = DojoSubtext) },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = danRank,
                onValueChange = { danRank = it },
                label = { Text("Dan / Belt Rank", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = style,
                onValueChange = { style = it },
                label = { Text("Martial Arts Style", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))
            Text("Proposed Dojo Details", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)

            OutlinedTextField(
                value = dojoName,
                onValueChange = { dojoName = it },
                label = { Text("Dojo / Branch Name *", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = dojoAddress,
                onValueChange = { dojoAddress = it },
                label = { Text("Training Hall Address", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = dojoCity,
                onValueChange = { dojoCity = it },
                label = { Text("City", color = DojoSubtext) },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(14.dp))

            Button(
                onClick = {
                    if (name.isBlank() || email.isBlank() || password.isBlank() || dojoName.isBlank()) {
                        Toast.makeText(context, "Name, email, password, and Dojo name are required.", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    isLoading = true
                    scope.launch {
                        val payload = mapOf(
                            "name" to name.trim(),
                            "email" to email.trim(),
                            "phone" to phone.trim(),
                            "password" to password,
                            "dan_rank" to danRank.trim(),
                            "style" to style.trim(),
                            "experience" to experience.trim(),
                            "dojo_name" to dojoName.trim(),
                            "dojo_address" to dojoAddress.trim(),
                            "dojo_city" to dojoCity.trim()
                        )
                        val res = apiClient.registerMaster(payload)
                        isLoading = false
                        if (res.isSuccess) {
                            Toast.makeText(context, res.getOrNull(), Toast.LENGTH_LONG).show()
                            onSuccess()
                        } else {
                            Toast.makeText(context, "Error: ${res.exceptionOrNull()?.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(10.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                } else {
                    Text("Submit Master & Dojo Application", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
