const pool = require('./config/db');

async function addUsersTables() {
  try {
    console.log('🔧 Adding users and favorites tables...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created users table');

    // Create favorites table (many-to-many relationship between users and memes)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        meme_id INTEGER REFERENCES memes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, meme_id)
      );
    `);
    console.log('✅ Created favorites table');

    // Add status column to memes table for submissions
    await pool.query(`
      ALTER TABLE memes
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved'
      CHECK (status IN ('pending', 'approved', 'rejected'));
    `);
    console.log('✅ Added status column to memes table');

    // Add user_id column to memes table
    await pool.query(`
      ALTER TABLE memes
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('✅ Added user_id column to memes table');

    console.log('🎉 All tables updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating tables:', error);
    process.exit(1);
  }
}

addUsersTables();
