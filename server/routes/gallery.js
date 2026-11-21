import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Helper to safely parse JSON
function parseJsonArray(str, fallback = []) {
  if (!str) return fallback;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_) {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
}

// GET /api/public/gallery - List published gallery items with category filter and pagination
router.get('/', (req, res) => {
  try {
    const category = req.query.category || 'All';
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(20, parseInt(req.query.limit || '4', 10)));
    const offset = (page - 1) * limit;

    let countQuery = `SELECT COUNT(*) as count FROM galleries WHERE status = 'published'`;
    let query = `SELECT * FROM galleries WHERE status = 'published'`;
    const params = [];
    const countParams = [];

    if (category && category.toLowerCase() !== 'all') {
      countQuery += ` AND LOWER(category) = LOWER(?)`;
      query += ` AND LOWER(category) = LOWER(?)`;
      params.push(category);
      countParams.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const countRow = db.prepare(countQuery).get(...countParams);
    const total = countRow ? (countRow.count || 0) : 0;
    const galleries = db.prepare(query).all(...params);

    // Fetch images for each gallery item
    const formatted = galleries.map(g => {
      const images = db.prepare(`
        SELECT id, gallery_id, image_url, image_order, alt_text 
        FROM gallery_images 
        WHERE gallery_id = ? 
        ORDER BY image_order ASC
      `).all(g.id);

      return {
        id: g.id,
        dojoId: g.dojo_id || null,
        title: g.title,
        description: g.description || '',
        category: g.category || 'Events',
        location: g.location || 'Chennai, Tamil Nadu',
        eventDate: g.event_date || '',
        coverImage: g.cover_image || (images[0] ? images[0].image_url : ''),
        imageCount: images.length > 0 ? images.length : 1,
        images: images.map(img => ({
          id: img.id,
          galleryId: img.gallery_id,
          imageUrl: img.image_url,
          imageOrder: img.image_order,
          altText: img.alt_text || ''
        }))
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      items: formatted,
      total,
      page,
      limit,
      totalPages
    });
  } catch (err) {
    console.error('Error fetching galleries:', err);
    res.status(500).json({ error: 'Failed to fetch gallery entries: ' + err.message });
  }
});

// GET /api/public/gallery/:id - Full details for a single gallery entry
router.get('/:id', (req, res) => {
  try {
    const gallery = db.prepare(`SELECT * FROM galleries WHERE id = ?`).get(req.params.id);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const images = db.prepare(`
      SELECT id, gallery_id, image_url, image_order, alt_text 
      FROM gallery_images 
      WHERE gallery_id = ? 
      ORDER BY image_order ASC
    `).all(gallery.id);

    res.json({
      id: gallery.id,
      dojoId: gallery.dojo_id || null,
      title: gallery.title,
      description: gallery.description || '',
      category: gallery.category || 'Events',
      location: gallery.location || 'Chennai, Tamil Nadu',
      eventDate: gallery.event_date || '',
      coverImage: gallery.cover_image || (images[0] ? images[0].image_url : ''),
      imageCount: images.length,
      images: images.map(img => ({
        id: img.id,
        galleryId: img.gallery_id,
        imageUrl: img.image_url,
        imageOrder: img.image_order,
        altText: img.alt_text || ''
      }))
    });
  } catch (err) {
    console.error('Error fetching gallery detail:', err);
    res.status(500).json({ error: 'Failed to fetch gallery details: ' + err.message });
  }
});

export default router;
