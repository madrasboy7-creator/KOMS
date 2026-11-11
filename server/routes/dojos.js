import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Helper to safely parse JSON or return array
function parseJsonArray(str, fallback = []) {
  if (!str) return fallback;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_) {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
}

// GET /api/dojos/public — Publicly listed approved Dojos for Common UI
router.get('/public', (req, res) => {
  try {
    const dojos = db.prepare(`
      SELECT * FROM dojos 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `).all();

    const formatted = dojos.map(d => ({
      id: d.id,
      name: d.name,
      badge: d.badge || 'Official Branch',
      area: d.area || d.city || 'Chennai',
      city: d.city || 'Chennai',
      state: d.state || 'Tamil Nadu',
      country: d.country || 'India',
      pincode: d.pincode || '',
      address: d.address || `${d.area || ''}, ${d.city || ''}`,
      landmarks: d.landmarks || '',
      headInstructor: d.head_instructor || 'Dojo Sensei',
      instructorRank: d.instructor_rank || 'Black Belt',
      instructorExperience: d.instructor_experience || '10+ Years',
      instructorAvatar: d.instructor_avatar || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300',
      instructorBio: d.instructor_bio || 'Dedicated instructor preserving authentic Okinawan Karate & Kobudo.',
      instructorQualifications: d.instructor_qualifications || 'Certified Instructor',
      instructorAchievements: parseJsonArray(d.instructor_achievements, ['District & State Representative']),
      trainingDays: parseJsonArray(d.training_days, ['Saturday', 'Sunday']),
      timings: [
        { batch: 'Regular Training Session', time: d.class_timings || '06:00 AM – 08:00 AM', days: d.training_days || 'Sat, Sun' }
      ],
      batches: [
        { name: 'Kihon & Katas', ageGroup: 'All Ages', focus: 'Traditional stances, strikes, and Okinawan kata' },
        { name: 'Kumite & Sparring', ageGroup: 'All Ranks', focus: 'Distance control, blocking, counter-strikes' }
      ],
      levelsOffered: parseJsonArray(d.levels_offered, ['White Belt', 'Yellow Belt', 'Green Belt', 'Brown Belt', 'Black Belt']),
      facilities: parseJsonArray(d.facilities, ['Tatami Matting', 'Punch Shields', 'Traditional Makiwara', 'Weapons Rack']),
      entryFee: d.entry_fee || 1000,
      monthlyFee: d.monthly_fee || 800,
      phone: d.phone || '+91 96001 03987',
      email: d.email || 'dojo@koms.in',
      description: d.description || 'Authentic Okinawan Shorin-Ryu Karate & Kobudo training center focusing on traditional etiquette, physical fitness, and practical self-defense.',
      bannerUrl: d.banner_url || 'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
      logoUrl: d.logo_url || '/logo.png',
      gallery: parseJsonArray(d.gallery, [
        'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=800&q=80'
      ]),
      status: d.status,
      isFeatured: true
    }));

    res.json({ dojos: formatted, count: formatted.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public dojos: ' + err.message });
  }
});

// GET /api/dojos/:id — Single Dojo details
router.get('/:id', (req, res) => {
  try {
    const dojo = db.prepare('SELECT * FROM dojos WHERE id = ?').get(req.params.id);
    if (!dojo) {
      return res.status(404).json({ error: 'Dojo not found' });
    }
    res.json({ dojo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dojo: ' + err.message });
  }
});

export default router;
