package com.koms.app.feature.grandmaster

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
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
fun GrandMasterPortalScreen(
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager(context) }
    val user = sessionManager.getCurrentUser()

    var activeTab by remember { mutableStateOf("overview") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(user?.name ?: "Hanshi Grand Master", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("Executive Organization Administration (9th Dan)", color = DojoGold, fontSize = 11.sp)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        sessionManager.clearSession()
                        onLogout()
                    }) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Logout", tint = DojoRed)
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
            item {
                Text("Organization Executive Overview", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text("Central federation management & branch supervision", color = DojoSubtext, fontSize = 11.5.sp)
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg), border = BorderStroke(1.dp, Color(0xFF1E283D))) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Total Branches", color = DojoSubtext, fontSize = 11.5.sp)
                            Text("6 Dojos", color = DojoText, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg), border = BorderStroke(1.dp, Color(0xFF1E283D))) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Licensed Masters", color = DojoSubtext, fontSize = 11.5.sp)
                            Text("8 Senseis", color = DojoGold, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg), border = BorderStroke(1.dp, Color(0xFF1E283D))) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Registered Students", color = DojoSubtext, fontSize = 11.5.sp)
                            Text("520 Active", color = DojoGreen, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg), border = BorderStroke(1.dp, Color(0xFF1E283D))) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Org Attendance", color = DojoSubtext, fontSize = 11.5.sp)
                            Text("94.2%", color = DojoGreen, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Pending Master & Dojo Applications
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text("Master & Dojo Licensing Applications", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, DojoGold)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Sensei S. Karthikeyan (4th Dan)", color = DojoText, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
                            SuggestionChip(
                                onClick = {},
                                label = { Text("Pending Review", color = DojoGold, fontSize = 10.5.sp) }
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Proposed Dojo: Dragon Claw Martial Academy — Tambaram Branch", color = DojoSubtext, fontSize = 12.sp)
                        Text("Karate Style: Okinawa Shorin Ryu • 12 Years Teaching Experience", color = DojoSubtext, fontSize = 11.5.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { Toast.makeText(context, "Sensei & Branch Approved and Published to Common UI!", Toast.LENGTH_SHORT).show() },
                                colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Approve Branch", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                            OutlinedButton(
                                onClick = { Toast.makeText(context, "Application Rejected", Toast.LENGTH_SHORT).show() },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Decline", fontSize = 12.sp, color = DojoRed)
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(6.dp))
                Text("Approved Organizational Branches", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }

            val orgDojos = listOf(
                "Central Honbu Dojo" to "New Perungalathur · Master: Kyoshi M. Mohan (5th Dan)",
                "Ranga Nagar Branch" to "Mudichur · Master: Sensei R. Barath (3rd Dan)",
                "Anna Nagar Training Center" to "Anna Nagar West · Master: Sensei K. Suresh (4th Dan)"
            )

            items(orgDojos) { (name, info) ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, Color(0xFF1E283D))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text(name, color = DojoText, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
                            SuggestionChip(onClick = {}, label = { Text("Active", color = DojoGreen, fontSize = 10.sp) })
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(info, color = DojoSubtext, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
