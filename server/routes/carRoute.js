import express from "express";
import { upload } from "../middleware/multer.js";
import { authUser } from "../middleware/authMiddleware.js";
import carController from "../controllers/carController.js";
import db from "../config/database.js";

const carRouter = express.Router();

// Wrapper pour addNewCar (utilise createCar)
const addNewCar = async (req, res) => {
  try {
    // Récupérer l'agence de l'utilisateur connecté
    const agencyResult = await db.query(
      'SELECT id FROM agencies WHERE owner_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (agencyResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agency not found" });
    }

    const agencyId = agencyResult.rows[0].id;

    // Traiter les images uploadées (pour l'instant, on stocke juste les chemins)
    // TODO: Uploader vers Cloudinary et obtenir les URLs
    const images = req.files ? req.files.map(file => file.path) : [];

    // Préparer le body avec l'agencyId
    req.body.agencyId = agencyId;
    req.body.images = images;
    req.body.features = req.body.features
      ? (typeof req.body.features === 'string' ? req.body.features.split(',').map(f => f.trim()) : req.body.features)
      : [];
    req.body.priceRent = req.body.rentPrice || req.body.priceRent;
    req.body.priceSale = req.body.salePrice || req.body.priceSale;

    return await carController.createCar(req, res);
  } catch (error) {
    console.error("Error in addNewCar wrapper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wrapper pour getAllAvailableCars
const getAllAvailableCars = carController.getAvailableCars;

// Wrapper pour getOwnerCars
const getOwnerCars = async (req, res) => {
  try {
    const agencyResult = await db.query(
      'SELECT id FROM agencies WHERE owner_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (agencyResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agency not found" });
    }

    const agencyId = agencyResult.rows[0].id;
    req.params.agencyId = agencyId;
    return await carController.getCarsByAgency(req, res);
  } catch (error) {
    console.error("Error in getOwnerCars wrapper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wrapper pour toggleCarAvailability
const toggleCarAvailability = async (req, res) => {
  try {
    const { carId } = req.body;
    if (!carId) {
      return res.status(400).json({ success: false, message: "carId is required" });
    }

    // Récupérer l'état actuel
    const carResult = await db.query(
      'SELECT is_available FROM cars WHERE id = $1',
      [carId]
    );

    if (carResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const newAvailability = !carResult.rows[0].is_available;

    // Mettre à jour
    await db.query(
      'UPDATE cars SET is_available = $1, updated_at = NOW() WHERE id = $2',
      [newAvailability, carId]
    );

    res.status(200).json({
      success: true,
      message: "Car availability status updated successfully",
      isAvailable: newAvailability
    });
  } catch (error) {
    console.error("Error in toggleCarAvailability:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

carRouter.post("/", upload.array("images", 4), authUser, addNewCar);
carRouter.get("/", getAllAvailableCars);
carRouter.get("/owner", authUser, getOwnerCars);
carRouter.post("/toggle-availability", authUser, toggleCarAvailability);

export default carRouter;
