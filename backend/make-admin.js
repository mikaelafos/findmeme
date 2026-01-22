const pool = require('./config/db');

async function makeAdmin() {
  try {
    const username = process.argv[2];

    if (!username) {
      console.log('Usage: node make-admin.js <username>');
      process.exit(1);
    }

    const result = await pool.query(
      'UPDATE users SET is_admin = TRUE WHERE username = $1 RETURNING username, is_admin',
      [username]
    );

    if (result.rows.length === 0) {
      console.log(`❌ User "${username}" not found`);
    } else {
      console.log(`✅ ${result.rows[0].username} is now an admin!`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

makeAdmin();
