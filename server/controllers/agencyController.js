// import User from "../models/User.js";
// import Agency from "../models/Agency.js";

// // REGISTER A NEW AGENCY FOR THE LOGGED IN USER [POST '/agencies']

// export const agencyReg = async (req, res) => {
//   try {
//     const { name, address, contact, email, city } = req.body;
//     const owner = req.user._id;

//     // Check if user already has an agency registered
//     const agency = await Agency.findOne({ owner });
//     if (agency) {
//       return res.status(400).json({ message: "User already has an agency registered" });
//     }

//     await Agency.create({ name, address, contact, email, owner, city });
//     await User.findByIdAndUpdate(owner, { role: "agencyOwner" });

//     res.status(201).json({ success: true, message: "Agency registered successfully" });
//   } catch (error) {
//     console.error("Error registering agency:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
import db from '../config/database.js';

// ============================================================
// GET ALL AGENCIES
// ============================================================

export const getAllAgencies = async (req, res) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/60a6dc86-e52b-400e-83a3-ecd6c7ac1365',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agencyController.js:32',message:'getAllAgencies entry',data:{query:req.query,hasDb:!!db},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    const { city, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT
        a.id,
        a.name,
        a.contact,
        a.email,
        a.address,
        a.city,
        a.created_at,
        a.updated_at,
        -- Owner info
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email
        ) AS owner,
        -- Stats
        (SELECT COUNT(*) FROM cars WHERE agency_id = a.id) AS total_cars,
        (SELECT COUNT(*) FROM cars WHERE agency_id = a.id AND is_available = TRUE) AS available_cars
      FROM agencies a
      LEFT JOIN users u ON a.owner_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (city) {
      query += ` AND LOWER(a.city) = LOWER($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }

    query += ` ORDER BY a.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/60a6dc86-e52b-400e-83a3-ecd6c7ac1365',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agencyController.js:75',message:'Before db.query',data:{queryLength:query.length,paramsCount:params.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    const result = await db.query(query, params);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/60a6dc86-e52b-400e-83a3-ecd6c7ac1365',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agencyController.js:77',message:'After db.query',data:{rowCount:result?.rows?.length,hasRows:!!result?.rows},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    // Count total
    let countQuery = `SELECT COUNT(*) FROM agencies WHERE 1=1`;
    const countParams = [];

    if (city) {
      countQuery += ` AND LOWER(city) = LOWER($1)`;
      countParams.push(city);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      agencies: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAgencies: total
      }
    });

  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/60a6dc86-e52b-400e-83a3-ecd6c7ac1365',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agencyController.js:112',message:'Error in getAllAgencies',data:{error:error.message,code:error.code,detail:error.detail,stack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    console.error('❌ Error in getAllAgencies:', error);

    // Vérifier si c'est une erreur de table manquante
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      return res.status(500).json({
        success: false,
        message: 'La table "agencies" n\'existe pas dans la base de données. Veuillez créer le schéma de base de données.',
        error: error.message,
        hint: 'Vous devez exécuter les scripts de migration pour créer les tables PostgreSQL.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agences',
      error: error.message,
      code: error.code
    });
  }
};

// ============================================================
// GET AGENCY BY ID
// ============================================================

export const getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        a.id,
        a.name,
        a.contact,
        a.email,
        a.address,
        a.city,
        a.created_at,
        a.updated_at,
        -- Owner complet
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'image', u.image,
          'role', u.role
        ) AS owner,
        -- Stats détaillées
        (SELECT COUNT(*) FROM cars WHERE agency_id = a.id) AS total_cars,
        (SELECT COUNT(*) FROM cars WHERE agency_id = a.id AND is_available = TRUE) AS available_cars,
        (SELECT COUNT(*) FROM bookings WHERE agency_id = a.id) AS total_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE agency_id = a.id AND is_paid = TRUE) AS total_revenue
      FROM agencies a
      LEFT JOIN users u ON a.owner_id = u.id
      WHERE a.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      agency: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in getAgencyById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'agence',
      error: error.message
    });
  }
};

// ============================================================
// CREATE AGENCY
// ============================================================

