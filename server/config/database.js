import pkg from 'pg';
const { Pool } = pkg;

// ============================================================
// CONFIGURATION DU POOL DE CONNEXIONS
// ============================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Configuration pour production (Vercel Postgres)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false  // Nécessaire pour Vercel Postgres
  } : false,

  // Paramètres du pool
  max: 20,                    // Nombre max de clients dans le pool
  idleTimeoutMillis: 30000,   // Fermeture des connexions inactives après 30s
  connectionTimeoutMillis: 2000, // Timeout de connexion 2s
});

// ============================================================
// GESTION DES ERREURS DE POOL
// ============================================================

pool.on('error', (err, client) => {
  console.error('❌ Erreur PostgreSQL inattendue:', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('🔗 Nouvelle connexion PostgreSQL établie');
});

// ============================================================
// FONCTION DE TEST DE CONNEXION
// ============================================================

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), current_database(), version()');

    console.log('✅ Connexion PostgreSQL réussie !');
    console.log('📅 Date serveur:', result.rows[0].now);
    console.log('🗄️  Base de données:', result.rows[0].current_database);
    console.log('📦 Version PostgreSQL:', result.rows[0].version.split(',')[0]);

    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error.message);
    return false;
  }
};

// ============================================================
// FONCTION HELPER: QUERY AVEC LOGGING (développement)
// ============================================================

export const query = async (text, params) => {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log en développement uniquement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Query exécutée:', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        rows: result.rowCount,
        duration: `${duration}ms`
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Erreur SQL:', {
      message: error.message,
      query: text.substring(0, 100),
      params
    });
    throw error;
  }
};

// ============================================================
// FONCTION HELPER: TRANSACTION
// ============================================================

export const transaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction rollback:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// FONCTION: FERMETURE PROPRE DU POOL
// ============================================================

export const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Pool PostgreSQL fermé proprement');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture du pool:', error);
  }
};

// ============================================================
// HELPERS UTILES POUR LES CONTRÔLEURS
// ============================================================

/**
 * Convertit un résultat SQL en format camelCase (optionnel)
 * PostgreSQL utilise snake_case, JS utilise camelCase
 */
export const toCamelCase = (row) => {
  if (!row) return null;

  const camelRow = {};
  for (const key in row) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    camelRow[camelKey] = row[key];
  }
  return camelRow;
};

/**
 * Convertit un objet camelCase en snake_case pour insertion SQL
 */
export const toSnakeCase = (obj) => {
  if (!obj) return null;

  const snakeObj = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = obj[key];
  }
  return snakeObj;
};

/**
 * Génère une clause WHERE dynamique pour les filtres
 * @param {Object} filters - Objet de filtres { city: 'Paris', isAvailable: true }
 * @returns {Object} { whereClause: 'WHERE city = $1 AND is_available = $2', values: ['Paris', true] }
 */
export const buildWhereClause = (filters) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      conditions.push(`${snakeKey} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
};

/**
 * Pagination helper
 * @param {Number} page - Numéro de page (1-based)
 * @param {Number} limit - Nombre d'items par page
 * @returns {Object} { offset, limit, limitClause }
 */
export const buildPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    offset,
    limit,
    limitClause: `LIMIT ${limit} OFFSET ${offset}`
  };
};

// ============================================================
// EXPORT PAR DÉFAUT
// ============================================================

export default {
  pool,
  query,
  transaction,
  testConnection,
  closePool,
  toCamelCase,
  toSnakeCase,
  buildWhereClause,
  buildPagination
};
