package com.koms.app.core.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.koms.app.core.database.KomsLocalDb
import com.koms.app.core.network.KomsApiClient
import com.koms.app.core.security.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class KomsSyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val localDb = KomsLocalDb(context)
    private val apiClient = KomsApiClient(context)
    private val sessionManager = SessionManager(context)

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // 1. Process pending sync queue
            val pending = localDb.getPendingSyncs()
            for (op in pending) {
                // If action was mark attendance
                if (op.actionType == "MARK_ATTENDANCE") {
                    // Send to server
                    // If successful:
                    localDb.removePendingSync(op.id)
                }
            }

            // 2. Fetch latest public dojos and cache locally
            val dojosRes = apiClient.getPublicDojos()
            if (dojosRes.isSuccess) {
                dojosRes.getOrNull()?.let { localDb.saveDojos(it) }
            }

            // 3. If master is logged in, sync master students
            if (sessionManager.getUserRole() == "master" || sessionManager.getUserRole() == "grandmaster") {
                val studentsRes = apiClient.getMasterStudents()
                if (studentsRes.isSuccess) {
                    studentsRes.getOrNull()?.let { localDb.saveStudents(it) }
                }
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

