package com.koms.app.feature.master

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.FactCheck
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.koms.app.R
import com.koms.app.core.database.KomsLocalDb
import com.koms.app.core.design.*
import com.koms.app.core.model.*
import com.koms.app.core.network.KomsApiClient
import com.koms.app.core.security.SessionManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class MasterNavModule(
    val key: String,
    val title: String,
    val icon: ImageVector,
    val category: String = "Management"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MasterPortalScreen(
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val apiClient = remember { KomsApiClient(context) }
    val localDb = remember { KomsLocalDb(context) }
    val sessionManager = remember { SessionManager(context) }
    val scope = rememberCoroutineScope()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)

    val currentUser = sessionManager.getCurrentUser()

    // 11 Core Navigation Modules in Left-Side Vertical Sidebar
    val modules = remember {
        listOf(
            MasterNavModule("dashboard", "Dashboard", Icons.Default.Dashboard, "Core"),
            MasterNavModule("attendance", "Attendance", Icons.AutoMirrored.Filled.FactCheck, "Operations"),
            MasterNavModule("fees", "Fees", Icons.Default.Paid, "Operations"),
            MasterNavModule("schedule", "Schedule", Icons.Default.CalendarMonth, "Operations"),
            MasterNavModule("students", "Students", Icons.Default.People, "Members"),
            MasterNavModule("requests", "Join Requests", Icons.Default.PersonAdd, "Members"),
            MasterNavModule("master_profile", "Master Profile", Icons.Default.Badge, "Directory"),
            MasterNavModule("dojo_profile", "Dojo Profile", Icons.Default.AccountBalance, "Directory"),
            MasterNavModule("reports", "Reports", Icons.Default.BarChart, "Insights"),
            MasterNavModule("notifications", "Notifications", Icons.Default.Notifications, "System"),
            MasterNavModule("settings", "Settings", Icons.Default.Settings, "System")
        )
    }

    var activeModule by remember { mutableStateOf("dashboard") }
    var isOnline by remember { mutableStateOf(true) }
    var isSyncing by remember { mutableStateOf(false) }

    // Dashboard State
    var totalStudents by remember { mutableIntStateOf(0) }
    var activeStudentsCount by remember { mutableIntStateOf(0) }
    var pendingRequestsCount by remember { mutableIntStateOf(0) }
    var monthlyAttendancePct by remember { mutableIntStateOf(92) }
    var feesCollected by remember { mutableDoubleStateOf(14500.0) }
    var pendingFees by remember { mutableDoubleStateOf(3200.0) }

    // Students & Attendance State
    var students by remember { mutableStateOf(localDb.getStudents()) }
    var joinRequests by remember { mutableStateOf<List<JoinRequest>>(emptyList()) }
    var selectedDate by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    val attendanceMap = remember { mutableStateMapOf<String, String>() }

    // Master Profile State
    var masterName by remember { mutableStateOf(currentUser?.name ?: "Sensei Rubeshwaren") }
    var masterPhone by remember { mutableStateOf("+91 96001 03987") }
    var masterBio by remember { mutableStateOf("5th Dan Black Belt • Chief Instructor & Examiner") }
    var masterRank by remember { mutableStateOf("5th Dan Black Belt") }
    var masterExperience by remember { mutableStateOf("18 Years") }

    // Dojo Profile State
    var dojoName by remember { mutableStateOf("MASS DRAGON DOJO — Ranga Nagar Branch") }
    var dojoBadge by remember { mutableStateOf("Official Honbu Dojo") }
    var dojoAddress by remember { mutableStateOf("1/38 2nd Street, Ranga Nagar, Mudichur") }
    var dojoCity by remember { mutableStateOf("Chennai") }
    var dojoSchedule by remember { mutableStateOf("Saturday & Sunday: 06:00 AM – 08:00 AM") }
    var dojoMonthlyFee by remember { mutableStateOf("800") }

    fun refreshData() {
        scope.launch {
            isSyncing = true
            val dashRes = apiClient.getMasterDashboard()
            if (dashRes.isSuccess) {
                isOnline = true
                val map = dashRes.getOrNull() ?: emptyMap()
                totalStudents = (map["totalStudents"] as? Number)?.toInt() ?: students.size
                activeStudentsCount = (map["activeStudents"] as? Number)?.toInt() ?: students.size
                pendingRequestsCount = (map["pendingRequests"] as? Number)?.toInt() ?: 0
                monthlyAttendancePct = (map["monthlyAttendancePct"] as? Number)?.toInt() ?: 92
                feesCollected = (map["feesCollected"] as? Number)?.toDouble() ?: 14500.0
                pendingFees = (map["pendingFees"] as? Number)?.toDouble() ?: 3200.0
            } else {
                isOnline = false
            }

            val stuRes = apiClient.getMasterStudents()
            if (stuRes.isSuccess) {
                val list = stuRes.getOrNull() ?: emptyList()
                students = list
                localDb.saveStudents(list)
                for (s in list) {
                    if (!attendanceMap.containsKey(s.id)) {
                        attendanceMap[s.id] = "present"
                    }
                }
            } else {
                students = localDb.getStudents()
                for (s in students) {
                    if (!attendanceMap.containsKey(s.id)) {
                        attendanceMap[s.id] = "present"
                    }
                }
            }

            val reqRes = apiClient.getJoinRequests()
            if (reqRes.isSuccess) {
                joinRequests = reqRes.getOrNull() ?: emptyList()
                pendingRequestsCount = joinRequests.size
            }

            // Load Master & Dojo Profiles
            val pRes = apiClient.getMasterProfile()
            if (pRes.isSuccess) {
                val p = pRes.getOrNull() ?: emptyMap()
                (p["name"] as? String)?.let { masterName = it }
                (p["phone"] as? String)?.let { masterPhone = it }
                (p["bio"] as? String)?.let { masterBio = it }
                (p["rank"] as? String)?.let { masterRank = it }
                (p["experience"] as? String)?.let { masterExperience = it }
            }

            val dRes = apiClient.getDojoProfile()
            if (dRes.isSuccess) {
                val d = dRes.getOrNull() ?: emptyMap()
                val dojoObj = (d["dojo"] as? Map<*, *>) ?: d
                (dojoObj["name"] as? String)?.let { dojoName = it }
                (dojoObj["badge"] as? String)?.let { dojoBadge = it }
                (dojoObj["address"] as? String)?.let { dojoAddress = it }
                (dojoObj["city"] as? String)?.let { dojoCity = it }
                (dojoObj["monthly_fee"] as? Number)?.let { dojoMonthlyFee = it.toString() }
                (dojoObj["training_days"] as? String)?.let { dojoSchedule = it }
            }

            isSyncing = false
        }
    }

    LaunchedEffect(Unit) {
        refreshData()
    }

    BoxWithConstraints(modifier = Modifier.fillMaxSize().background(DojoDarkBg)) {
        val isWideScreen = maxWidth >= 760.dp

        if (isWideScreen) {
            // Persistent Side-by-Side Layout for Tablet / Desktop / Landscape
            Row(modifier = Modifier.fillMaxSize()) {
                MasterSidebarContent(
                    activeModule = activeModule,
                    modules = modules,
                    onModuleSelect = { activeModule = it },
                    masterName = masterName,
                    isOnline = isOnline,
                    pendingRequestsCount = pendingRequestsCount,
                    onLogout = {
                        sessionManager.clearSession()
                        onLogout()
                    },
                    modifier = Modifier
                        .width(260.dp)
                        .fillMaxHeight()
                )

                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .fillMaxHeight()
                        .background(Color(0xFF1E283D))
                )

                Scaffold(
                    topBar = {
                        MasterHeader(
                            activeModule = activeModule,
                            modules = modules,
                            isOnline = isOnline,
                            isSyncing = isSyncing,
                            pendingRequestsCount = pendingRequestsCount,
                            onMenuClick = null,
                            onRefresh = { refreshData() },
                            onNavigateToNotifications = { activeModule = "notifications" },
                            onNavigateToProfile = { activeModule = "master_profile" }
                        )
                    },
                    containerColor = DojoDarkBg,
                    modifier = Modifier.weight(1f)
                ) { padding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding)
                    ) {
                        MasterContentRouter(
                            activeModule = activeModule,
                            totalStudents = totalStudents,
                            activeStudentsCount = activeStudentsCount,
                            pendingRequestsCount = pendingRequestsCount,
                            monthlyAttendancePct = monthlyAttendancePct,
                            feesCollected = feesCollected,
                            pendingFees = pendingFees,
                            students = students,
                            selectedDate = selectedDate,
                            attendanceMap = attendanceMap,
                            joinRequests = joinRequests,
                            masterName = masterName,
                            masterPhone = masterPhone,
                            masterBio = masterBio,
                            masterRank = masterRank,
                            masterExperience = masterExperience,
                            dojoName = dojoName,
                            dojoBadge = dojoBadge,
                            dojoAddress = dojoAddress,
                            dojoCity = dojoCity,
                            dojoSchedule = dojoSchedule,
                            dojoMonthlyFee = dojoMonthlyFee,
                            isOnline = isOnline,
                            sessionManager = sessionManager,
                            apiClient = apiClient,
                            localDb = localDb,
                            context = context,
                            scope = scope,
                            onNavigate = { activeModule = it },
                            onDateChange = { selectedDate = it },
                            onRefreshData = { refreshData() }
                        )
                    }
                }
            }
        } else {
            // Adaptive Mobile Layout: Modal Drawer + Compact Left Rail + Main Content
            ModalNavigationDrawer(
                drawerState = drawerState,
                drawerContent = {
                    ModalDrawerSheet(
                        drawerContainerColor = Color(0xFF090D18),
                        drawerContentColor = DojoText,
                        modifier = Modifier
                            .width(290.dp)
                            .fillMaxHeight()
                    ) {
                        MasterSidebarContent(
                            activeModule = activeModule,
                            modules = modules,
                            onModuleSelect = { mod ->
                                activeModule = mod
                                scope.launch { drawerState.close() }
                            },
                            masterName = masterName,
                            isOnline = isOnline,
                            pendingRequestsCount = pendingRequestsCount,
                            onLogout = {
                                scope.launch { drawerState.close() }
                                sessionManager.clearSession()
                                onLogout()
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
            ) {
                Scaffold(
                    topBar = {
                        MasterHeader(
                            activeModule = activeModule,
                            modules = modules,
                            isOnline = isOnline,
                            isSyncing = isSyncing,
                            pendingRequestsCount = pendingRequestsCount,
                            onMenuClick = {
                                scope.launch {
                                    if (drawerState.isOpen) drawerState.close() else drawerState.open()
                                }
                            },
                            onRefresh = { refreshData() },
                            onNavigateToNotifications = { activeModule = "notifications" },
                            onNavigateToProfile = { activeModule = "master_profile" }
                        )
                    },
                    containerColor = DojoDarkBg
                ) { padding ->
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding)
                    ) {
                        // Left Compact Vertical Navigation Rail
                        MasterCompactRail(
                            activeModule = activeModule,
                            modules = modules,
                            onModuleSelect = { activeModule = it },
                            onOpenDrawer = { scope.launch { drawerState.open() } },
                            pendingRequestsCount = pendingRequestsCount,
                            onLogout = {
                                sessionManager.clearSession()
                                onLogout()
                            }
                        )

                        // Main Content Area
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(DojoDarkBg)
                        ) {
                            MasterContentRouter(
                                activeModule = activeModule,
                                totalStudents = totalStudents,
                                activeStudentsCount = activeStudentsCount,
                                pendingRequestsCount = pendingRequestsCount,
                                monthlyAttendancePct = monthlyAttendancePct,
                                feesCollected = feesCollected,
                                pendingFees = pendingFees,
                                students = students,
                                selectedDate = selectedDate,
                                attendanceMap = attendanceMap,
                                joinRequests = joinRequests,
                                masterName = masterName,
                                masterPhone = masterPhone,
                                masterBio = masterBio,
                                masterRank = masterRank,
                                masterExperience = masterExperience,
                                dojoName = dojoName,
                                dojoBadge = dojoBadge,
                                dojoAddress = dojoAddress,
                                dojoCity = dojoCity,
                                dojoSchedule = dojoSchedule,
                                dojoMonthlyFee = dojoMonthlyFee,
                                isOnline = isOnline,
                                sessionManager = sessionManager,
                                apiClient = apiClient,
                                localDb = localDb,
                                context = context,
                                scope = scope,
                                onNavigate = { activeModule = it },
                                onDateChange = { selectedDate = it },
                                onRefreshData = { refreshData() }
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Top Application Header (Requirement 6)
 * Includes breadcrumb, page title, online/offline status, refresh, and profile quick action.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MasterHeader(
    activeModule: String,
    modules: List<MasterNavModule>,
    isOnline: Boolean,
    isSyncing: Boolean,
    pendingRequestsCount: Int,
    onMenuClick: (() -> Unit)?,
    onRefresh: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    val currentModule = modules.firstOrNull { it.key == activeModule }
    val title = currentModule?.title ?: "Dashboard"

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF090D18))
            .statusBarsPadding()
            .padding(horizontal = 10.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            if (onMenuClick != null) {
                IconButton(
                    onClick = onMenuClick,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        Icons.Default.Menu,
                        contentDescription = "Expand Sidebar",
                        tint = DojoGold,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
            }

            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Master Panel",
                        color = DojoGold,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = " › ",
                        color = DojoSubtext,
                        fontSize = 11.sp
                    )
                    Text(
                        text = title,
                        color = DojoText,
                        fontSize = 14.5.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Text(
                    text = "Kobudo Renmei Bukenkan",
                    color = DojoSubtext,
                    fontSize = 9.5.sp
                )
            }
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            // Online/Offline Status Pill
            AssistChip(
                onClick = onRefresh,
                label = {
                    Text(
                        if (isSyncing) "Syncing..." else if (isOnline) "● Online" else "○ Offline",
                        color = if (isOnline) DojoGreen else DojoGold,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = AssistChipDefaults.assistChipColors(containerColor = Color(0xFF121927)),
                border = BorderStroke(1.dp, if (isOnline) Color(0xFF163824) else Color(0xFF382D16)),
                modifier = Modifier.height(28.dp)
            )

            // Notifications button with badge
            IconButton(
                onClick = onNavigateToNotifications,
                modifier = Modifier.size(34.dp)
            ) {
                if (pendingRequestsCount > 0) {
                    BadgedBox(badge = { Badge(containerColor = DojoRed) { Text("$pendingRequestsCount", fontSize = 8.sp) } }) {
                        Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = DojoGold, modifier = Modifier.size(19.dp))
                    }
                } else {
                    Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = DojoSubtext, modifier = Modifier.size(19.dp))
                }
            }

            // Profile Button
            IconButton(
                onClick = onNavigateToProfile,
                modifier = Modifier.size(34.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .background(DojoRed, CircleShape)
                        .border(1.dp, DojoGold, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text("SR", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

/**
 * Full Expandable Left-Side Vertical Sidebar (Requirement 2 & 3)
 * Displays KOMS logo, Master Panel branding, User profile summary with initials & online status,
 * all 11 navigation options with active crimson selection, and bottom logout button.
 */
@Composable
fun MasterSidebarContent(
    activeModule: String,
    modules: List<MasterNavModule>,
    onModuleSelect: (String) -> Unit,
    masterName: String,
    isOnline: Boolean,
    pendingRequestsCount: Int,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .background(Color(0xFF090D18))
            .padding(vertical = 12.dp)
    ) {
        // 1. Sidebar Header: KOMS Logo & Master Panel Label
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = R.drawable.koms_logo),
                contentDescription = "KOMS Logo",
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, DojoGold, RoundedCornerShape(8.dp))
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "KOMS",
                    color = DojoText,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "MASTER PANEL",
                    color = DojoGold,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.2.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 2. User Profile Summary (Requirement 3)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF101726)),
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, Color(0xFF1E283D))
        ) {
            Row(
                modifier = Modifier.padding(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(DojoRed, CircleShape)
                        .border(1.5.dp, DojoGold, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = masterName.split(" ").mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString("").ifEmpty { "SR" },
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = masterName,
                        color = DojoText,
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .background(if (isOnline) DojoGreen else DojoGold, CircleShape)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isOnline) "Online • 5th Dan" else "Offline Mode",
                            color = DojoSubtext,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Color(0xFF161F33))
        )
        Spacer(modifier = Modifier.height(8.dp))

        // 3. Navigation Items (11 Core Modules)
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 10.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            modules.forEach { module ->
                val isSelected = activeModule == module.key

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            if (isSelected) {
                                Brush.horizontalGradient(
                                    listOf(Color(0xFF381216), Color(0xFF1E0E14))
                                )
                            } else {
                                Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent))
                            }
                        )
                        .border(
                            1.dp,
                            if (isSelected) DojoRed else Color.Transparent,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable { onModuleSelect(module.key) }
                        .padding(horizontal = 10.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        // Left active indicator strip
                        Box(
                            modifier = Modifier
                                .width(3.dp)
                                .height(16.dp)
                                .background(if (isSelected) DojoRed else Color.Transparent, RoundedCornerShape(2.dp))
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = module.icon,
                            contentDescription = module.title,
                            tint = if (isSelected) DojoRed else DojoSubtext,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = module.title,
                            color = if (isSelected) Color.White else DojoSubtext,
                            fontSize = 12.5.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }

                    // Badges for Join Requests
                    if (module.key == "requests" && pendingRequestsCount > 0) {
                        Box(
                            modifier = Modifier
                                .background(DojoRed, RoundedCornerShape(10.dp))
                                .padding(horizontal = 6.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "$pendingRequestsCount",
                                color = Color.White,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // 4. Logout Section at Bottom of Sidebar (Requirement 3)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Color(0xFF161F33))
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp)
                .clip(RoundedCornerShape(8.dp))
                .clickable { onLogout() }
                .padding(horizontal = 10.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Logout,
                contentDescription = "Logout",
                tint = DojoRed,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "End Session (Logout)",
                color = DojoRed,
                fontSize = 12.5.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

/**
 * Compact Left Vertical Navigation Rail for Mobile Android (Requirement 4)
 * Allows instant 1-tap switching between modules or tapping the top expander to slide out the full drawer.
 */
@Composable
fun MasterCompactRail(
    activeModule: String,
    modules: List<MasterNavModule>,
    onModuleSelect: (String) -> Unit,
    onOpenDrawer: () -> Unit,
    pendingRequestsCount: Int,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier
            .width(54.dp)
            .fillMaxHeight()
            .background(Color(0xFF090D18))
            .border(BorderStroke(1.dp, Color(0xFF161F33)))
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.weight(1f).verticalScroll(rememberScrollState())
        ) {
            // Expand Drawer Button at Top of Rail
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF141C2E))
                    .border(1.dp, DojoGold, RoundedCornerShape(8.dp))
                    .clickable { onOpenDrawer() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Expand Full Sidebar",
                    tint = DojoGold,
                    modifier = Modifier.size(19.dp)
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Navigation Item Icons
            modules.forEach { module ->
                val isSelected = activeModule == module.key

                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) DojoRed else Color.Transparent)
                        .border(
                            1.dp,
                            if (isSelected) DojoGold else Color.Transparent,
                            RoundedCornerShape(8.dp)
                        )
                        .clickable { onModuleSelect(module.key) },
                    contentAlignment = Alignment.Center
                ) {
                    if (module.key == "requests" && pendingRequestsCount > 0) {
                        BadgedBox(badge = { Badge(containerColor = DojoGold) { Text("$pendingRequestsCount", fontSize = 7.5.sp, color = Color.Black) } }) {
                            Icon(
                                imageVector = module.icon,
                                contentDescription = module.title,
                                tint = if (isSelected) Color.White else DojoSubtext,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    } else {
                        Icon(
                            imageVector = module.icon,
                            contentDescription = module.title,
                            tint = if (isSelected) Color.White else DojoSubtext,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }

        // Logout Button at Bottom of Rail
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(8.dp))
                .clickable { onLogout() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Logout,
                contentDescription = "Logout",
                tint = DojoRed,
                modifier = Modifier.size(19.dp)
            )
        }
    }
}

/**
 * Main Content Router: Reuses all 11 existing screens and preserves existing functionality (Requirement 5 & 7)
 */
@Composable
fun MasterContentRouter(
    activeModule: String,
    totalStudents: Int,
    activeStudentsCount: Int,
    pendingRequestsCount: Int,
    monthlyAttendancePct: Int,
    feesCollected: Double,
    pendingFees: Double,
    students: List<Student>,
    selectedDate: String,
    attendanceMap: MutableMap<String, String>,
    joinRequests: List<JoinRequest>,
    masterName: String,
    masterPhone: String,
    masterBio: String,
    masterRank: String,
    masterExperience: String,
    dojoName: String,
    dojoBadge: String,
    dojoAddress: String,
    dojoCity: String,
    dojoSchedule: String,
    dojoMonthlyFee: String,
    isOnline: Boolean,
    sessionManager: SessionManager,
    apiClient: KomsApiClient,
    localDb: KomsLocalDb,
    context: android.content.Context,
    scope: kotlinx.coroutines.CoroutineScope,
    onNavigate: (String) -> Unit,
    onDateChange: (String) -> Unit,
    onRefreshData: () -> Unit
) {
    when (activeModule) {
        "dashboard" -> MasterDashboardView(
            totalStudents = totalStudents,
            activeStudents = activeStudentsCount,
            pendingRequests = pendingRequestsCount,
            monthlyPct = monthlyAttendancePct,
            feesCollected = feesCollected,
            pendingFees = pendingFees,
            onNavigateToAttendance = { onNavigate("attendance") },
            onNavigateToRequests = { onNavigate("requests") },
            onNavigateToStudents = { onNavigate("students") },
            onNavigateToFees = { onNavigate("fees") },
            onNavigateToDojoProfile = { onNavigate("dojo_profile") },
            onNavigateToMasterProfile = { onNavigate("master_profile") }
        )
        "attendance" -> MasterAttendanceView(
            date = selectedDate,
            onDateChange = onDateChange,
            students = students,
            attendanceMap = attendanceMap,
            onSave = {
                scope.launch {
                    val records = students.map { s ->
                        mapOf(
                            "student_id" to s.id,
                            "status" to (attendanceMap[s.id] ?: "present"),
                            "notes" to "Marked from KOMS Native Android"
                        )
                    }
                    if (isOnline) {
                        val res = apiClient.saveAttendance(selectedDate, records)
                        if (res.isSuccess) {
                            Toast.makeText(context, "Attendance synchronized to KOMS server!", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "Failed: ${res.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        val op = PendingSync(
                            id = UUID.randomUUID().toString(),
                            actionType = "MARK_ATTENDANCE",
                            endpoint = "/api/master/attendance",
                            payloadJson = ""
                        )
                        localDb.queuePendingSync(op)
                        Toast.makeText(context, "Stored locally! Will auto-sync when online.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        )
        "fees" -> MasterFeeManagementView(
            feesCollected = feesCollected,
            pendingFees = pendingFees,
            students = students,
            onRecordPayment = { studentId, amount, month ->
                scope.launch {
                    val res = apiClient.recordFeePayment(studentId, amount, month)
                    if (res.isSuccess) {
                        Toast.makeText(context, "Payment recorded successfully!", Toast.LENGTH_SHORT).show()
                        onRefreshData()
                    } else {
                        Toast.makeText(context, "Failed: ${res.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
        "schedule" -> MasterScheduleView()
        "students" -> MasterStudentsView(
            students = students,
            onRegisterStudent = { data ->
                scope.launch {
                    val res = apiClient.registerStudentDirect(data)
                    if (res.isSuccess) {
                        Toast.makeText(context, "Student registered successfully!", Toast.LENGTH_SHORT).show()
                        onRefreshData()
                    } else {
                        Toast.makeText(context, "Registration failed: ${res.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
        "requests" -> MasterRequestsView(
            requests = joinRequests,
            onApprove = { reqId ->
                scope.launch {
                    val res = apiClient.approveJoinRequest(reqId)
                    if (res.isSuccess) {
                        Toast.makeText(context, "Student approved and registered!", Toast.LENGTH_SHORT).show()
                        onRefreshData()
                    }
                }
            },
            onReject = { reqId ->
                scope.launch {
                    val res = apiClient.rejectJoinRequest(reqId)
                    if (res.isSuccess) {
                        Toast.makeText(context, "Application rejected", Toast.LENGTH_SHORT).show()
                        onRefreshData()
                    }
                }
            }
        )
        "master_profile" -> MasterProfileEditView(
            name = masterName,
            phone = masterPhone,
            bio = masterBio,
            rank = masterRank,
            experience = masterExperience,
            onSave = { updatedMap ->
                scope.launch {
                    val res = apiClient.updateMasterProfile(updatedMap)
                    if (res.isSuccess) {
                        Toast.makeText(context, "Master Profile saved! Synced live to Common UI Dojos.", Toast.LENGTH_LONG).show()
                        onRefreshData()
                    } else {
                        Toast.makeText(context, "Update failed: ${res.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
        "dojo_profile" -> DojoProfileEditView(
            name = dojoName,
            badge = dojoBadge,
            address = dojoAddress,
            city = dojoCity,
            schedule = dojoSchedule,
            monthlyFee = dojoMonthlyFee,
            onSave = { updatedMap ->
                scope.launch {
                    val res = apiClient.updateDojoProfile(updatedMap)
                    if (res.isSuccess) {
                        Toast.makeText(context, "Dojo Profile saved! Synced live to Common UI.", Toast.LENGTH_LONG).show()
                        onRefreshData()
                    } else {
                        Toast.makeText(context, "Update failed: ${res.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        )
        "reports" -> MasterReportsView(
            totalStudents = totalStudents,
            monthlyPct = monthlyAttendancePct,
            feesCollected = feesCollected
        )
        "notifications" -> MasterNotificationsView(pendingCount = pendingRequestsCount)
        "settings" -> MasterSettingsView(
            sessionManager = sessionManager,
            onServerUrlChanged = { onRefreshData() }
        )
    }
}

/**
 * Dashboard View (Requirement 7)
 * Preserves all operational summary statistics and quick actions
 */
@Composable
fun MasterDashboardView(
    totalStudents: Int,
    activeStudents: Int,
    pendingRequests: Int,
    monthlyPct: Int,
    feesCollected: Double,
    pendingFees: Double,
    onNavigateToAttendance: () -> Unit,
    onNavigateToRequests: () -> Unit,
    onNavigateToStudents: () -> Unit,
    onNavigateToFees: () -> Unit,
    onNavigateToDojoProfile: () -> Unit,
    onNavigateToMasterProfile: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Dojo Operational Summary", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text("Performance metrics for active training branch", color = DojoSubtext, fontSize = 11.5.sp)
        }

        // Stats Cards Grid
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(
                    title = "Total Students",
                    value = "$totalStudents",
                    icon = Icons.Default.People,
                    color = DojoText,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Active Members",
                    value = "$activeStudents",
                    icon = Icons.Default.CheckCircle,
                    color = DojoGreen,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(
                    title = "Pending Requests",
                    value = "$pendingRequests",
                    icon = Icons.Default.PersonAdd,
                    color = DojoGold,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Monthly Attendance",
                    value = "$monthlyPct%",
                    icon = Icons.AutoMirrored.Filled.FactCheck,
                    color = DojoGreen,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(
                    title = "Fees Collected",
                    value = "₹${feesCollected.toInt()}",
                    icon = Icons.Default.Paid,
                    color = DojoGreen,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Pending Dues",
                    value = "₹${pendingFees.toInt()}",
                    icon = Icons.Default.Warning,
                    color = Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Quick Actions (Requirement 7)
        item {
            Spacer(modifier = Modifier.height(2.dp))
            Text("Quick Dojo Actions", color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onNavigateToAttendance,
                    colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Attendance", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = onNavigateToRequests,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E283D)),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Join Requests", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = onNavigateToStudents,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, DojoBorder)
                ) {
                    Text("Manage Students", fontSize = 11.sp, color = DojoText)
                }
                OutlinedButton(
                    onClick = onNavigateToDojoProfile,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, DojoGold)
                ) {
                    Text("Dojo Common UI Sync", fontSize = 10.5.sp, color = DojoGold)
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color = DojoText,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, Color(0xFF182236))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, color = DojoSubtext, fontSize = 11.sp)
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .background(Color(0xFF161F33), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = title, tint = color, modifier = Modifier.size(15.dp))
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(value, color = color, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@Composable
fun MasterAttendanceView(
    date: String,
    onDateChange: (String) -> Unit,
    students: List<Student>,
    attendanceMap: MutableMap<String, String>,
    onSave: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Session Date: $date", color = DojoGold, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                Text("Enrolled Dojo Students: ${students.size}", color = DojoSubtext, fontSize = 11.sp)
            }
            Button(
                onClick = onSave,
                colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = "Save", modifier = Modifier.size(15.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.5.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (students.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No active students enrolled in this dojo yet.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(students) { student ->
                    val currentStatus = attendanceMap[student.id] ?: "present"
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, Color(0xFF1E283D))
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(student.name, color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                                    Text("ID: ${student.memberId} • ${student.belt}", color = DojoGold, fontSize = 10.5.sp)
                                }
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text("${student.attendancePct}%", fontSize = 10.5.sp, color = DojoGreen) }
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                val options = listOf("present" to "Present", "absent" to "Absent", "late" to "Late")
                                options.forEach { (statusVal, label) ->
                                    val isSelected = currentStatus == statusVal
                                    val btnColor = when (statusVal) {
                                        "present" -> if (isSelected) DojoGreen else Color(0xFF0F1E17)
                                        "absent" -> if (isSelected) DojoRed else Color(0xFF261214)
                                        else -> if (isSelected) DojoGold else Color(0xFF241E12)
                                    }
                                    Button(
                                        onClick = { attendanceMap[student.id] = statusVal },
                                        modifier = Modifier.weight(1f),
                                        colors = ButtonDefaults.buttonColors(containerColor = btnColor),
                                        shape = RoundedCornerShape(6.dp),
                                        contentPadding = PaddingValues(vertical = 2.dp)
                                    ) {
                                        Text(
                                            label,
                                            fontSize = 10.5.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                            color = if (isSelected) Color.White else DojoSubtext
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

@Composable
fun MasterFeeManagementView(
    feesCollected: Double,
    pendingFees: Double,
    students: List<Student>,
    onRecordPayment: (studentId: String, amount: Double, month: String) -> Unit
) {
    var showDialog by remember { mutableStateOf(false) }
    var selectedStudentId by remember { mutableStateOf(students.firstOrNull()?.id ?: "") }
    var amountInput by remember { mutableStateOf("800") }
    var monthInput by remember { mutableStateOf("November 2026") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Fee Management", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
                Text("Dues & payment records", color = DojoSubtext, fontSize = 11.sp)
            }
            Button(
                onClick = { showDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Payment", modifier = Modifier.size(15.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Record", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("Collected", color = DojoSubtext, fontSize = 10.5.sp)
                    Text("₹${feesCollected.toInt()}", color = DojoGreen, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
            Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("Pending Dues", color = DojoSubtext, fontSize = 10.5.sp)
                    Text("₹${pendingFees.toInt()}", color = Color(0xFFFF9800), fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Text("Student Payment Ledger", color = DojoText, fontSize = 12.5.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(6.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(students) { s ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(s.name, color = DojoText, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            Text("ID: ${s.memberId} • Belt: ${s.belt}", color = DojoSubtext, fontSize = 10.5.sp)
                        }
                        SuggestionChip(
                            onClick = {},
                            label = { Text("Paid: Nov 2026", color = DojoGreen, fontSize = 10.sp) }
                        )
                    }
                }
            }
        }

        if (showDialog) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("Record Student Fee", color = DojoText) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Select Student:", color = DojoSubtext, fontSize = 12.sp)
                        OutlinedTextField(
                            value = amountInput,
                            onValueChange = { amountInput = it },
                            label = { Text("Fee Amount (₹)", color = DojoSubtext) },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = monthInput,
                            onValueChange = { monthInput = it },
                            label = { Text("Billing Month", color = DojoSubtext) },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val amt = amountInput.toDoubleOrNull() ?: 800.0
                            val targetId = selectedStudentId.ifBlank { students.firstOrNull()?.id ?: "" }
                            if (targetId.isNotBlank()) {
                                onRecordPayment(targetId, amt, monthInput)
                            }
                            showDialog = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = DojoGreen)
                    ) {
                        Text("Save Payment")
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { showDialog = false }) { Text("Cancel") }
                },
                containerColor = DojoSurface
            )
        }
    }
}

@Composable
fun MasterScheduleView() {
    val schedules = listOf(
        Triple("Saturday", "06:00 AM – 08:00 AM", "Kihon & Traditional Katas (All Belts)"),
        Triple("Saturday", "05:00 PM – 07:00 PM", "Bukenkan Kobudo Weapons (Bo / Sai / Nunchaku)"),
        Triple("Sunday", "06:00 AM – 08:00 AM", "Kumite & Free Sparring Drills"),
        Triple("Sunday", "05:00 PM – 07:00 PM", "Senior Belt Dan Preparation & Conditioning")
    )

    Column(modifier = Modifier.fillMaxSize().padding(12.dp)) {
        Text("Weekly Class Schedule", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
        Text("Recurring class timings synced with student portals", color = DojoSubtext, fontSize = 11.sp)
        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(schedules) { (day, time, focus) ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, Color(0xFF1E283D))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(day, color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            SuggestionChip(
                                onClick = {},
                                label = { Text(time, color = DojoGold, fontSize = 10.5.sp, fontWeight = FontWeight.Bold) }
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(focus, color = DojoSubtext, fontSize = 11.5.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun MasterStudentsView(
    students: List<Student>,
    onRegisterStudent: (Map<String, Any>) -> Unit
) {
    var showAddDialog by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var belt by remember { mutableStateOf("White Belt") }
    var guardian by remember { mutableStateOf("") }
    var searchQuery by remember { mutableStateOf("") }

    val filtered = students.filter {
        it.name.contains(searchQuery, ignoreCase = true) || it.memberId.contains(searchQuery, ignoreCase = true)
    }

    Column(modifier = Modifier.fillMaxSize().padding(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Dojo Student Registry", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
                Text("Total Members: ${students.size}", color = DojoSubtext, fontSize = 11.sp)
            }
            Button(
                onClick = { showAddDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = "Add", modifier = Modifier.size(15.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("New Student", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search student name or ID...", color = DojoSubtext, fontSize = 11.5.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = DojoSubtext) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(filtered) { s ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(s.name, color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                            Text("ID: ${s.memberId} • Belt: ${s.belt}", color = DojoGold, fontSize = 11.sp)
                            Text("Phone: ${s.phone.ifBlank { "Not provided" }}", color = DojoSubtext, fontSize = 10.5.sp)
                        }
                        SuggestionChip(
                            onClick = {},
                            label = { Text("${s.attendancePct}% Attend", color = DojoGreen, fontSize = 10.5.sp) }
                        )
                    }
                }
            }
        }

        if (showAddDialog) {
            AlertDialog(
                onDismissRequest = { showAddDialog = false },
                title = { Text("Register New Dojo Student", color = DojoText) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Student Full Name *") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email Address *") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone Number") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = belt, onValueChange = { belt = it }, label = { Text("Current Belt Rank") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = guardian, onValueChange = { guardian = it }, label = { Text("Guardian / Parent Name") }, modifier = Modifier.fillMaxWidth())
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (name.isNotBlank() && email.isNotBlank()) {
                                onRegisterStudent(
                                    mapOf(
                                        "name" to name.trim(),
                                        "email" to email.trim(),
                                        "phone" to phone.trim(),
                                        "belt" to belt.trim(),
                                        "guardian" to guardian.trim()
                                    )
                                )
                                showAddDialog = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = DojoRed)
                    ) {
                        Text("Register Student")
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { showAddDialog = false }) { Text("Cancel") }
                },
                containerColor = DojoSurface
            )
        }
    }
}

@Composable
fun MasterRequestsView(
    requests: List<JoinRequest>,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        Text("Pending Admission Requests", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
        Text("Prospective karate students requesting to join this dojo", color = DojoSubtext, fontSize = 11.sp)

        Spacer(modifier = Modifier.height(12.dp))

        if (requests.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No pending join requests at this time.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(requests) { req ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, Color(0xFF1E283D))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(req.studentName, color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text("Pending Review", color = DojoGold, fontSize = 10.sp) }
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text("Email: ${req.email}", color = DojoSubtext, fontSize = 11.sp)
                            Text("Phone: ${req.phone.ifBlank { "Not provided" }}", color = DojoSubtext, fontSize = 11.sp)
                            Text("Requested: ${req.requestedAt.take(10)}", color = DojoSubtext, fontSize = 10.5.sp)

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { onApprove(req.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Approve", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                                }
                                OutlinedButton(
                                    onClick = { onReject(req.id) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Reject", fontSize = 11.5.sp, color = DojoRed)
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
fun MasterProfileEditView(
    name: String,
    phone: String,
    bio: String,
    rank: String,
    experience: String,
    onSave: (Map<String, Any>) -> Unit
) {
    var editName by remember { mutableStateOf(name) }
    var editPhone by remember { mutableStateOf(phone) }
    var editBio by remember { mutableStateOf(bio) }
    var editRank by remember { mutableStateOf(rank) }
    var editExp by remember { mutableStateOf(experience) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Master Profile Management", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF141A29)),
            border = BorderStroke(1.dp, DojoGold)
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Text("⚡ Automatic Common UI Synchronization", color = DojoGold, fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    "Any updates saved here will immediately reflect in the public Common UI under the Dojos and Our Masters sections.",
                    color = DojoSubtext,
                    fontSize = 11.sp
                )
            }
        }

        OutlinedTextField(
            value = editName,
            onValueChange = { editName = it },
            label = { Text("Sensei Full Name *") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editPhone,
            onValueChange = { editPhone = it },
            label = { Text("Public Contact Phone") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editRank,
            onValueChange = { editRank = it },
            label = { Text("Dan / Belt Rank") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editExp,
            onValueChange = { editExp = it },
            label = { Text("Teaching Experience") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editBio,
            onValueChange = { editBio = it },
            label = { Text("Sensei Biography / Background") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = {
                onSave(
                    mapOf(
                        "name" to editName.trim(),
                        "phone" to editPhone.trim(),
                        "bio" to editBio.trim(),
                        "rank" to editRank.trim(),
                        "experience" to editExp.trim()
                    )
                )
            },
            colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().height(46.dp)
        ) {
            Text("Save & Sync to Common UI", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun DojoProfileEditView(
    name: String,
    badge: String,
    address: String,
    city: String,
    schedule: String,
    monthlyFee: String,
    onSave: (Map<String, Any>) -> Unit
) {
    var editName by remember { mutableStateOf(name) }
    var editBadge by remember { mutableStateOf(badge) }
    var editAddress by remember { mutableStateOf(address) }
    var editCity by remember { mutableStateOf(city) }
    var editSchedule by remember { mutableStateOf(schedule) }
    var editFee by remember { mutableStateOf(monthlyFee) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Dojo Public Profile Management", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF141A29)),
            border = BorderStroke(1.dp, DojoGold)
        ) {
            Column(modifier = Modifier.padding(10.dp)) {
                Text("⛩️ Live Common UI Directory Integration", color = DojoGold, fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    "This information represents your Dojo in the organization directory. Changes take effect instantly for all visitors and students.",
                    color = DojoSubtext,
                    fontSize = 11.sp
                )
            }
        }

        OutlinedTextField(
            value = editName,
            onValueChange = { editName = it },
            label = { Text("Dojo Official Name *") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editBadge,
            onValueChange = { editBadge = it },
            label = { Text("Branch Badge") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editAddress,
            onValueChange = { editAddress = it },
            label = { Text("Training Center Address") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editCity,
            onValueChange = { editCity = it },
            label = { Text("City") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editSchedule,
            onValueChange = { editSchedule = it },
            label = { Text("Training Days & Timings") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editFee,
            onValueChange = { editFee = it },
            label = { Text("Monthly Training Fee (₹)") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = {
                onSave(
                    mapOf(
                        "name" to editName.trim(),
                        "badge" to editBadge.trim(),
                        "address" to editAddress.trim(),
                        "city" to editCity.trim(),
                        "training_days" to editSchedule.trim(),
                        "monthly_fee" to (editFee.toDoubleOrNull()?.toInt() ?: 800)
                    )
                )
            },
            colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth().height(46.dp)
        ) {
            Text("Update Dojo & Sync to Common UI", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun MasterReportsView(
    totalStudents: Int,
    monthlyPct: Int,
    feesCollected: Double
) {
    Column(modifier = Modifier.fillMaxSize().padding(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Dojo Reports & Analytics", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
        Text("Summary reports for dojo performance and attendance trends", color = DojoSubtext, fontSize = 11.sp)

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("Attendance Consistency", color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = { monthlyPct / 100f },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                    color = DojoGreen,
                    trackColor = Color(0xFF1E283D)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text("Average Monthly Attendance: $monthlyPct%", color = DojoGreen, fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
            }
        }

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("Financial Performance", color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Total Collections to Date: ₹${feesCollected.toInt()}", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)
                Text("Collection Rate: 91.5% on-time settlement", color = DojoSubtext, fontSize = 11.5.sp)
            }
        }
    }
}

@Composable
fun MasterNotificationsView(pendingCount: Int) {
    Column(modifier = Modifier.fillMaxSize().padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Dojo Alerts & Notifications", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)

        if (pendingCount > 0) {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg), border = BorderStroke(1.dp, DojoGold)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("⚠️ $pendingCount Pending Student Admission(s)", color = DojoGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("New applicants are awaiting your review and belt assignment.", color = DojoSubtext, fontSize = 11.5.sp)
                }
            }
        }

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("🥋 Central Organization Sync", color = DojoText, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text("All attendance records and fee entries are backed up to the central database.", color = DojoSubtext, fontSize = 11.5.sp)
            }
        }
    }
}

@Composable
fun MasterSettingsView(
    sessionManager: SessionManager,
    onServerUrlChanged: () -> Unit
) {
    var url by remember { mutableStateOf(sessionManager.getServerUrl()) }
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Dojo & Application Settings", color = DojoGold, fontSize = 14.5.sp, fontWeight = FontWeight.Bold)

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Backend Server Connection", color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                Text("Configure internet API endpoint or local USB bridge:", color = DojoSubtext, fontSize = 11.sp)

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Server API URL") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            sessionManager.setServerUrl(url)
                            Toast.makeText(context, "Server URL updated!", Toast.LENGTH_SHORT).show()
                            onServerUrlChanged()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Save URL")
                    }
                    OutlinedButton(
                        onClick = {
                            url = SessionManager.DEFAULT_USB_URL
                            sessionManager.setServerUrl(url)
                            Toast.makeText(context, "Switched to USB Localhost:5000", Toast.LENGTH_SHORT).show()
                            onServerUrlChanged()
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("USB Local")
                    }
                }
            }
        }
    }
}
