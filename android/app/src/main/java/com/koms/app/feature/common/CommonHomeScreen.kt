package com.koms.app.feature.common

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Login
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.koms.app.R
import com.koms.app.core.database.KomsLocalDb
import com.koms.app.core.design.*
import com.koms.app.core.model.Dojo
import com.koms.app.core.network.KomsApiClient
import kotlinx.coroutines.launch

@Composable
fun CommonHomeScreen(
    onNavigateToLogin: (portalPref: String) -> Unit,
    onNavigateToStudentRegister: (prefillDojo: String?) -> Unit,
    onNavigateToMasterRegister: () -> Unit
) {
    val context = LocalContext.current
    val apiClient = remember { KomsApiClient(context) }
    val localDb = remember { KomsLocalDb(context) }
    val coroutineScope = rememberCoroutineScope()

    var activeTab by remember { mutableStateOf("home") }
    var dojos by remember { mutableStateOf(localDb.getDojos()) }
    var dojoSearch by remember { mutableStateOf("") }
    var selectedDojoForDetails by remember { mutableStateOf<Dojo?>(null) }

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            val res = apiClient.getPublicDojos()
            if (res.isSuccess) {
                res.getOrNull()?.let {
                    dojos = it
                    localDb.saveDojos(it)
                }
            }
        }
    }

    Scaffold(
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF07090F))
            ) {
                // Background Karate silhouette with Red Sun banner
                Image(
                    painter = painterResource(id = R.drawable.header_karate_bg),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(115.dp)
                        .alpha(0.95f)
                )

                // Top gradient overlay to blend seamlessly
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(115.dp)
                        .background(
                            Brush.horizontalGradient(
                                listOf(
                                    Color(0xE607090F),
                                    Color(0x6607090F),
                                    Color(0xE607090F)
                                )
                            )
                        )
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Image(
                            painter = painterResource(id = R.drawable.koms_logo),
                            contentDescription = "KOMS Crest",
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .border(1.5.dp, DojoGold, RoundedCornerShape(8.dp))
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "KOMS",
                                color = DojoText,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "KARATE ORGANIZATION SYSTEM",
                                color = DojoGold,
                                fontSize = 8.5.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = "Discipline • Strength • Internal Peace",
                                color = DojoSubtext,
                                fontSize = 7.5.sp
                            )
                        }
                    }

                    Button(
                        onClick = { onNavigateToLogin("student") },
                        colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Login,
                                contentDescription = "Login",
                                tint = Color.White,
                                modifier = Modifier.size(15.dp)
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text("Login", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        },
        bottomBar = {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding(),
                color = Color(0xFF090C16),
                border = BorderStroke(1.dp, Color(0xFF141926))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val tabs = listOf(
                        Triple("home", "Home", null),
                        Triple("dojos", "Dojo", R.drawable.ic_torii_gate),
                        Triple("events", "Events", null),
                        Triple("gallery", "Gallery", null),
                        Triple("belts", "Training Level", null)
                    )

                    tabs.forEach { (tabId, label, customIconRes) ->
                        val isSelected = activeTab == tabId
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clickable { activeTab = tabId }
                                .padding(vertical = 2.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            if (customIconRes != null) {
                                Icon(
                                    painter = painterResource(id = customIconRes),
                                    contentDescription = label,
                                    tint = if (isSelected) DojoRed else DojoSubtext,
                                    modifier = Modifier.size(20.dp)
                                )
                            } else {
                                val icon = when (tabId) {
                                    "home" -> Icons.Default.Home
                                    "events" -> Icons.Default.CalendarMonth
                                    "gallery" -> Icons.Default.Image
                                    else -> Icons.Default.EmojiEvents
                                }
                                Icon(
                                    imageVector = icon,
                                    contentDescription = label,
                                    tint = if (isSelected) DojoRed else DojoSubtext,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(3.dp))

                            Text(
                                text = label,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) DojoRed else DojoSubtext
                            )

                            Spacer(modifier = Modifier.height(2.dp))

                            if (isSelected) {
                                Box(
                                    modifier = Modifier
                                        .width(28.dp)
                                        .height(2.5.dp)
                                        .background(DojoRed, RoundedCornerShape(1.dp))
                                )
                            } else {
                                Spacer(modifier = Modifier.height(2.5.dp))
                            }
                        }
                    }
                }
            }
        },
        containerColor = DojoDarkBg
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (activeTab) {
                "home" -> HomeTabContent(
                    onRegisterStudent = { onNavigateToStudentRegister(null) },
                    onRegisterMaster = onNavigateToMasterRegister,
                    onLogin = { onNavigateToLogin("student") },
                    onCardClick = { cardId ->
                        when (cardId) {
                            "tradition" -> activeTab = "belts"
                            "masters" -> activeTab = "dojos"
                            "levels" -> activeTab = "belts"
                            "events" -> activeTab = "events"
                            "gallery" -> activeTab = "gallery"
                        }
                    }
                )
                "dojos" -> DojosTabContent(
                    dojos = dojos,
                    searchQuery = dojoSearch,
                    onSearchChange = { dojoSearch = it },
                    onEnroll = { dojo -> onNavigateToStudentRegister(dojo.name) },
                    onSelectDetails = { dojo -> selectedDojoForDetails = dojo }
                )
                "events" -> EventsTabContent()
                "gallery" -> GalleryTabContent()
                "belts" -> BeltsTabContent()
            }

            // Dojo Details Modal
            selectedDojoForDetails?.let { dojo ->
                AlertDialog(
                    onDismissRequest = { selectedDojoForDetails = null },
                    title = {
                        Column {
                            Text(dojo.name, color = DojoText, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                            Text(dojo.badge, color = DojoGold, fontSize = 11.5.sp)
                        }
                    },
                    text = {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Head Master: ${dojo.masterName} (${dojo.masterRank})", color = DojoText, fontSize = 13.sp)
                            Text("Address: ${dojo.address}, ${dojo.city}", color = DojoSubtext, fontSize = 12.5.sp)
                            Text("Schedule: ${dojo.schedule}", color = DojoSubtext, fontSize = 12.5.sp)
                            Text("Training Styles: ${dojo.style}", color = DojoSubtext, fontSize = 12.5.sp)
                            Text("Monthly Training Fee: ₹${dojo.monthlyFee}/month", color = DojoGreen, fontWeight = FontWeight.Bold, fontSize = 13.5.sp)
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                selectedDojoForDetails = null
                                onNavigateToStudentRegister(dojo.name)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = DojoRed)
                        ) {
                            Text("Enroll Now", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    },
                    dismissButton = {
                        OutlinedButton(onClick = { selectedDojoForDetails = null }) {
                            Text("Close", color = DojoSubtext)
                        }
                    },
                    containerColor = DojoSurface,
                    shape = RoundedCornerShape(14.dp)
                )
            }
        }
    }
}

