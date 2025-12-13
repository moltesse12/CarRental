// //
// export const getUserProfile = async (req, res) => {
//   try {
//     const role = req.user.role;
//     const recentSearchedCities = req.user.recentSearchedCities;
//     res.json({ success: true, role, recentSearchedCities });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// //
// export const addRecentSearchedCity = async (req, res) => {
//   try {
//     const { recentSearchedCities } = req.body;
//     const user = req.user;

//     if (user.recentSearchedCities.length < 3) {
//       user.recentSearchedCities.push(recentSearchedCities);
//     } else {
//       user.recentSearchedCities.shift();
//       user.recentSearchedCities.push(recentSearchedCities);
//     }
//     await user.save();
//     res.json({ success: true, role: user.role, message: "City added to recent searches" });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

import db from '../config/database.js';
import { adaptUser } from '../utils/dataAdapter.js';

// ============================================================
// GET ALL USERS (admin only)
// ============================================================

export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.image,
        u.role,
        u.created_at,
        u.updated_at,
        -- Stats
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) AS total_bookings,
        (SELECT COUNT(*) FROM agencies WHERE owner_id = u.id) AS owned_agencies
      FROM users u
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND u.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    query += ` ORDER BY u.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Count total
    let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
    const countParams = [];

    if (role) {
      countQuery += ` AND role = $1`;
      countParams.push(role);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });

  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// ============================================================
// GET USER BY ID (ou current user)
// ============================================================

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.image,
        u.role,
        u.created_at,
        u.updated_at,
        -- Recent searches
        (
          SELECT json_agg(
            json_build_object(
              'city', ush.city,
              'searchedAt', ush.searched_at
            ) ORDER BY ush.searched_at DESC
          )
          FROM (
            SELECT DISTINCT ON (city) city, searched_at
            FROM user_search_history
            WHERE user_id = u.id
            ORDER BY city, searched_at DESC
            LIMIT 10
          ) ush
        ) AS recent_searches,
        -- Stats
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) AS total_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE user_id = u.id AND is_paid = TRUE) AS total_spent,
        (SELECT COUNT(*) FROM agencies WHERE owner_id = u.id) AS owned_agencies
      FROM users u
      WHERE u.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Adapter les données pour le frontend
    const user = result.rows[0];
    const adaptedUser = {
      _id: user.id,
      username: user.username,
      email: user.email,
      image: user.image || '',
      role: user.role || 'user',
      recentSearchedCities: user.recent_searches
        ? user.recent_searches.map(s => s.city || s)
        : [],
    };

    res.status(200).json({
      success: true,
      user: adaptedUser,
      role: adaptedUser.role,
      recentSearchedCities: adaptedUser.recentSearchedCities
    });

  } catch (error) {
    console.error('❌ Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// ============================================================
// CREATE USER (appelé par Clerk webhook)
// ============================================================

export const createUser = async (req, res) => {
  try {
    const { id, username, email, image, role = 'user' } = req.body;

    // Validation
    if (!id || !username || !email) {
      return res.status(400).json({
        success: false,
        message: 'ID, username et email sont obligatoires'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur existe déjà'
      });
    }

    // Créer l'utilisateur
    const query = `
      INSERT INTO users (id, username, email, image, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [id, username, email, image, role]);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

// ============================================================
// UPDATE USER
// ============================================================

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Champs autorisés (on ne permet pas de modifier l'id ou l'email via cette route)
    const allowedFields = ['username', 'image', 'role'];

    const setClause = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ valide à mettre à jour'
      });
    }

    params.push(id);

    const query = `
      UPDATE users
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

// ============================================================
// DELETE USER
// ============================================================

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'utilisateur a des bookings actifs
    const bookingsCheck = await db.query(
      `SELECT COUNT(*) FROM bookings
       WHERE user_id = $1 AND status IN ('pending', 'confirmed')`,
      [id]
    );

    const activeBookings = parseInt(bookingsCheck.rows[0].count);

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: l'utilisateur a ${activeBookings} réservation(s) active(s)`
      });
    }

    // Vérifier si l'utilisateur possède des agences
    const agenciesCheck = await db.query(
      'SELECT COUNT(*) FROM agencies WHERE owner_id = $1',
      [id]
    );

    const ownedAgencies = parseInt(agenciesCheck.rows[0].count);

    if (ownedAgencies > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: l'utilisateur possède ${ownedAgencies} agence(s)`
      });
    }

    // Suppression (CASCADE supprimera automatiquement bookings et search history)
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING username',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: `Utilisateur "${result.rows[0].username}" supprimé avec succès`
    });

  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

// ============================================================
// ADD SEARCH HISTORY
// ============================================================

export const addSearchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la ville est obligatoire'
      });
    }

    // Vérifier que l'utilisateur existe
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ajouter la recherche
    await db.query(
      'INSERT INTO user_search_history (user_id, city) VALUES ($1, $2)',
      [userId, city]
    );

    // Limiter l'historique à 20 entrées par user (garder les plus récentes)
    await db.query(
      `DELETE FROM user_search_history
       WHERE id IN (
         SELECT id FROM user_search_history
         WHERE user_id = $1
         ORDER BY searched_at DESC
         OFFSET 20
       )`,
      [userId]
    );

    // Récupérer l'historique récent
    const history = await db.query(
      `SELECT DISTINCT ON (city) city, searched_at
       FROM user_search_history
       WHERE user_id = $1
       ORDER BY city, searched_at DESC
       LIMIT 10`,
      [userId]
    );

    // Adapter pour le frontend
    const recentSearchedCities = history.rows.map(row => row.city);

    res.status(200).json({
      success: true,
      message: 'Recherche ajoutée à l\'historique',
      recentSearches: history.rows,
      recentSearchedCities: recentSearchedCities
    });

  } catch (error) {
    console.error('❌ Error in addSearchHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la recherche',
      error: error.message
    });
  }
};

// ============================================================
// GET RECENT SEARCHES
// ============================================================

export const getRecentSearches = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const query = `
      SELECT DISTINCT ON (city) city, searched_at
      FROM user_search_history
      WHERE user_id = $1
      ORDER BY city, searched_at DESC
      LIMIT $2
    `;

    const result = await db.query(query, [userId, parseInt(limit)]);

    res.status(200).json({
      success: true,
      searches: result.rows
    });

  } catch (error) {
    console.error('❌ Error in getRecentSearches:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

// ============================================================
// CLEAR SEARCH HISTORY
// ============================================================

export const clearSearchHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query(
      'DELETE FROM user_search_history WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Historique de recherche effacé'
    });

  } catch (error) {
    console.error('❌ Error in clearSearchHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'effacement de l\'historique',
      error: error.message
    });
  }
};

// ============================================================
// GET USER STATS (dashboard)
// ============================================================

export const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        (SELECT COUNT(*) FROM bookings WHERE user_id = $1) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status = 'pending') AS pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status = 'confirmed') AS confirmed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status = 'cancelled') AS cancelled_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE user_id = $1 AND is_paid = TRUE) AS total_spent,
        (SELECT COUNT(DISTINCT city) FROM user_search_history WHERE user_id = $1) AS cities_searched
    `;

    const result = await db.query(query, [id]);

    res.status(200).json({
      success: true,
      stats: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addSearchHistory,
  getRecentSearches,
  clearSearchHistory,
  getUserStats
};
