const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (!result.rows[0] || !result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all pending memes (admin only)
router.get('/pending-memes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.media_url,
        m.media_type,
        m.status,
        m.created_at,
        u.username as submitted_by,
        ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM memes m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN meme_tags mt ON m.id = mt.meme_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE m.status = 'pending'
      GROUP BY m.id, u.username
      ORDER BY m.created_at ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending memes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve a meme (admin only)
router.post('/approve-meme/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE memes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['approved', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    res.json({ message: 'Meme approved', meme: result.rows[0] });
  } catch (error) {
    console.error('Error approving meme:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject a meme (admin only)
router.post('/reject-meme/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE memes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['rejected', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    res.json({ message: 'Meme rejected', meme: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting meme:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a meme permanently (admin only)
router.delete('/delete-meme/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM memes WHERE id = $1', [id]);

    res.json({ message: 'Meme deleted permanently' });
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(DISTINCT user_id) as total_users
      FROM memes
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Temporary endpoint to list users (for debugging)
// TODO: Remove this after initial setup
router.post('/list-users', async (req, res) => {
  try {
    const { secret } = req.body;

    if (secret !== process.env.BOOTSTRAP_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    const result = await pool.query(
      'SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Temporary endpoint to make a user admin by username or email and optionally reset password
// TODO: Remove this after initial setup
router.post('/bootstrap-admin', async (req, res) => {
  try {
    const { username, email, secret, newPassword } = req.body;

    // Simple secret check - you should set this in your env
    if (secret !== process.env.BOOTSTRAP_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    // Must provide either username or email
    if (!username && !email) {
      return res.status(400).json({ error: 'Must provide username or email' });
    }

    // If newPassword is provided, hash it and update
    if (newPassword) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      let result;
      if (email) {
        result = await pool.query(
          'UPDATE users SET is_admin = TRUE, password_hash = $1 WHERE email = $2 RETURNING id, username, email, is_admin',
          [hashedPassword, email]
        );
      } else {
        result = await pool.query(
          'UPDATE users SET is_admin = TRUE, password_hash = $1 WHERE username = $2 RETURNING id, username, email, is_admin',
          [hashedPassword, username]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User promoted to admin and password reset', user: result.rows[0] });
    } else {
      let result;
      if (email) {
        result = await pool.query(
          'UPDATE users SET is_admin = TRUE WHERE email = $1 RETURNING id, username, email, is_admin',
          [email]
        );
      } else {
        result = await pool.query(
          'UPDATE users SET is_admin = TRUE WHERE username = $1 RETURNING id, username, email, is_admin',
          [username]
        );
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User promoted to admin', user: result.rows[0] });
    }
  } catch (error) {
    console.error('Error bootstrapping admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
