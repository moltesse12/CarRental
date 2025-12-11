import Bookings from "../models/Bookings.js";
import Car from "../models/Car.js";
import Agency from "../models/Agency.js";
import transporter from "../config/nodemailer.js";
// import Stripe from "stripe";

// INTERNAL HELPER
const checkAvailability = async ({ car, pickUpDate, dropOffDate }) => {
  try {
    const bookings = await Bookings.find({
      car,
      pickUpDate: { $lte: dropOffDate },
      dropOffDate: { $gte: pickUpDate },
    });
    return bookings.length === 0;
  } catch (error) {
    throw error;
  }
};

// TO CHECK CAR AVAILABILITY [POST "check-availability"]
export const checkBookingAvailability = async (req, res) => {
  try {
    const { car, pickUpDate, dropOffDate } = req.body;
    const isAvailable = await checkAvailability({ car, pickUpDate, dropOffDate });
    res.status(200).json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE A NEW BOOKING [POST "/book"]
export const bookingCreate = async (req, res) => {
  try {
    const { car, pickUpDate, dropOffDate } = req.body;
    const user = req.user._id;

    const isAvailable = await checkAvailability({ car, pickUpDate, dropOffDate });
    if (!isAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "Car is not available for the selected dates." });
    }

    // Get Total Price from car
    const carData = await Car.findById(car).populate("agency");
    if (!carData) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    let totalPrice = carData.price?.rent ?? 0;

    // Calculate totalPrice based on days
    const pickUp = new Date(pickUpDate);
    const dropOff = new Date(dropOffDate);
    const timeDiff = Math.abs(dropOff.getTime() - pickUp.getTime());
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    totalPrice = totalPrice * days;

    const booking = await Bookings.create({
      user,
      car,
      agency: carData.agency._id,
      pickUpDate,
      dropOffDate,
      totalPrice,
      status: "pending",
      isPaid: false,
    });
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: "Booking Car Confirmation",
      html: `<h2>Your booking has been confirmed!</h2>
        <p>Thank You booking ! Below are you Booking Details:</p>
        <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Agency Name:</strong> ${carData.agency.name}</li>
                         <li><strong>Date:</strong>${booking.pickUpDate.toDateString()}-${booking.dropOffDate.toDateString()}</li>
                                <li><strong>Booking Amount:</strong>${process.env.CURRENCY || "$"}${
        booking.totalPrice
      } for ${days} day(s)</li>

        </ul>
        <p>We look forward to serving you!</p>
        <p>Best regards,<br/>Car Rental Team</p>
    `,
    };
    await transporter.sendMail(mailOptions);
    res
      .status(201)
      .json({ success: true, message: "Booking created successfully.", bookingId: booking._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET BOOKINGS OF CURRENT USER [GET "/user"]
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Bookings.find({ user }).populate("car").sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET BOOKINGS FOR Agency [GET "/agency"]
export const getAgencyBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const agency = await Agency.findOne({ owner: req.user._id });
    if (!agency) {
      return res.status(404).json({ success: false, message: "Agency not found for this user" });
    }
    const bookings = await Bookings.find({ agency: agency._id })
      .populate("car agency user")
      .sort({ createdAt: -1 });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, b) => acc + (b.isPaid ? b.totalPrice : 0), 0);

    res.status(200).json({ success: true, dashboard: { totalBookings, totalRevenue, bookings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// STRIPE PAYMENT [POST "/stripe"]
// Expects { bookingId } in body. Returns { clientSecret } for client to confirm payment.
// export const bookingsStripePayment = async (req, res) => {
//   try {
//     const { bookingId } = req.body;
//     if (!bookingId) {
//       return res.status(400).json({ success: false, message: "bookingId is required" });
//     }

//     const booking = await Bookings.findById(bookingId);
//     if (!booking) {
//       return res.status(404).json({ success: false, message: "Booking not found" });
//     }

//     const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
//     const amountCents = Math.round((booking.totalPrice || 0) * 100);

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountCents,
//       currency: process.env.STRIPE_CURRENCY || "usd",
//       metadata: { bookingId: booking._id.toString(), userId: req.user._id.toString() },
//     });

//     res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
