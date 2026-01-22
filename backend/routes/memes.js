const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure multer for memory storage (files stored in RAM temporarily)
const upload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// GET all memes (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query;

    let query = `
      SELECT m.*,
             array_agg(DISTINCT t.name) as tags
      FROM memes m
      LEFT JOIN meme_tags mt ON m.id = mt.meme_id
      LEFT JOIN tags t ON mt.tag_id = t.id
    `;

    const conditions = [];
    const values = [];

    // Always filter for approved memes only (non-admins can only see approved)
    conditions.push(`m.status = 'approved'`);

    // Add search filter
    if (search) {
      conditions.push(`(m.title ILIKE $${values.length + 1} OR EXISTS (
        SELECT 1 FROM meme_tags mt2
        JOIN tags t2 ON mt2.tag_id = t2.id
        WHERE mt2.meme_id = m.id AND t2.name ILIKE $${values.length + 1}
      ))`);
      values.push(`%${search}%`);
    }

    // Add type filter
    if (type) {
      conditions.push(`m.media_type = $${values.length + 1}`);
      values.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY m.id ORDER BY m.created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

// GET single meme by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT m.*,
             array_agg(DISTINCT t.name) as tags
      FROM memes m
      LEFT JOIN meme_tags mt ON m.id = mt.meme_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE m.id = $1
      GROUP BY m.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).json({ error: 'Failed to fetch meme' });
  }
});

// POST new meme - submissions go to pending for approval
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, media_type, tags, user_id } = req.body;

    let media_url = 'https://via.placeholder.com/400';

    // Upload file to Cloudinary if provided
    if (req.file) {
      // Convert buffer to base64 for Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'findmeme',
        resource_type: 'auto' // Automatically detect image/video
      });

      media_url = uploadResult.secure_url;
    }

    // Insert meme with 'pending' status for user submissions
    const memeResult = await pool.query(
      'INSERT INTO memes (title, media_url, media_type, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, media_url, media_type, 'pending', user_id || null]
    );

    const meme = memeResult.rows[0];

    // Insert tags
    if (tags && tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

      for (const tagName of tagArray) {
        // Insert tag if it doesn't exist
        const tagResult = await pool.query(
          'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
          [tagName.toLowerCase()]
        );

        const tagId = tagResult.rows[0].id;

        // Link meme and tag
        await pool.query(
          'INSERT INTO meme_tags (meme_id, tag_id) VALUES ($1, $2)',
          [meme.id, tagId]
        );
      }
    }

    res.status(201).json(meme);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

// DELETE meme (admin only - we'll add auth later)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete meme (cascade will handle meme_tags)
    const result = await pool.query('DELETE FROM memes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    res.json({ message: 'Meme deleted successfully' });
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ error: 'Failed to delete meme' });
  }
});

module.exports = router;
