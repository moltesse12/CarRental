import express from "express";
import { authUser } from '../middleware/authMiddleware.js';
import { getAllAgencies, getAgencyById, createAgency, updateAgency, deleteAgency, getAgenciesByOwner, getAgencyStats } from "../controllers/agencyController.js";
import db from "../config/database.js";

const agencyRouter = express.Router();

// Route GET pour lister toutes les agences (pas besoin d'authentification)
agencyRouter.get("/", async (req, res) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/60a6dc86-e52b-400e-83a3-ecd6c7ac1365',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agencyRoute.js:9',message:'GET /api/agencies called',data:{hasGetAllAgencies:!!getAllAgencies,query:req.query},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  try {
    return await getAllAgencies(req, res);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/60a6dc86-e52b-400e-83a3-ecd6c7ac1365',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agencyRoute.js:15',message:'Error in getAllAgencies route',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    console.error('Error in agencies route:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route GET pour obtenir les statistiques d'une agence (doit être AVANT /:id)
agencyRouter.get("/:id/stats", authUser, getAgencyStats);

// Route GET pour obtenir une agence par ID
agencyRouter.get("/:id", getAgencyById);

// Route GET pour obtenir les agences d'un propriétaire (nécessite authentification)
agencyRouter.get("/owner/:ownerId", authUser, getAgenciesByOwner);

// Wrapper pour agencyReg (créer une agence)
const agencyReg = async (req, res) => {
  try {
    const { name, address, contact, email, city } = req.body;

    if (!name || !address || !contact || !email || !city) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Vérifier si l'utilisateur a déjà une agence
    const existingAgency = await db.query(
      'SELECT id FROM agencies WHERE owner_id = $1',
      [req.user.id]
    );

    if (existingAgency.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already has an agency registered"
      });
    }

    // Mettre à jour le rôle de l'utilisateur
    await db.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['agencyOwner', req.user.id]
    );

    // Préparer le body pour createAgency
    req.body.ownerId = req.user.id;
    return await createAgency(req, res);
  } catch (error) {
    console.error("Error in agencyReg wrapper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route POST pour créer une agence (nécessite authentification)
agencyRouter.post("/", authUser, agencyReg);

// Route PUT pour mettre à jour une agence
agencyRouter.put("/:id", authUser, updateAgency);

// Route DELETE pour supprimer une agence
agencyRouter.delete("/:id", authUser, deleteAgency);

export default agencyRouter;
