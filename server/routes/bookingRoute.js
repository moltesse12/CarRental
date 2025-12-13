import express from "express";
import bookingController from "../controllers/bookingController.js";
import { authUser } from "../middleware/authMiddleware.js";
import db from "../config/database.js";

const bookingRouter = express.Router();

// Wrapper pour checkBookingAvailability
const checkBookingAvailability = async (req, res) => {
  try {
    const { carId, pickUpDate, dropOffDate } = req.body;

    if (!carId || !pickUpDate || !dropOffDate) {
      return res.status(400).json({
        success: false,
        message: "carId, pickUpDate, and dropOffDate are required"
      });
    }

    // Vérifier que la voiture existe et est disponible
    const carCheck = await db.query(
      'SELECT is_available FROM cars WHERE id = $1',
      [carId]
    );

    if (carCheck.rows.length === 0) {
      return res.status(404).json({ success: false, isAvailable: false, message: "Car not found" });
    }

    if (!carCheck.rows[0].is_available) {
      return res.status(200).json({ success: true, isAvailable: false });
    }

    // Vérifier les conflits de dates
    const conflictCheck = await db.query(
      `SELECT id FROM bookings
       WHERE car_id = $1
       AND status IN ('pending', 'confirmed')
       AND (
         (pick_up_date <= $2 AND drop_off_date >= $2)
         OR (pick_up_date <= $3 AND drop_off_date >= $3)
         OR (pick_up_date >= $2 AND drop_off_date <= $3)
       )`,
      [carId, pickUpDate, dropOffDate]
    );

    const isAvailable = conflictCheck.rows.length === 0;

    res.status(200).json({ success: true, isAvailable });
  } catch (error) {
    console.error("Error in checkBookingAvailability:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wrapper pour bookingCreate
const bookingCreate = async (req, res) => {
  try {
    const { car, pickUpDate, dropOffDate } = req.body;

    if (!car || !pickUpDate || !dropOffDate) {
      return res.status(400).json({
        success: false,
        message: "car, pickUpDate, and dropOffDate are required"
      });
    }

    // Récupérer les informations de la voiture et de l'agence
    const carResult = await db.query(
      'SELECT agency_id, price_rent FROM cars WHERE id = $1',
      [car]
    );

    if (carResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const agencyId = carResult.rows[0].agency_id;
    const pricePerDay = parseFloat(carResult.rows[0].price_rent) || 0;

    // Calculer le prix total
    const pickup = new Date(pickUpDate);
    const dropoff = new Date(dropOffDate);
    const timeDiff = Math.abs(dropoff.getTime() - pickup.getTime());
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    const totalPrice = pricePerDay * days;

    // Préparer le body pour createBooking
    req.body.userId = req.user.id;
    req.body.carId = car;
    req.body.agencyId = agencyId;
    req.body.totalPrice = totalPrice;

    return await bookingController.createBooking(req, res);
  } catch (error) {
    console.error("Error in bookingCreate wrapper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wrapper pour getUserBookings (utilise req.user.id au lieu de req.params.userId)
const getUserBookings = async (req, res) => {
  req.params.userId = req.user.id;
  return await bookingController.getUserBookings(req, res);
};

// Wrapper pour getAgencyBookings (récupère l'agence de l'utilisateur)
const getAgencyBookings = async (req, res) => {
  try {
    const agencyResult = await db.query(
      'SELECT id FROM agencies WHERE owner_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (agencyResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Agency not found for this user" });
    }

    req.params.agencyId = agencyResult.rows[0].id;
    return await bookingController.getAgencyBookings(req, res);
  } catch (error) {
    console.error("Error in getAgencyBookings wrapper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

bookingRouter.post("/check-availability", checkBookingAvailability);
bookingRouter.post("/book", authUser, bookingCreate);
bookingRouter.get("/user", authUser, getUserBookings);
bookingRouter.get("/agency", authUser, getAgencyBookings);
// bookingRouter.post("/stripe", authUser, bookingsStripePayment);

export default bookingRouter;
