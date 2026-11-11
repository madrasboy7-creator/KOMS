package com.koms.app.feature.common

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(DojoRed, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🥋", fontSize = 18.sp)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "KOMS",
                            color = DojoText,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = "KARATE ORGANIZATION SYSTEM",
                            color = DojoGold,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Button(
                    onClick = { onNavigateToLogin("student") },
                    colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
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
                    label = { Text("Home", fontSize = 10.sp) },
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
                    icon = { Icon(Icons.Default.Place, contentDescription = "Dojos") },
                    label = { Text("Dojo", fontSize = 10.sp) },
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
                    label = { Text("Events", fontSize = 10.sp) },
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
                    label = { Text("Gallery", fontSize = 10.sp) },
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
                    icon = { Icon(Icons.Default.MilitaryTech, contentDescription = "Belts") },
                    label = { Text("Belts", fontSize = 10.sp) },
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

            // Dojo Details Dialog
            selectedDojoForDetails?.let { dojo ->
                AlertDialog(
                    onDismissRequest = { selectedDojoForDetails = null },
                    title = { Text(dojo.name, color = DojoText, fontWeight = FontWeight.Bold) },
                    text = {
                        Column {
                            Text("Head Master: ${dojo.masterName} (${dojo.masterRank})", color = DojoGold, fontSize = 13.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("Address: ${dojo.address}, ${dojo.city}", color = DojoText, fontSize = 13.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("Schedule: ${dojo.schedule}", color = DojoSubtext, fontSize = 13.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("Monthly Fee: ₹${dojo.monthlyFee}", color = DojoGreen, fontWeight = FontWeight.Bold, fontSize = 14.sp)
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
                            Text("Enroll Now", color = Color.White)
                        }
                    },
                    dismissButton = {
                        OutlinedButton(onClick = { selectedDojoForDetails = null }) {
                            Text("Close", color = DojoSubtext)
                        }
                    },
                    containerColor = DojoSurface
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
        contentPadding = PaddingValues(top = 8.dp, bottom = 20.dp)
    ) {
        // Hero Section
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF141926)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "EXPLORE",
                        color = DojoRed,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Explore the Karate Tradition",
                        color = DojoText,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Learn about our history, philosophy, masters and the path to black belt.",
                        color = DojoSubtext,
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))

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
                            Text("🎓 Student", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = onRegisterMaster,
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("🥋 Master", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = onLogin,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E2638)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("🔐 Login", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "More than a Martial Art... It's a Way of Life.",
                        color = DojoGold,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Card 1: Our Tradition
        item {
            MartialCardItem(
                icon = Icons.Default.Shield,
                title = "Our Tradition",
                desc = "Discover the rich history, philosophy and values of Karate and Kobudo.",
                actionText = "Learn More →",
                kanji = "空手道",
                onClick = { onCardClick("tradition") }
            )
        }

        // Card 2: Our Masters
        item {
            MartialCardItem(
                icon = Icons.Default.Person,
                title = "Our Masters",
                desc = "Meet our respected instructors and learn from their experience and guidance.",
                actionText = "Learn More →",
                kanji = "師範",
                onClick = { onCardClick("masters") }
            )
        }

        // Card 3: Training Levels
        item {
            MartialCardItem(
                icon = Icons.Default.MilitaryTech,
                title = "Training Levels",
                desc = "From beginner to advanced — find the right path for your growth.",
                actionText = "Learn More →",
                kanji = "段位",
                onClick = { onCardClick("levels") }
            )
        }

        // Card 4: Upcoming Events
        item {
            MartialCardItem(
                icon = Icons.Default.CalendarMonth,
                title = "Upcoming Events",
                desc = "Stay updated with competitions, seminars, camps and special activities.",
                actionText = "View All Events →",
                kanji = "大会",
                onClick = { onCardClick("events") }
            )
        }

        // Card 5: Photo Gallery (TERMINAL CARD - Nothing below this!)
        item {
            MartialCardItem(
                icon = Icons.Default.PhotoLibrary,
                title = "Photo Gallery",
                desc = "Relive our moments — training sessions, events, awards and more.",
                actionText = "View Gallery →",
                kanji = "写真",
                onClick = { onCardClick("gallery") }
            )
        }
    }
}

@Composable
fun MartialCardItem(
    icon: ImageVector,
    title: String,
    desc: String,
    actionText: String,
    kanji: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
        shape = RoundedCornerShape(14.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF1E283D)))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .background(DojoRed, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = title, tint = Color.White, modifier = Modifier.size(18.dp))
                }
                Spacer(modifier = Modifier.height(10.dp))
                Text(title, color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text(desc, color = DojoSubtext, fontSize = 12.5.sp, lineHeight = 17.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text(actionText, color = DojoRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }

            Spacer(modifier = Modifier.width(12.dp))

            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF161E30)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = kanji,
                    color = Color(0x33FFFFFF),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
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

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Approved Karate & Kobudo Dojos (${dojos.size})",
            color = DojoGold,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(10.dp))

        if (dojos.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No dojos found. Connect online to sync directory.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(dojos) { dojo ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(dojo.name, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                Text("₹${dojo.monthlyFee}/mo", color = DojoGreen, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Sensei: ${dojo.masterName} (${dojo.masterRank})", color = DojoGold, fontSize = 12.sp)
                            Text("📍 ${dojo.address}, ${dojo.city}", color = DojoSubtext, fontSize = 11.5.sp)
                            Text("🕒 ${dojo.schedule}", color = DojoSubtext, fontSize = 11.5.sp)

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
                                    Text("Enroll Now", fontSize = 12.sp, color = Color.White)
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
        "South India Shorin-Ryu Championship" to "Jawaharlal Nehru Indoor Stadium, Chennai · July 18-20, 2026",
        "Okinawa Kobudo Master Clinic & Grading" to "Central Honbu Dojo, New Perungalathur · August 5, 2026",
        "State Karate Selection Tournament" to "Anna Nagar Training Centre · September 12, 2026"
    )
    LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Upcoming Tournaments & Seminars", color = DojoGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
        }
        items(events) { (title, subtitle) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(title, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(subtitle, color = DojoSubtext, fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
fun GalleryTabContent() {
    val highlights = listOf(
        "State Championship Gold Medalists" to "2026 Chennai Arena",
        "Senior Dan Black Belt Promotions" to "Okinawan Technical Committee",
        "Matayoshi Weapons Training Clinic" to "Bo, Sai, Nunchaku & Tonfa",
        "Junior Kata & Kihon Showcase" to "Mudichur Branch Dojo"
    )
    LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Activity & Training Gallery", color = DojoGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
        }
        items(highlights) { (title, subtitle) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF1E283D)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("📷", fontSize = 22.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(title, color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
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
        "White Belt (10th & 9th Kyu)" to "Fundamental stances, blocks, basic punches (Seiken Tsuki)",
        "Yellow Belt (8th & 7th Kyu)" to "Fukyu Kata I & II, front kick (Mae Geri), basic sparring",
        "Green Belt (6th & 5th Kyu)" to "Pinan Shodan & Nidan, side kicks, combination strikes",
        "Brown Belt (4th to 1st Kyu)" to "Naihanchi Shodan, Passai Dai, Matayoshi Bo basics",
        "Black Belt (Shodan & Above)" to "Advanced Kata (Kusanku, Chinto), Bunkai applications, Weaponry mastery"
    )
    LazyColumn(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Belt Syllabus & Promotion Path", color = DojoGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
        }
        items(belts) { (belt, desc) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(belt, color = DojoRed, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(desc, color = DojoText, fontSize = 12.sp, lineHeight = 16.sp)
                }
            }
        }
    }
}