@Composable
fun HomeTabContent(
    onRegisterStudent: () -> Unit,
    onRegisterMaster: () -> Unit,
    onLogin: () -> Unit,
    onCardClick: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp)
    ) {
        // Hero Card with authentic Torii Sunset background
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = DojoCardBg)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    // Torii sunset image background
                    Image(
                        painter = painterResource(id = R.drawable.hero_torii_sunset),
                        contentDescription = "Torii Sunset Background",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Dark gradient overlay for readability
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color(0x99090B12),
                                        Color(0xEE090B12),
                                        Color(0xFF090B12)
                                    )
                                )
                            )
                    )

                    // Hero Content
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(18.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "EXPLORE",
                                color = DojoRed,
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = 1.2.sp
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Row {
                                Text(
                                    text = "Explore the ",
                                    color = DojoText,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Karate Tradition",
                                    color = Color(0xFFFF5252),
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Learn about our history, philosophy, masters and the path to black belt.",
                                color = Color(0xFFCBD5E1),
                                fontSize = 12.5.sp,
                                lineHeight = 17.sp
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            OutlinedButton(
                                onClick = { onCardClick("tradition") },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                                border = BorderStroke(1.dp, Color(0x99FFFFFF)),
                                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text("Discover Our Tradition →", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }

                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Button(
                                    onClick = onRegisterStudent,
                                    colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("🎓 Student", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = onRegisterMaster,
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0x22FFFFFF)),
                                    border = BorderStroke(1.dp, Color(0x44FFFFFF)),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("🥋 Master", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                }
                                Button(
                                    onClick = onLogin,
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0E1424)),
                                    border = BorderStroke(1.dp, DojoRed),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("🔐 Login", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFCA5A5))
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "More than a Martial Art... ",
                                    color = DojoSubtext,
                                    fontSize = 10.5.sp,
                                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                                )
                                Text(
                                    text = "It's a Way of Life.",
                                    color = DojoText,
                                    fontSize = 10.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .width(28.dp)
                                        .height(2.dp)
                                        .background(DojoRed)
                                )
                            }
                        }
                    }
                }
            }
        }

        // CARD 1: Our Tradition (with student gi image)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onCardClick("tradition") },
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(DojoRed, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Shield, contentDescription = "Tradition", tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Our Tradition", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Discover the rich history, philosophy and values of Karate and Kobudo.",
                            color = DojoSubtext,
                            fontSize = 12.sp,
                            lineHeight = 16.5.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Learn More →", color = DojoRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(RoundedCornerShape(12.dp))
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.card_student_gi),
                            contentDescription = "Karate Tradition Student",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .align(Alignment.CenterEnd)
                                .background(Color(0x55000000))
                                .padding(horizontal = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("空\n手\n道", color = Color(0xEEFFFFFF), fontSize = 10.sp, fontWeight = FontWeight.Bold, lineHeight = 13.sp)
                        }
                    }
                }
            }
        }

        // CARD 2: Our Masters (with master bow image)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onCardClick("masters") },
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(DojoRed, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, contentDescription = "Masters", tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Our Masters", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Meet our respected instructors and learn from their experience and guidance.",
                            color = DojoSubtext,
                            fontSize = 12.sp,
                            lineHeight = 16.5.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Learn More →", color = DojoRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(RoundedCornerShape(12.dp))
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.card_master_bow),
                            contentDescription = "Master Bowing in Dojo",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .align(Alignment.CenterEnd)
                                .background(Color(0x55000000))
                                .padding(horizontal = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("師\n範", color = Color(0xEEFFFFFF), fontSize = 12.sp, fontWeight = FontWeight.Bold, lineHeight = 15.sp)
                        }
                    }
                }
            }
        }

        // CARD 3: Training Levels (with Belt Progression Badges)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onCardClick("levels") },
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(DojoRed, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.MilitaryTech, contentDescription = "Levels", tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Training Levels", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                            Text("From beginner to advanced — find the right path for your growth.", color = DojoSubtext, fontSize = 12.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Belt progression bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF090D18), RoundedCornerShape(10.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        listOf(
                            "White" to Color(0xFFE2E8F0),
                            "Yellow" to Color(0xFFFACC15),
                            "Green" to Color(0xFF22C55E),
                            "Blue" to Color(0xFF3B82F6),
                            "Brown" to Color(0xFF92400E),
                            "Black" to Color(0xFF000000)
                        ).forEach { (belt, col) ->
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Box(
                                    modifier = Modifier
                                        .size(18.dp, 8.dp)
                                        .clip(RoundedCornerShape(2.dp))
                                        .background(col)
                                        .border(0.5.dp, Color(0x44FFFFFF), RoundedCornerShape(2.dp))
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(belt, color = DojoSubtext, fontSize = 8.5.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Learn More →", color = DojoRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // CARD 4: Upcoming Events (with event poster)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onCardClick("events") },
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(DojoRed, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CalendarMonth, contentDescription = "Events", tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Upcoming Events", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Stay updated with competitions, seminars, camps and special activities.",
                            color = DojoSubtext,
                            fontSize = 12.sp,
                            lineHeight = 16.5.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("View All Events →", color = DojoRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(RoundedCornerShape(12.dp))
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.card_event_poster),
                            contentDescription = "Karate Event Poster",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .fillMaxWidth()
                                .background(Color(0xDD000000))
                                .padding(vertical = 2.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("2026 CHAMPS", color = DojoGold, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // CARD 5: Photo Gallery (with collage frames - TERMINAL CARD)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onCardClick("gallery") },
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(16.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .background(DojoRed, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.PhotoLibrary, contentDescription = "Gallery", tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Photo Gallery", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Relive our moments — training sessions, events, awards and more.",
                            color = DojoSubtext,
                            fontSize = 12.sp,
                            lineHeight = 16.5.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("View Gallery →", color = DojoRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    // Double photo collage
                    Box(modifier = Modifier.size(100.dp)) {
                        Image(
                            painter = painterResource(id = R.drawable.card_gallery_torii),
                            contentDescription = "Torii Gate",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(64.dp)
                                .align(Alignment.TopStart)
                                .clip(RoundedCornerShape(8.dp))
                                .border(1.5.dp, Color(0x88FFFFFF), RoundedCornerShape(8.dp))
                        )
                        Image(
                            painter = painterResource(id = R.drawable.card_gallery_master),
                            contentDescription = "Karate Master",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(64.dp)
                                .align(Alignment.BottomEnd)
                                .clip(RoundedCornerShape(8.dp))
                                .border(1.5.dp, Color(0x88FFFFFF), RoundedCornerShape(8.dp))
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DojosTabContent(
    dojos: List<Dojo>,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onEnroll: (Dojo) -> Unit,
    onSelectDetails: (Dojo) -> Unit
) {
    var selectedLocationFilter by remember { mutableStateOf("All Dojos") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 14.dp, vertical = 10.dp)
    ) {
        // Search & Filter Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .background(Color(0xFF0F1524), RoundedCornerShape(24.dp))
                .border(1.dp, Color(0xFF1E283D), RoundedCornerShape(24.dp))
                .padding(horizontal = 16.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = Color(0xFF94A3B8),
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                BasicTextField(
                    value = searchQuery,
                    onValueChange = onSearchChange,
                    singleLine = true,
                    textStyle = TextStyle(
                        color = Color.White,
                        fontSize = 13.5.sp
                    ),
                    modifier = Modifier.weight(1f),
                    decorationBox = { innerTextField ->
                        if (searchQuery.isEmpty()) {
                            Text(
                                text = "Search dojo by name or location...",
                                color = Color(0xFF64748B),
                                fontSize = 13.sp
                            )
                        }
                        innerTextField()
                    }
                )
                Icon(
                    imageVector = Icons.Default.Tune,
                    contentDescription = "Filter",
                    tint = Color(0xFF94A3B8),
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Horizontal Location Filter Pills
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Pill 1: All Dojos (Torii gate icon)
            val isAllSelected = selectedLocationFilter == "All Dojos"
            Surface(
                onClick = { selectedLocationFilter = "All Dojos" },
                shape = RoundedCornerShape(20.dp),
                color = if (isAllSelected) DojoRed else Color(0xFF0E1422),
                border = if (isAllSelected) null else BorderStroke(1.dp, Color(0xFF1E283D))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_torii_gate),
                        contentDescription = null,
                        tint = if (isAllSelected) Color.White else Color(0xFF94A3B8),
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "All Dojos",
                        color = if (isAllSelected) Color.White else Color(0xFFCBD5E1),
                        fontSize = 12.sp,
                        fontWeight = if (isAllSelected) FontWeight.Bold else FontWeight.Medium
                    )
                }
            }

            // Location Pills: Perungalathur, Mudichur, Anna Nagar
            listOf("Perungalathur", "Mudichur", "Anna Nagar").forEach { loc ->
                val isSelected = selectedLocationFilter == loc
                Surface(
                    onClick = { selectedLocationFilter = loc },
                    shape = RoundedCornerShape(20.dp),
                    color = if (isSelected) DojoRed else Color(0xFF0E1422),
                    border = if (isSelected) null else BorderStroke(1.dp, Color(0xFF1E283D))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = if (isSelected) Color.White else Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = loc,
                            color = if (isSelected) Color.White else Color(0xFFCBD5E1),
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Filter list
        val filteredList = dojos.filter { dojo ->
            val matchesQuery = searchQuery.isBlank() ||
                dojo.name.contains(searchQuery, ignoreCase = true) ||
                dojo.address.contains(searchQuery, ignoreCase = true) ||
                dojo.city.contains(searchQuery, ignoreCase = true) ||
                dojo.masterName.contains(searchQuery, ignoreCase = true)

            val matchesLocation = when (selectedLocationFilter) {
                "All Dojos" -> true
                else -> dojo.address.contains(selectedLocationFilter, ignoreCase = true) ||
                    dojo.city.contains(selectedLocationFilter, ignoreCase = true) ||
                    dojo.name.contains(selectedLocationFilter, ignoreCase = true)
            }
            matchesQuery && matchesLocation
        }

        // Section Title Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .width(3.5.dp)
                        .height(18.dp)
                        .background(DojoRed, RoundedCornerShape(2.dp))
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Approved Karate & Kobudo Dojos (${filteredList.size})",
                    color = Color.White,
                    fontSize = 14.5.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Surface(
                color = Color(0xFF081C12),
                border = BorderStroke(1.dp, Color(0xFF15803D)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        tint = Color(0xFF22C55E),
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "Verified",
                        color = Color(0xFF22C55E),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (filteredList.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 40.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No matching dojos found.",
                    color = DojoSubtext,
                    fontSize = 13.sp
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredList) { dojo ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF0D1322)),
                        shape = RoundedCornerShape(18.dp),
                        border = BorderStroke(
                            1.2.dp,
                            Brush.linearGradient(
                                listOf(
                                    Color(0xFFEF4444).copy(alpha = 0.45f),
                                    Color(0xFF1E283D)
                                )
                            )
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            // Left Column: Dojo Entrance Image
                            Image(
                                painter = painterResource(id = R.drawable.dojo_ranga_nagar),
                                contentDescription = dojo.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .width(135.dp)
                                    .height(180.dp)
                                    .clip(RoundedCornerShape(12.dp))
                            )

                            Spacer(modifier = Modifier.width(12.dp))

                            // Right Column: Details & Actions
                            Column(
                                modifier = Modifier.weight(1f)
                            ) {
                                // Row 1: Dojo Name & Fee Pill
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    val mainName = if (dojo.name.contains(" - ")) {
                                        dojo.name.substringBefore(" - ").trim()
                                    } else if (dojo.name.contains(" — ")) {
                                        dojo.name.substringBefore(" — ").trim()
                                    } else {
                                        dojo.name
                                    }

                                    Text(
                                        text = mainName,
                                        color = Color.White,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.weight(1f)
                                    )

                                    Surface(
                                        color = Color(0xFF092E1B),
                                        shape = RoundedCornerShape(14.dp),
                                        border = BorderStroke(1.dp, Color(0xFF10B981))
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.5.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Check,
                                                contentDescription = null,
                                                tint = Color(0xFF10B981),
                                                modifier = Modifier.size(11.dp)
                                            )
                                            Spacer(modifier = Modifier.width(3.dp))
                                            Text(
                                                text = "₹${dojo.monthlyFee} /mo",
                                                color = Color(0xFF10B981),
                                                fontSize = 10.5.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }

                                // Row 2: Subtitle
                                val subName = if (dojo.name.contains(" - ")) {
                                    dojo.name.substringAfter(" - ").trim()
                                } else if (dojo.name.contains(" — ")) {
                                    dojo.name.substringAfter(" — ").trim()
                                } else if (dojo.badge.isNotBlank()) {
                                    dojo.badge
                                } else {
                                    "Ranga Nagar Dojo"
                                }
                                Text(
                                    text = "— $subName",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Normal
                                )

                                Spacer(modifier = Modifier.height(7.dp))

                                // Row 3: Address
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.LocationOn,
                                        contentDescription = "Address",
                                        tint = Color(0xFFF59E0B),
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    val addrClean = if (dojo.address.contains("1/38")) {
                                        dojo.address.replace("1/38", "#138")
                                    } else if (dojo.address.contains("Ranga Nagar")) {
                                        dojo.address
                                    } else {
                                        "#138 2nd Street, Ranga Nagar, Mudichur"
                                    }
                                    val addrText = if (addrClean.contains("Chennai - 600048")) {
                                        if (addrClean.endsWith("Chennai")) addrClean else "$addrClean, Chennai"
                                    } else {
                                        "$addrClean, Chennai - 600048, Chennai"
                                    }
                                    Text(
                                        text = addrText,
                                        color = Color(0xFFCBD5E1),
                                        fontSize = 10.5.sp,
                                        lineHeight = 14.sp
                                    )
                                }

                                Spacer(modifier = Modifier.height(6.dp))
                                HorizontalDivider(color = Color(0xFF1E283D), thickness = 0.8.dp)
                                Spacer(modifier = Modifier.height(6.dp))

                                // Row 4: Schedule & Style
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CalendarMonth,
                                        contentDescription = "Schedule",
                                        tint = Color(0xFFCBD5E1),
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(3.dp))
                                    val cleanSchedule = dojo.schedule
                                        .replace("[", "")
                                        .replace("]", "")
                                        .replace("\"", "")
                                        .trim()
                                        .ifBlank { "Saturday, Sunday" }
                                    Text(
                                        text = cleanSchedule,
                                        color = Color(0xFFCBD5E1),
                                        fontSize = 10.sp
                                    )
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Text(
                                        text = "|",
                                        color = Color(0xFF334155),
                                        fontSize = 10.sp
                                    )
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_karate_stance),
                                        contentDescription = null,
                                        modifier = Modifier.size(13.dp)
                                    )
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(
                                        text = "Styles: ${dojo.style.ifBlank { "Okinawa Shorin Ryu" }}",
                                        color = Color(0xFFCBD5E1),
                                        fontSize = 10.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                Spacer(modifier = Modifier.height(7.dp))

                                // Row 5: Sensei
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_gold_temple),
                                        contentDescription = null,
                                        modifier = Modifier.size(15.dp)
                                    )
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Column {
                                        val rawMaster = dojo.masterName
                                        val cleanMaster = rawMaster
                                            .replace("(Senior Master)", "")
                                            .replace("(SeniorMaster)", "")
                                            .replace("(Kyoshi)", "")
                                            .replace("()", "")
                                            .trim()
                                        val senseiName = when {
                                            cleanMaster.startsWith("Kyoshi", ignoreCase = true) -> cleanMaster
                                            cleanMaster.startsWith("Sensei", ignoreCase = true) -> cleanMaster
                                            cleanMaster.isNotBlank() -> "Kyoshi $cleanMaster"
                                            else -> "Kyoshi Rubeshwaren"
                                        }
                                        Text(
                                            text = "Sensei: $senseiName",
                                            color = Color(0xFFF5A000),
                                            fontSize = 11.5.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "(Senior Master) (6th Dan Black Belt (Kyoshi))",
                                            color = Color(0xFFFBBF24),
                                            fontSize = 9.sp
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                // Row 6: Details & Enroll Now buttons
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        onClick = { onSelectDetails(dojo) },
                                        modifier = Modifier
                                            .weight(0.44f)
                                            .height(32.dp),
                                        color = Color(0xFF0F1523),
                                        border = BorderStroke(1.dp, Color(0xFF334155)),
                                        shape = RoundedCornerShape(16.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxSize(),
                                            horizontalArrangement = Arrangement.Center,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Info,
                                                contentDescription = "Details",
                                                tint = Color.White,
                                                modifier = Modifier.size(13.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = "Details",
                                                color = Color.White,
                                                fontSize = 11.5.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }

                                    Surface(
                                        onClick = { onEnroll(dojo) },
                                        modifier = Modifier
                                            .weight(0.56f)
                                            .height(32.dp),
                                        color = DojoRed,
                                        shape = RoundedCornerShape(16.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxSize(),
                                            horizontalArrangement = Arrangement.Center,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                painter = painterResource(id = R.drawable.ic_enroll_pencil),
                                                contentDescription = "Enroll",
                                                tint = Color.White,
                                                modifier = Modifier.size(13.dp)
                                            )
                                            Spacer(modifier = Modifier.width(5.dp))
                                            Text(
                                                text = "Enroll Now >",
                                                color = Color.White,
                                                fontSize = 11.5.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EventsTabContent() {
    val events = listOf(
        "South India Shorin-Ryu Championship" to ("Jawaharlal Nehru Indoor Stadium, Chennai" to "July 18-20, 2026 · Kata, Kumite & Weaponry"),
        "Okinawa Kobudo Master Clinic & Grading" to ("Central Honbu Dojo, New Perungalathur" to "August 5, 2026 · Direct Okinawan Lineage"),
        "State Karate Selection Tournament" to ("Anna Nagar Training Centre" to "September 12, 2026 · Selection for National Games")
    )
    LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Upcoming Tournaments & Seminars", color = DojoGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
        }
        items(events) { (title, pair) ->
            val (venue, desc) = pair
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(title, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("📍 $venue", color = DojoGold, fontSize = 12.sp)
                    Text(desc, color = DojoSubtext, fontSize = 11.5.sp)
                }
            }
        }
    }
}

@Composable
fun GalleryTabContent() {
    val highlights = listOf(
        "State Championship Gold Medalists" to "2026 Chennai Arena · 14 Golds",
        "Senior Dan Black Belt Promotions" to "Okinawan Technical Committee Certification",
        "Matayoshi Weapons Training Clinic" to "Bo, Sai, Nunchaku, Kama & Tonfa",
        "Junior Kata & Kihon Showcase" to "Mudichur Branch Dojo Summer Camp"
    )
    LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Activity & Championship Highlights", color = DojoGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
        }
        items(highlights) { (title, subtitle) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF161E30)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🥋", fontSize = 24.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(title, color = DojoText, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
                        Text(subtitle, color = DojoSubtext, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun BeltsTabContent() {
    val belts = listOf(
        Triple("White Belt (10th & 9th Kyu)", "Minimum: 3 Months", "Fundamental stances (Zenkutsu, Kokutsu), blocks (Gedan Barai, Age Uke), basic punches (Seiken Tsuki)."),
        Triple("Yellow Belt (8th & 7th Kyu)", "Minimum: 4 Months", "Fukyu Kata I & II, front snap kick (Mae Geri), controlled introductory sparring drills."),
        Triple("Green Belt (6th & 5th Kyu)", "Minimum: 6 Months", "Pinan Shodan & Nidan, side thrust kicks (Yoko Geri), combination strikes and evasions."),
        Triple("Brown Belt (4th to 1st Kyu)", "Minimum: 1 Year", "Naihanchi Shodan, Passai Dai, Matayoshi Bo staff fundamentals, close-range defense."),
        Triple("Black Belt (Shodan & Above)", "Minimum: 2 Years Continuous", "Advanced Okinawan Kata (Kusanku, Chinto), comprehensive Bunkai combat applications, weaponry mastery.")
    )
    LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Karate & Kobudo Belt Promotion Path", color = DojoGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
        }
        items(belts) { (belt, duration, desc) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(12.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(belt, color = DojoRed, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(duration, color = DojoGold, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(desc, color = DojoText, fontSize = 12.sp, lineHeight = 16.sp)
                }
            }
        }
    }
}
