const pool = require('./config/db');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');

    // Create memes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS memes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        media_url TEXT NOT NULL,
        media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'gif', 'video')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created memes table');

    // Create tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created tags table');

    // Create meme_tags junction table (many-to-many relationship)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meme_tags (
        meme_id INTEGER REFERENCES memes(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (meme_id, tag_id)
      );
    `);
    console.log('✅ Created meme_tags table');

    // Create index for faster searches
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
      CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at);
    `);
    console.log('✅ Created indexes');

    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
