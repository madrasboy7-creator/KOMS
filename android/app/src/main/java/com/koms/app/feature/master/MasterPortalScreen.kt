package com.koms.app.feature.master

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material.icons.automirrored.filled.Logout
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
import com.koms.app.core.model.*
import com.koms.app.core.network.KomsApiClient
import com.koms.app.core.security.SessionManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

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

    val currentUser = sessionManager.getCurrentUser()

    // 11 Core Modules requested for Dojo Master Control Center
    val modules = listOf(
        Triple("dashboard", "Dashboard", Icons.Default.Dashboard),
        Triple("attendance", "Attendance", Icons.Default.FactCheck),
        Triple("fees", "Fees", Icons.Default.Paid),
        Triple("schedule", "Schedule", Icons.Default.CalendarMonth),
        Triple("students", "Students", Icons.Default.People),
        Triple("requests", "Join Requests", Icons.Default.PersonAdd),
        Triple("dojo_profile", "Dojo Profile", Icons.Default.AccountBalance),
        Triple("master_profile", "Master Profile", Icons.Default.Badge),
        Triple("reports", "Reports", Icons.Default.BarChart),
        Triple("notifications", "Alerts", Icons.Default.Notifications),
        Triple("settings", "Settings", Icons.Default.Settings)
    )

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
    var masterName by remember { mutableStateOf(currentUser?.name ?: "Kyoshi M. Mohan") }
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

    Scaffold(
        topBar = {
            Column(modifier = Modifier.background(DojoDarkBg)) {
                TopAppBar(
                    title = {
                        Column {
                            Text(masterName, color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                            Text("Dojo Master Control Center", color = DojoGold, fontSize = 11.sp)
                        }
                    },
                    actions = {
                        // Online / Offline Indicator Pill
                        AssistChip(
                            onClick = { refreshData() },
                            label = {
                                Text(
                                    if (isSyncing) "Syncing..." else if (isOnline) "● Online" else "○ Offline",
                                    color = if (isOnline) DojoGreen else DojoGold,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            },
                            colors = AssistChipDefaults.assistChipColors(containerColor = DojoSurface)
                        )
                        IconButton(onClick = {
                            sessionManager.clearSession()
                            onLogout()
                        }) {
                            Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Logout", tint = DojoRed)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = DojoDarkBg)
                )

                // Horizontal Scrollable Tab Bar for all 11 modules
                val selectedIndex = modules.indexOfFirst { it.first == activeModule }.coerceAtLeast(0)
                ScrollableTabRow(
                    selectedTabIndex = selectedIndex,
                    containerColor = Color(0xFF0F1523),
                    contentColor = DojoRed,
                    edgePadding = 8.dp
                ) {
                    modules.forEach { (key, label, icon) ->
                        val isSelected = activeModule == key
                        Tab(
                            selected = isSelected,
                            onClick = { activeModule = key },
                            text = {
                                Text(
                                    label,
                                    fontSize = 11.5.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            },
                            icon = {
                                if (key == "requests" && pendingRequestsCount > 0) {
                                    BadgedBox(badge = { Badge { Text("$pendingRequestsCount") } }) {
                                        Icon(icon, contentDescription = label, modifier = Modifier.size(17.dp))
                                    }
                                } else {
                                    Icon(icon, contentDescription = label, modifier = Modifier.size(17.dp))
                                }
                            },
                            selectedContentColor = DojoRed,
                            unselectedContentColor = DojoSubtext
                        )
                    }
                }
            }
        },
        containerColor = DojoDarkBg
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (activeModule) {
                "dashboard" -> MasterDashboardView(
                    totalStudents = totalStudents,
                    activeStudents = activeStudentsCount,
                    pendingRequests = pendingRequestsCount,
                    monthlyPct = monthlyAttendancePct,
                    feesCollected = feesCollected,
                    pendingFees = pendingFees,
                    onNavigateToAttendance = { activeModule = "attendance" },
                    onNavigateToRequests = { activeModule = "requests" },
                    onNavigateToStudents = { activeModule = "students" },
                    onNavigateToFees = { activeModule = "fees" },
                    onNavigateToDojoProfile = { activeModule = "dojo_profile" },
                    onNavigateToMasterProfile = { activeModule = "master_profile" }
                )
                "attendance" -> MasterAttendanceView(
                    date = selectedDate,
                    onDateChange = { selectedDate = it },
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
                                refreshData()
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
                                refreshData()
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
                                refreshData()
                            }
                        }
                    },
                    onReject = { reqId ->
                        scope.launch {
                            val res = apiClient.rejectJoinRequest(reqId)
                            if (res.isSuccess) {
                                Toast.makeText(context, "Application rejected", Toast.LENGTH_SHORT).show()
                                refreshData()
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
                                refreshData()
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
                                refreshData()
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
                    onServerUrlChanged = { refreshData() }
                )
            }
        }
    }
}

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
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
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
                    icon = Icons.Default.FactCheck,
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

        // Quick Actions
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Text("Quick Dojo Actions", color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = onNavigateToAttendance,
                    colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Mark Attendance", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = onNavigateToRequests,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E283D)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Join Requests", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(
                    onClick = onNavigateToStudents,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, DojoBorder)
                ) {
                    Text("Manage Students", fontSize = 12.sp, color = DojoText)
                }
                OutlinedButton(
                    onClick = onNavigateToDojoProfile,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, DojoGold)
                ) {
                    Text("Dojo Common UI Sync", fontSize = 11.5.sp, color = DojoGold)
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
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, color = DojoSubtext, fontSize = 11.5.sp)
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(Color(0xFF161F33), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = title, tint = color, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, color = color, fontSize = 21.sp, fontWeight = FontWeight.ExtraBold)
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
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Session Date: $date", color = DojoGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Enrolled Dojo Students: ${students.size}", color = DojoSubtext, fontSize = 11.5.sp)
            }
            Button(
                onClick = onSave,
                colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = "Save", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save & Sync", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (students.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No active students enrolled in this dojo yet.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(students) { student ->
                    val currentStatus = attendanceMap[student.id] ?: "present"
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
                                Column {
                                    Text(student.name, color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                    Text("Member ID: ${student.memberId} • ${student.belt}", color = DojoGold, fontSize = 11.sp)
                                }
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text("${student.attendancePct}%", fontSize = 11.sp, color = DojoGreen) }
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
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
                                        contentPadding = PaddingValues(vertical = 4.dp)
                                    ) {
                                        Text(
                                            label,
                                            fontSize = 11.sp,
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
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Fee Management", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text("Dues & payment records", color = DojoSubtext, fontSize = 11.5.sp)
            }
            Button(
                onClick = { showDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Payment", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Record Payment", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("Total Collected", color = DojoSubtext, fontSize = 11.sp)
                    Text("₹${feesCollected.toInt()}", color = DojoGreen, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }
            Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("Pending Dues", color = DojoSubtext, fontSize = 11.sp)
                    Text("₹${pendingFees.toInt()}", color = Color(0xFFFF9800), fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))
        Text("Student Payment Ledger", color = DojoText, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(students) { s ->
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
                        Column {
                            Text(s.name, color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                            Text("ID: ${s.memberId} • Belt: ${s.belt}", color = DojoSubtext, fontSize = 11.sp)
                        }
                        SuggestionChip(
                            onClick = {},
                            label = { Text("Paid: Nov 2026", color = DojoGreen, fontSize = 10.5.sp) }
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
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
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

    Column(modifier = Modifier.fillMaxSize().padding(14.dp)) {
        Text("Weekly Class Schedule", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Text("Recurring class timings synced with student portals", color = DojoSubtext, fontSize = 11.5.sp)
        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(schedules) { (day, time, focus) ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, Color(0xFF1E283D))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(day, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            SuggestionChip(
                                onClick = {},
                                label = { Text(time, color = DojoGold, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(focus, color = DojoSubtext, fontSize = 12.sp)
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

    Column(modifier = Modifier.fillMaxSize().padding(14.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Dojo Student Registry", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text("Total Members: ${students.size}", color = DojoSubtext, fontSize = 11.5.sp)
            }
            Button(
                onClick = { showAddDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = "Add", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("New Student", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by student name or member ID...", color = DojoSubtext, fontSize = 12.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = DojoSubtext) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(filtered) { s ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(s.name, color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text("ID: ${s.memberId} • Belt: ${s.belt}", color = DojoGold, fontSize = 11.5.sp)
                            Text("Phone: ${s.phone.ifBlank { "Not provided" }}", color = DojoSubtext, fontSize = 11.sp)
                        }
                        SuggestionChip(
                            onClick = {},
                            label = { Text("${s.attendancePct}% Attend", color = DojoGreen, fontSize = 11.sp) }
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
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
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
            .padding(14.dp)
    ) {
        Text("Pending Admission Requests", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Text("Prospective karate students requesting to join this dojo", color = DojoSubtext, fontSize = 11.5.sp)

        Spacer(modifier = Modifier.height(14.dp))

        if (requests.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No pending join requests at this time.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(requests) { req ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, Color(0xFF1E283D))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(req.studentName, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text("Pending Review", color = DojoGold, fontSize = 10.5.sp) }
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Email: ${req.email}", color = DojoSubtext, fontSize = 12.sp)
                            Text("Phone: ${req.phone.ifBlank { "Not provided" }}", color = DojoSubtext, fontSize = 12.sp)
                            Text("Requested: ${req.requestedAt.take(10)}", color = DojoSubtext, fontSize = 11.sp)

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { onApprove(req.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Approve & Enroll", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                OutlinedButton(
                                    onClick = { onReject(req.id) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Reject", fontSize = 12.sp, color = DojoRed)
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
            .padding(14.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Master Profile Management", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF141A29)),
            border = BorderStroke(1.dp, DojoGold)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("⚡ Automatic Common UI Synchronization", color = DojoGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    "Any updates saved here will immediately reflect in the public Common UI under the Dojos and Our Masters sections.",
                    color = DojoSubtext,
                    fontSize = 11.5.sp
                )
            }
        }

        OutlinedTextField(
            value = editName,
            onValueChange = { editName = it },
            label = { Text("Sensei / Master Full Name *") },
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
            label = { Text("Dan / Belt Rank (e.g. 5th Dan Black Belt)") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editExp,
            onValueChange = { editExp = it },
            label = { Text("Teaching Experience (e.g. 18 Years)") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editBio,
            onValueChange = { editBio = it },
            label = { Text("Sensei Biography / Background") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Spacer(modifier = Modifier.height(10.dp))

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
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth().height(48.dp)
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
            .padding(14.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Dojo Public Profile Management", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF141A29)),
            border = BorderStroke(1.dp, DojoGold)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("⛩️ Live Common UI Directory Integration", color = DojoGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    "This information represents your Dojo in the organization directory. Changes take effect instantly for all visitors and students.",
                    color = DojoSubtext,
                    fontSize = 11.5.sp
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
            label = { Text("Branch Badge (e.g. Official Honbu Dojo)") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editAddress,
            onValueChange = { editAddress = it },
            label = { Text("Physical Training Center Address") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = editCity,
            onValueChange = { editCity = it },
            label = { Text("City (e.g. Chennai)") },
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

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = {
                onSave(
                    mapOf(
                        "name" to editName.trim(),
                        "badge" to editBadge.trim(),
                        "address" to editAddress.trim(),
                        "city" to editCity.trim(),
                        "training_days" to editSchedule.trim(),
                        "monthly_fee" to (editFee.toIntOrNull() ?: 800)
                    )
                )
            },
            colors = ButtonDefaults.buttonColors(containerColor = DojoRed),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth().height(48.dp)
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
    Column(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Dojo Reports & Analytics", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Text("Summary reports for dojo performance and attendance trends", color = DojoSubtext, fontSize = 11.5.sp)

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Attendance Consistency", color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = { monthlyPct / 100f },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                    color = DojoGreen,
                    trackColor = Color(0xFF1E283D)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text("Average Monthly Attendance: $monthlyPct%", color = DojoGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Financial Performance", color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Total Collections to Date: ₹${feesCollected.toInt()}", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text("Collection Rate: 91.5% on-time settlement", color = DojoSubtext, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun MasterNotificationsView(pendingCount: Int) {
    Column(modifier = Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Dojo Alerts & Notifications", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)

        if (pendingCount > 0) {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg), border = BorderStroke(1.dp, DojoGold)) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("⚠️ $pendingCount Pending Student Admission(s)", color = DojoGold, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                    Text("New applicants are awaiting your review and belt assignment.", color = DojoSubtext, fontSize = 12.sp)
                }
            }
        }

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("🥋 Central Organization Sync", color = DojoText, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                Text("All attendance records and fee entries are backed up to the central database.", color = DojoSubtext, fontSize = 12.sp)
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
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Dojo & Application Settings", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DojoCardBg)) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Backend Server Connection", color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Configure internet API endpoint or local USB bridge:", color = DojoSubtext, fontSize = 11.5.sp)

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