export const createAgency = async (req, res) => {
  try {
    const { name, contact, email, address, ownerId, city } = req.body;

    // Validation
    if (!name || !contact || !email || !address || !ownerId || !city) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }

    // Vérifier si l'email existe déjà
    const emailCheck = await db.query(
      'SELECT id FROM agencies WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé par une autre agence'
      });
    }

    // Vérifier que le owner existe et est bien un agencyOwner
    const ownerCheck = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [ownerId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Propriétaire non trouvé'
      });
    }

    if (ownerCheck.rows[0].role !== 'agencyOwner') {
      return res.status(403).json({
        success: false,
        message: 'L\'utilisateur doit avoir le rôle agencyOwner'
      });
    }

    // Créer l'agence
    const query = `
      INSERT INTO agencies (name, contact, email, address, owner_id, city)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [name, contact, email, address, ownerId, city]);

    res.status(201).json({
      success: true,
      message: 'Agence créée avec succès',
      agency: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in createAgency:', error);

    // Gérer l'erreur de contrainte unique
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'agence',
      error: error.message
    });
  }
};

// ============================================================
// UPDATE AGENCY
// ============================================================

export const updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Champs autorisés
    const allowedFields = ['name', 'contact', 'email', 'address', 'city'];

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

    // Si email est modifié, vérifier unicité
    if (updates.email) {
      const emailCheck = await db.query(
        'SELECT id FROM agencies WHERE email = $1 AND id != $2',
        [updates.email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par une autre agence'
        });
      }
    }

    params.push(id);

    const query = `
      UPDATE agencies
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Agence mise à jour avec succès',
      agency: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in updateAgency:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'agence',
      error: error.message
    });
  }
};

// ============================================================
// DELETE AGENCY
// ============================================================

export const deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'agence a des voitures ou bookings
    const carsCheck = await db.query(
      'SELECT COUNT(*) FROM cars WHERE agency_id = $1',
      [id]
    );

    const carsCount = parseInt(carsCheck.rows[0].count);

    if (carsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: l'agence a ${carsCount} voiture(s). Supprimez-les d'abord.`
      });
    }

    // Suppression (CASCADE supprimera automatiquement tout)
    const result = await db.query(
      'DELETE FROM agencies WHERE id = $1 RETURNING name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: `Agence "${result.rows[0].name}" supprimée avec succès`
    });

  } catch (error) {
    console.error('❌ Error in deleteAgency:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'agence',
      error: error.message
    });
  }
};

// ============================================================
// GET AGENCIES BY OWNER
// ============================================================

export const getAgenciesByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const query = `
      SELECT
        a.*,
        (SELECT COUNT(*) FROM cars WHERE agency_id = a.id) AS total_cars,
        (SELECT COUNT(*) FROM bookings WHERE agency_id = a.id) AS total_bookings
      FROM agencies a
      WHERE a.owner_id = $1
      ORDER BY a.created_at DESC
    `;

    const result = await db.query(query, [ownerId]);

    res.status(200).json({
      success: true,
      agencies: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error in getAgenciesByOwner:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agences du propriétaire',
      error: error.message
    });
  }
};

// ============================================================
// GET AGENCY DASHBOARD STATS
// ============================================================

export const getAgencyStats = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        -- Bookings stats
        (SELECT COUNT(*) FROM bookings WHERE agency_id = $1) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE agency_id = $1 AND status = 'pending') AS pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE agency_id = $1 AND status = 'confirmed') AS confirmed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE agency_id = $1 AND status = 'cancelled') AS cancelled_bookings,
        -- Revenue
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE agency_id = $1 AND is_paid = TRUE) AS total_revenue,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE agency_id = $1 AND is_paid = FALSE AND status != 'cancelled') AS pending_revenue,
        -- Cars
        (SELECT COUNT(*) FROM cars WHERE agency_id = $1) AS total_cars,
        (SELECT COUNT(*) FROM cars WHERE agency_id = $1 AND is_available = TRUE) AS available_cars,
        (SELECT COUNT(*) FROM cars WHERE agency_id = $1 AND is_available = FALSE) AS rented_cars
    `;

    const result = await db.query(query, [id]);

    res.status(200).json({
      success: true,
      stats: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in getAgencyStats:', error);
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
  getAllAgencies,
  getAgencyById,
  createAgency,
  updateAgency,
  deleteAgency,
  getAgenciesByOwner,
  getAgencyStats
};
