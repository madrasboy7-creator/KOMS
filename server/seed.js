import bcrypt from 'bcryptjs';
import { db } from './db.js';

export function seedGalleryData(database = db) {
  try {
    const existing = database.prepare("SELECT count(*) as count FROM galleries").get();
    if (existing && existing.count > 0) return;

    console.log('🥋 Seeding KOMS Gallery curated records...');

    const items = [
      {
        id: 'gal-1',
        title: 'State Championship 2026',
        description: 'Our dojo team won the State Championship with pride.',
        category: 'Achievements',
        location: 'Chennai, Tamil Nadu',
        event_date: '14 July 2026',
        cover_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: 'gal-2',
        title: 'Black Belt Promotion',
        description: 'Congratulations to our senior students for their promotion.',
        category: 'Dojo',
        location: 'Okinawan Technical Committee',
        event_date: '10 June 2026',
        cover_image: 'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: 'gal-3',
        title: 'Training Session',
        description: 'Intense training session at MASS DRAGON DOJO.',
        category: 'Training',
        location: 'Chennai, Tamil Nadu',
        event_date: '05 June 2026',
        cover_image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: 'gal-4',
        title: 'Dojo Summer Camp',
        description: 'Fun and disciplined training camp for juniors.',
        category: 'Events',
        location: 'Mudichur',
        event_date: '24 May 2026',
        cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: 'gal-5',
        title: 'Matayoshi Weapons Training Clinic',
        description: 'Traditional Kobudo Bo, Sai, Tonfa & Kama weapons training seminar.',
        category: 'Training',
        location: 'Anna Nagar Traditional Dojo',
        event_date: '12 May 2026',
        cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: 'gal-6',
        title: 'Founders Day & Okinawan Bow',
        description: 'Annual memorial gathering celebrating Matsubayashi Shorin-Ryu karate heritage.',
        category: 'Events',
        location: 'Central Honbu Dojo, Perungalathur',
        event_date: '02 May 2026',
        cover_image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: 'gal-7',
        title: 'Junior Kata & Kihon Showcase',
        description: 'Junior students demonstrating synchronized Fukyugata I & II kata forms.',
        category: 'Achievements',
        location: 'Ranga Nagar Dojo, Mudichur',
        event_date: '18 April 2026',
        cover_image: 'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: 'gal-8',
        title: 'International Master Gasshuku',
        description: 'Intensive training camp with visiting Okinawan karate masters and instructors.',
        category: 'Dojo',
        location: 'Jawaharlal Nehru Stadium',
        event_date: '10 March 2026',
        cover_image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ];

    for (const item of items) {
      database.prepare(`
        INSERT INTO galleries (id, title, description, category, location, event_date, cover_image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'published')
      `).run(item.id, item.title, item.description, item.category, item.location, item.event_date, item.cover_image);

      item.images.forEach((imgUrl, idx) => {
        database.prepare(`
          INSERT INTO gallery_images (id, gallery_id, image_url, image_order, alt_text)
          VALUES (?, ?, ?, ?, ?)
        `).run(`${item.id}-img-${idx + 1}`, item.id, imgUrl, idx + 1, `${item.title} photo ${idx + 1}`);
      });
    }

    console.log('✅ Seeded 8 curated KOMS Gallery entries with high-resolution image galleries.');
  } catch (err) {
    console.error('Gallery seed check error:', err.message);
  }
}

export function seedData(database = db) {
  // 1. Ensure Grand Master account exists in users table
  try {
    const gmCheck = database.prepare("SELECT id FROM users WHERE role = 'grandmaster'").get();
    if (!gmCheck) {
      const passwordHash = bcrypt.hashSync('grandmaster123', 10);
      database.prepare(`
        INSERT INTO users (email, password_hash, name, role, status, member_id, phone)
        VALUES (?, ?, ?, 'grandmaster', 'active', 'KOMS-GM-001', '+91 98400 00001')
      `).run('grandmaster@koms.in', passwordHash, 'Hanshi Grand Master (9th Dan)');
      console.log('🥋 Provisioned Executive Grand Master account: grandmaster@koms.in');
    }
  } catch (err) {
    console.error('Grand Master provision check:', err.message);
  }

  // 2. Ensure Gallery data is present
  seedGalleryData(database);

  // 2. Only seed demo students if SEED_DEMO_DATA=true is explicitly set in environment
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log('🥋 Clean KOMS database initialized (Fresh Registration mode: 0 mock students, 0 fake records).');
    return;
  }

  const studentCheck = database.prepare('SELECT count(*) as count FROM students').get();
  if (studentCheck && studentCheck.count > 0) {
    return;
  }

  console.log('Seeding demo data (SEED_DEMO_DATA=true)...');
  const passwordHash = bcrypt.hashSync('master123', 10);

  // Insert Master
  database.prepare(`
    INSERT OR IGNORE INTO masters (id, name, email, password_hash, dojo_name)
    VALUES (?, ?, ?, ?, ?)
  `).run(1, 'Sensei Rubeshwaren', 'rubeshwaren@koms.dojo', passwordHash, 'Ranga Nagar');
}

export function seedMasterControlData(database = db) {
  // Fresh registration mode starts with clean registration requests
  if (process.env.SEED_DEMO_DATA !== 'true') {
    return;
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData();
}
