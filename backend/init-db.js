const pool = require('./config/db');

async function initDatabase() {
  try {
    console.log('🔧 Initializing database...');

    // Create memes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS memes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        media_url TEXT NOT NULL,
        media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'gif', 'video')),
        status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
        user_id INTEGER,
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

    // Create meme_tags junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meme_tags (
        meme_id INTEGER REFERENCES memes(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (meme_id, tag_id)
      );
    `);
    console.log('✅ Created meme_tags table');

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

    // Create favorites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        meme_id INTEGER REFERENCES memes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, meme_id)
      );
    `);
    console.log('✅ Created favorites table');

    // Add foreign key constraint to memes.user_id if not exists
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'memes_user_id_fkey'
        ) THEN
          ALTER TABLE memes ADD CONSTRAINT memes_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Added foreign key constraint');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
      CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at);
      CREATE INDEX IF NOT EXISTS idx_memes_status ON memes(status);
    `);
    console.log('✅ Created indexes');

    console.log('🎉 Database initialization complete!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();
