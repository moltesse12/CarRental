import express from "express";
import {
  bookingCreate,
  // bookingsStripePayment,
  checkBookingAvailability,
  getAgencyBookings,
  getUserBookings
} from "../controllers/bookingController.js";
import { authUser } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkBookingAvailability);
bookingRouter.post("/book", authUser, bookingCreate);
bookingRouter.get("/user", authUser, getUserBookings);
bookingRouter.get("/agency", authUser, getAgencyBookings);
// bookingRouter.post("/stripe", authUser, bookingsStripePayment);

export default bookingRouter;
