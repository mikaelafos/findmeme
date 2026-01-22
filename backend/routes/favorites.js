const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*,
             array_agg(DISTINCT t.name) as tags
      FROM memes m
      INNER JOIN favorites f ON m.id = f.meme_id
      LEFT JOIN meme_tags mt ON m.id = mt.meme_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE f.user_id = $1
      GROUP BY m.id
      ORDER BY f.created_at DESC
    `, [req.userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Check if meme is favorited
router.get('/check/:memeId', authenticateToken, async (req, res) => {
  try {
    const { memeId } = req.params;

    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND meme_id = $2',
      [req.userId, memeId]
    );

    res.json({ isFavorited: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

// Add favorite
router.post('/:memeId', authenticateToken, async (req, res) => {
  try {
    const { memeId } = req.params;

    await pool.query(
      'INSERT INTO favorites (user_id, meme_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.userId, memeId]
    );

    res.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove favorite
router.delete('/:memeId', authenticateToken, async (req, res) => {
  try {
    const { memeId } = req.params;

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND meme_id = $2',
      [req.userId, memeId]
    );

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;
