package com.koms.app.feature.student

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.koms.app.core.design.*
import com.koms.app.core.security.SessionManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentPortalScreen(
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager(context) }
    val user = sessionManager.getCurrentUser()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(user?.name ?: "Karate Student", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("Member ID: ${user?.memberId ?: "STU-001"}", color = DojoGold, fontSize = 11.sp)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        sessionManager.clearSession()
                        onLogout()
                    }) {
                        Icon(Icons.Default.Logout, contentDescription = "Logout", tint = DojoRed)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DojoDarkBg)
            )
        },
        containerColor = DojoDarkBg
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Profile Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(user?.name ?: "Student", color = DojoText, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            SuggestionChip(
                                onClick = {},
                                label = { Text("Yellow Belt", fontSize = 11.sp, color = DojoGold, fontWeight = FontWeight.Bold) }
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Dojo: Central Honbu Training Centre", color = DojoSubtext, fontSize = 12.5.sp)
                        Text("Karate Style: Okinawa Shorin Ryu", color = DojoSubtext, fontSize = 12.5.sp)
                    }
                }
            }

            // Stats row
            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = DojoSurface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Attendance", color = DojoSubtext, fontSize = 11.sp)
                            Text("96%", color = DojoGreen, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = DojoSurface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Fee Status", color = DojoSubtext, fontSize = 11.sp)
                            Text("Paid", color = DojoGreen, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = DojoSurface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Next Class", color = DojoSubtext, fontSize = 11.sp)
                            Text("Sat 6 AM", color = DojoGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Training Schedule
            item {
                Text("Weekly Training Schedule", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Saturday: 06:00 AM – 08:00 AM (Kihon & Kata)", color = DojoText, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Sunday: 06:00 AM – 08:00 AM (Kumite & Kobudo Bo)", color = DojoText, fontSize = 13.sp)
                    }
                }
            }

            // Recent Attendance History
            item {
                Text("Recent Attendance History", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }

            val mockAttendance = listOf(
                "2026-11-08 (Sunday)" to "Present",
                "2026-11-07 (Saturday)" to "Present",
                "2026-11-01 (Sunday)" to "Present",
                "2026-10-31 (Saturday)" to "Present",
                "2026-10-25 (Sunday)" to "Excused"
            )

            items(mockAttendance) { (date, status) ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(date, color = DojoText, fontSize = 13.sp)
                        Text(
                            status,
                            color = if (status == "Present") DojoGreen else DojoGold,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
