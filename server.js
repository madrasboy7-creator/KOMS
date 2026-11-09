import { createApp } from './server/app.js';
import { seedData, seedMasterControlData } from './server/seed.js';

// Auto-seed if running fresh
try {
  seedData();
  seedMasterControlData();
} catch (e) {
  console.error('Seed check warning:', e.message);
}

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🥋 KOMS Dojo Master Backend running at http://localhost:${PORT}`);
  console.log(`🥋 API Health Check: http://localhost:${PORT}/api/health`);
});
