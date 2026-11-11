import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.js';
import scheduleRoutes from './routes/schedule.js';
import sessionsRoutes from './routes/sessions.js';
import attendanceRoutes from './routes/attendance.js';
import studentsRoutes from './routes/students.js';
import reportsRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import masterRoutes from './routes/master.js';
import feeRoutes from './routes/fees.js';
import announcementRoutes from './routes/announcements.js';
import dojosRoutes from './routes/dojos.js';
import grandmasterRoutes from './routes/grandmaster.js';
import studentPortalRoutes from './routes/studentPortal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'KOMS Dojo Attendance System', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/schedule', scheduleRoutes);
  app.use('/api/sessions', sessionsRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/fees', feeRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/master', masterRoutes);
  app.use('/api/dojos', dojosRoutes);
  app.use('/api/grandmaster', grandmasterRoutes);
  app.use('/api/student', studentPortalRoutes);

  // Serve static assets if client is built
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  });

  return app;
}
