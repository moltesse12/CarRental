import express from 'express';
import { authUser } from '../middleware/authMiddleware.js';
import userController from '../controllers/userController.js';

const userRouter = express.Router();

// Wrapper pour getUserProfile
const getUserProfile = async (req, res) => {
  try {
    req.params.id = req.user.id;
    const response = await userController.getUserById(req, res);
    // La réponse est déjà adaptée dans le contrôleur
    return response;
  } catch (error) {
    console.error("Error in getUserProfile wrapper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wrapper pour addRecentSearchedCity
const addRecentSearchedCity = async (req, res) => {
  try {
    const { recentSearchedCities } = req.body;
    if (!recentSearchedCities) {
      return res.status(400).json({ success: false, message: "recentSearchedCities is required" });
    }

    req.params.userId = req.user.id;
    req.body.city = recentSearchedCities;
    return await userController.addSearchHistory(req, res);
  } catch (error) {
    console.error("Error in addRecentSearchedCity wrapper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

userRouter.get("/", authUser, getUserProfile);
userRouter.post("/store-recent-search", authUser, addRecentSearchedCity);

export default userRouter;
