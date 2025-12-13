// Script pour vérifier si les tables PostgreSQL existent
import db from '../config/database.js';

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables PostgreSQL...\n');

    const tables = ['users', 'agencies', 'cars', 'bookings', 'car_images', 'car_features', 'feature_catalog', 'user_search_history'];

    for (const table of tables) {
      try {
        const result = await db.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )`,
          [table]
        );

        const exists = result.rows[0].exists;
        if (exists) {
          console.log(`✅ Table "${table}" existe`);
        } else {
          console.log(`❌ Table "${table}" n'existe PAS`);
        }
      } catch (error) {
        console.log(`❌ Erreur lors de la vérification de "${table}":`, error.message);
      }
    }

    console.log('\n✨ Vérification terminée');
    await db.closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await db.closePool();
    process.exit(1);
  }
}

checkTables();
