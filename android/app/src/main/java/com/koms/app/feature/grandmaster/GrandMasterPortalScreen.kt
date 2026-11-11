package com.koms.app.feature.grandmaster

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
fun GrandMasterPortalScreen(
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
                        Text(user?.name ?: "Hanshi Grand Master", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("Executive Organization Administration (9th Dan)", color = DojoGold, fontSize = 11.sp)
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
            item {
                Text("Karate Organization State Summary", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Total Dojos", color = DojoSubtext, fontSize = 12.sp)
                            Text("6 Branches", color = DojoText, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Dojo Masters", color = DojoSubtext, fontSize = 12.sp)
                            Text("8 Senseis", color = DojoGold, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Total Students", color = DojoSubtext, fontSize = 12.sp)
                            Text("520 Active", color = DojoGreen, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Org Attendance", color = DojoSubtext, fontSize = 12.sp)
                            Text("94.2%", color = DojoGreen, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(4.dp))
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
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(name, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(info, color = DojoSubtext, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
