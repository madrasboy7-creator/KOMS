package com.koms.app.feature.common

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DojoDarkBg)
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
                            .size(38.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .border(1.5.dp, DojoGold, RoundedCornerShape(8.dp))
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "KOMS",
                            color = DojoText,
                            fontSize = 17.sp,
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
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text("Login", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0A0D17),
                tonalElevation = 8.dp,
                modifier = Modifier.navigationBarsPadding()
            ) {
                NavigationBarItem(
                    selected = activeTab == "home",
                    onClick = { activeTab = "home" },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home", fontSize = 10.sp, fontWeight = if (activeTab == "home") FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DojoRed,
                        selectedTextColor = DojoRed,
                        unselectedIconColor = DojoSubtext,
                        unselectedTextColor = DojoSubtext,
                        indicatorColor = Color.Transparent
                    )
                )
                NavigationBarItem(
                    selected = activeTab == "dojos",
                    onClick = { activeTab = "dojos" },
                    icon = { Icon(Icons.Default.Place, contentDescription = "Dojo") },
                    label = { Text("Dojo", fontSize = 10.sp, fontWeight = if (activeTab == "dojos") FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DojoRed,
                        selectedTextColor = DojoRed,
                        unselectedIconColor = DojoSubtext,
                        unselectedTextColor = DojoSubtext,
                        indicatorColor = Color.Transparent
                    )
                )
                NavigationBarItem(
                    selected = activeTab == "events",
                    onClick = { activeTab = "events" },
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Events") },
                    label = { Text("Events", fontSize = 10.sp, fontWeight = if (activeTab == "events") FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DojoRed,
                        selectedTextColor = DojoRed,
                        unselectedIconColor = DojoSubtext,
                        unselectedTextColor = DojoSubtext,
                        indicatorColor = Color.Transparent
                    )
                )
                NavigationBarItem(
                    selected = activeTab == "gallery",
                    onClick = { activeTab = "gallery" },
                    icon = { Icon(Icons.Default.Image, contentDescription = "Gallery") },
                    label = { Text("Gallery", fontSize = 10.sp, fontWeight = if (activeTab == "gallery") FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DojoRed,
                        selectedTextColor = DojoRed,
                        unselectedIconColor = DojoSubtext,
                        unselectedTextColor = DojoSubtext,
                        indicatorColor = Color.Transparent
                    )
                )
                NavigationBarItem(
                    selected = activeTab == "belts",
                    onClick = { activeTab = "belts" },
                    icon = { Icon(Icons.Default.MilitaryTech, contentDescription = "Training Level") },
                    label = { Text("Training Level", fontSize = 10.sp, fontWeight = if (activeTab == "belts") FontWeight.Bold else FontWeight.Normal) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DojoRed,
                        selectedTextColor = DojoRed,
                        unselectedIconColor = DojoSubtext,
                        unselectedTextColor = DojoSubtext,
                        indicatorColor = Color.Transparent
                    )
                )
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
                    dojos = dojos.filter { it.name.contains(dojoSearch, ignoreCase = true) || it.city.contains(dojoSearch, ignoreCase = true) },
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

    Column(modifier = Modifier.fillMaxSize().padding(14.dp)) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            placeholder = { Text("Search dojo by name or location...", color = DojoSubtext, fontSize = 13.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = DojoSubtext) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = DojoCardBg,
                unfocusedContainerColor = DojoCardBg,
                focusedBorderColor = DojoRed,
                unfocusedBorderColor = Color(0xFF222F4A),
                focusedTextColor = DojoText,
                unfocusedTextColor = DojoText
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Location Filter Pills
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            listOf("All Dojos", "Perungalathur", "Mudichur", "Anna Nagar").forEach { loc ->
                val isSelected = selectedLocationFilter == loc
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedLocationFilter = loc },
                    label = { Text(loc, fontSize = 10.5.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = DojoRed,
                        selectedLabelColor = Color.White,
                        containerColor = DojoSurface,
                        labelColor = DojoSubtext
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Approved Karate & Kobudo Dojos (${dojos.size})",
            color = DojoGold,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(10.dp))

        val filteredList = dojos.filter {
            (selectedLocationFilter == "All Dojos" || it.address.contains(selectedLocationFilter, ignoreCase = true) || it.name.contains(selectedLocationFilter, ignoreCase = true))
        }

        if (filteredList.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No matching dojos found.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(filteredList) { dojo ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                        shape = RoundedCornerShape(14.dp),
                        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(Color(0xFF1E283D), Color(0xFF141926))))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(dojo.name, color = DojoText, fontSize = 15.5.sp, fontWeight = FontWeight.Bold)
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text("₹${dojo.monthlyFee}/mo", color = DojoGreen, fontSize = 11.5.sp, fontWeight = FontWeight.Bold) },
                                    colors = SuggestionChipDefaults.suggestionChipColors(containerColor = Color(0xFF0D2818)),
                                    border = BorderStroke(1.dp, DojoGreen)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Sensei: ${dojo.masterName} (${dojo.masterRank})", color = DojoGold, fontSize = 12.5.sp, fontWeight = FontWeight.Medium)
                            Text("📍 ${dojo.address}, ${dojo.city}", color = DojoSubtext, fontSize = 11.5.sp)
                            Text("🕒 ${dojo.schedule}", color = DojoSubtext, fontSize = 11.5.sp)
                            Text("🥋 Styles: ${dojo.style}", color = DojoSubtext, fontSize = 11.5.sp)

                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { onSelectDetails(dojo) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Details", fontSize = 12.sp, color = DojoText)
                                }
                                Button(
                                    onClick = { onEnroll(dojo) },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Enroll Now", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
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
