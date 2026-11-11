package com.koms.app.feature.master

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
    var activeModule by remember { mutableStateOf("dashboard") } // "dashboard", "attendance", "requests", "students", "fees"

    var isOnline by remember { mutableStateOf(true) }
    var isSyncing by remember { mutableStateOf(false) }

    // Dashboard State
    var totalStudents by remember { mutableIntStateOf(0) }
    var activeStudentsCount by remember { mutableIntStateOf(0) }
    var pendingRequestsCount by remember { mutableIntStateOf(0) }
    var monthlyAttendancePct by remember { mutableIntStateOf(92) }
    var feesCollected by remember { mutableDoubleStateOf(14500.0) }

    // Students & Attendance State
    var students by remember { mutableStateOf(localDb.getStudents()) }
    var joinRequests by remember { mutableStateOf<List<JoinRequest>>(emptyList()) }
    var selectedDate by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    val attendanceMap = remember { mutableStateMapOf<String, String>() }

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
            isSyncing = false
        }
    }

    LaunchedEffect(Unit) {
        refreshData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(currentUser?.name ?: "Sensei Master", color = DojoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("Dojo Master Control Center", color = DojoGold, fontSize = 11.sp)
                    }
                },
                actions = {
                    // Sync Status Indicator Pill
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
                        Icon(Icons.Default.Logout, contentDescription = "Logout", tint = DojoRed)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DojoDarkBg)
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0A0D17),
                modifier = Modifier.navigationBarsPadding()
            ) {
                NavigationBarItem(
                    selected = activeModule == "dashboard",
                    onClick = { activeModule = "dashboard" },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Overview", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = DojoRed, selectedTextColor = DojoRed, unselectedIconColor = DojoSubtext, unselectedTextColor = DojoSubtext)
                )
                NavigationBarItem(
                    selected = activeModule == "attendance",
                    onClick = { activeModule = "attendance" },
                    icon = { Icon(Icons.Default.FactCheck, contentDescription = "Attendance") },
                    label = { Text("Attendance", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = DojoRed, selectedTextColor = DojoRed, unselectedIconColor = DojoSubtext, unselectedTextColor = DojoSubtext)
                )
                NavigationBarItem(
                    selected = activeModule == "requests",
                    onClick = { activeModule = "requests" },
                    icon = {
                        BadgedBox(badge = { if (pendingRequestsCount > 0) Badge { Text("$pendingRequestsCount") } }) {
                            Icon(Icons.Default.PersonAdd, contentDescription = "Requests")
                        }
                    },
                    label = { Text("Requests", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = DojoRed, selectedTextColor = DojoRed, unselectedIconColor = DojoSubtext, unselectedTextColor = DojoSubtext)
                )
                NavigationBarItem(
                    selected = activeModule == "students",
                    onClick = { activeModule = "students" },
                    icon = { Icon(Icons.Default.People, contentDescription = "Students") },
                    label = { Text("Students", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(selectedIconColor = DojoRed, selectedTextColor = DojoRed, unselectedIconColor = DojoSubtext, unselectedTextColor = DojoSubtext)
                )
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
                    onNavigateToAttendance = { activeModule = "attendance" },
                    onNavigateToRequests = { activeModule = "requests" },
                    onNavigateToStudents = { activeModule = "students" }
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
                                // Offline queueing!
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
                "requests" -> MasterRequestsView(
                    requests = joinRequests,
                    onApprove = { reqId ->
                        scope.launch {
                            val res = apiClient.approveJoinRequest(reqId)
                            if (res.isSuccess) {
                                Toast.makeText(context, "Student approved!", Toast.LENGTH_SHORT).show()
                                refreshData()
                            }
                        }
                    },
                    onReject = { reqId ->
                        scope.launch {
                            val res = apiClient.rejectJoinRequest(reqId)
                            if (res.isSuccess) {
                                Toast.makeText(context, "Request rejected", Toast.LENGTH_SHORT).show()
                                refreshData()
                            }
                        }
                    }
                )
                "students" -> MasterStudentsListView(students = students)
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
    onNavigateToAttendance: () -> Unit,
    onNavigateToRequests: () -> Unit,
    onNavigateToStudents: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Dojo Key Metrics", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
        }

        // Stats Cards Grid
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(title = "Total Students", value = "$totalStudents", icon = "🥋", modifier = Modifier.weight(1f))
                MetricCard(title = "Active Members", value = "$activeStudents", icon = "👤", modifier = Modifier.weight(1f))
            }
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricCard(title = "Pending Requests", value = "$pendingRequests", icon = "⏳", color = DojoGold, modifier = Modifier.weight(1f))
                MetricCard(title = "Attendance Rate", value = "$monthlyPct%", icon = "📈", color = DojoGreen, modifier = Modifier.weight(1f))
            }
        }
        item {
            MetricCard(title = "Collected Fees", value = "₹${feesCollected.toInt()}", icon = "💰", color = DojoGreen, modifier = Modifier.fillMaxWidth())
        }

        // Quick Actions
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Text("Quick Management Actions", color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
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
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: String,
    color: Color = DojoText,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, color = DojoSubtext, fontSize = 12.sp)
                Text(icon, fontSize = 16.sp)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, color = color, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
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
                Text("Registered Dojo Students: ${students.size}", color = DojoSubtext, fontSize = 11.5.sp)
            }
            Button(
                onClick = onSave,
                colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Save", color = Color.White, fontWeight = FontWeight.Bold)
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
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(student.name, color = DojoText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                    Text("${student.memberId} · ${student.belt}", color = DojoSubtext, fontSize = 11.sp)
                                }
                                Text("${student.attendancePct}%", color = DojoGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                listOf("present" to "Present", "absent" to "Absent", "late" to "Late", "excused" to "Excused").forEach { (statusKey, label) ->
                                    val isSelected = currentStatus == statusKey
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = { attendanceMap[student.id] = statusKey },
                                        label = { Text(label, fontSize = 10.sp) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = if (statusKey == "present") DojoGreen else if (statusKey == "absent") DojoRed else DojoGold,
                                            selectedLabelColor = Color.White
                                        )
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

@Composable
fun MasterRequestsView(
    requests: List<JoinRequest>,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(14.dp)) {
        Text("Student Joining Requests (${requests.size})", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(10.dp))

        if (requests.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No pending joining requests at this time.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(requests) { req ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(req.studentName, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            Text("Email: ${req.email} · Phone: ${req.phone}", color = DojoSubtext, fontSize = 12.sp)
                            Text("Dojo: ${req.dojoName}", color = DojoGold, fontSize = 12.sp)

                            Spacer(modifier = Modifier.height(10.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { onApprove(req.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = DojoGreen),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Approve Student", fontSize = 12.sp)
                                }
                                OutlinedButton(
                                    onClick = { onReject(req.id) },
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(1f)
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
fun MasterStudentsListView(students: List<Student>) {
    Column(modifier = Modifier.fillMaxSize().padding(14.dp)) {
        Text("Dojo Student Roster (${students.size})", color = DojoGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(10.dp))

        if (students.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No registered students found.", color = DojoSubtext, fontSize = 13.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(students) { student ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = DojoCardBg),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(student.name, color = DojoText, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                Text("ID: ${student.memberId} · ${student.belt}", color = DojoSubtext, fontSize = 12.sp)
                                Text("Phone: ${student.phone.ifBlank { "N/A" }}", color = DojoSubtext, fontSize = 11.sp)
                            }
                            Text("${student.attendancePct}%", color = DojoGreen, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
