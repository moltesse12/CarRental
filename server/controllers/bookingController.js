// import Bookings from "../models/Bookings.js";
// import Car from "../models/Car.js";
// import Agency from "../models/Agency.js";
// import transporter from "../config/nodemailer.js";
// // import Stripe from "stripe";

// // INTERNAL HELPER
// const checkAvailability = async ({ car, pickUpDate, dropOffDate }) => {
//   try {
//     const bookings = await Bookings.find({
//       car,
//       pickUpDate: { $lte: dropOffDate },
//       dropOffDate: { $gte: pickUpDate },
//     });
//     return bookings.length === 0;
//   } catch (error) {
//     throw error;
//   }
// };

// // TO CHECK CAR AVAILABILITY [POST "check-availability"]
// export const checkBookingAvailability = async (req, res) => {
//   try {
//     const { car, pickUpDate, dropOffDate } = req.body;
//     const isAvailable = await checkAvailability({ car, pickUpDate, dropOffDate });
//     res.status(200).json({ success: true, isAvailable });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // CREATE A NEW BOOKING [POST "/book"]
// export const bookingCreate = async (req, res) => {
//   try {
//     const { car, pickUpDate, dropOffDate } = req.body;
//     const user = req.user._id;

//     const isAvailable = await checkAvailability({ car, pickUpDate, dropOffDate });
//     if (!isAvailable) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Car is not available for the selected dates." });
//     }

//     // Get Total Price from car
//     const carData = await Car.findById(car).populate("agency");
//     if (!carData) {
//       return res.status(404).json({ success: false, message: "Car not found" });
//     }
//     let totalPrice = carData.price?.rent ?? 0;

//     // Calculate totalPrice based on days
//     const pickUp = new Date(pickUpDate);
//     const dropOff = new Date(dropOffDate);
//     const timeDiff = Math.abs(dropOff.getTime() - pickUp.getTime());
//     const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
//     totalPrice = totalPrice * days;

//     const booking = await Bookings.create({
//       user,
//       car,
//       agency: carData.agency._id,
//       pickUpDate,
//       dropOffDate,
//       totalPrice,
//       status: "pending",
//       isPaid: false,
//     });
//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: req.user.email,
//       subject: "Booking Car Confirmation",
//       html: `<h2>Your booking has been confirmed!</h2>
//         <p>Thank You booking ! Below are you Booking Details:</p>
//         <ul>
//         <li><strong>Booking ID:</strong> ${booking._id}</li>
//                 <li><strong>Agency Name:</strong> ${carData.agency.name}</li>
//                          <li><strong>Date:</strong>${booking.pickUpDate.toDateString()}-${booking.dropOffDate.toDateString()}</li>
//                                 <li><strong>Booking Amount:</strong>${process.env.CURRENCY || "$"}${
//         booking.totalPrice
//       } for ${days} day(s)</li>

//         </ul>
//         <p>We look forward to serving you!</p>
//         <p>Best regards,<br/>Car Rental Team</p>
//     `,
//     };
//     await transporter.sendMail(mailOptions);
//     res
//       .status(201)
//       .json({ success: true, message: "Booking created successfully.", bookingId: booking._id });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET BOOKINGS OF CURRENT USER [GET "/user"]
// export const getUserBookings = async (req, res) => {
//   try {
//     const user = req.user._id;
//     const bookings = await Bookings.find({ user }).populate("car").sort({ createdAt: -1 });
//     res.status(200).json({ success: true, bookings });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // GET BOOKINGS FOR Agency [GET "/agency"]
// export const getAgencyBookings = async (req, res) => {
//   try {
//     const agency = await Agency.findOne({ owner: req.user._id });
//     if (!agency) {
//       return res.status(404).json({ success: false, message: "Agency not found for this user" });
//     }
//     const bookings = await Bookings.find({ agency: agency._id })
//       .populate("car agency user")
//       .sort({ createdAt: -1 });
//     const totalBookings = bookings.length;
//     const totalRevenue = bookings.reduce((acc, b) => acc + (b.isPaid ? b.totalPrice : 0), 0);

//     res.status(200).json({ success: true, dashboard: { totalBookings, totalRevenue, bookings } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // STRIPE PAYMENT [POST "/stripe"]
// // Expects { bookingId } in body. Returns { clientSecret } for client to confirm payment.
// // export const bookingsStripePayment = async (req, res) => {
// //   try {
// //     const { bookingId } = req.body;
// //     if (!bookingId) {
// //       return res.status(400).json({ success: false, message: "bookingId is required" });
// //     }

// //     const booking = await Bookings.findById(bookingId);
// //     if (!booking) {
// //       return res.status(404).json({ success: false, message: "Booking not found" });
// //     }

// //     const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// //     const amountCents = Math.round((booking.totalPrice || 0) * 100);

// //     const paymentIntent = await stripe.paymentIntents.create({
// //       amount: amountCents,
// //       currency: process.env.STRIPE_CURRENCY || "usd",
// //       metadata: { bookingId: booking._id.toString(), userId: req.user._id.toString() },
// //     });

// //     res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };



// ============================================================
// BOOKING CONTROLLER - PostgreSQL avec driver pg
// Gestion des réservations + logique is_available
// ============================================================

import db from '../config/database.js';
import { adaptBooking, adaptBookings } from '../utils/dataAdapter.js';

// ============================================================
// GET ALL BOOKINGS (avec filtres)
// ============================================================

export const getAllBookings = async (req, res) => {
  try {
    const { status, userId, agencyId, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT
        b.id,
        b.pick_up_date,
        b.drop_off_date,
        b.total_price,
        b.status,
        b.payment_method,
        b.is_paid,
        b.created_at,
        b.updated_at,
        -- User info
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email
        ) AS user,
        -- Car info
        json_build_object(
          'id', c.id,
          'title', c.title,
          'city', c.city,
          'priceRent', c.price_rent
        ) AS car,
        -- Agency info
        json_build_object(
          'id', a.id,
          'name', a.name,
          'email', a.email
        ) AS agency
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      JOIN agencies a ON b.agency_id = a.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (userId) {
      query += ` AND b.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (agencyId) {
      query += ` AND b.agency_id = $${paramIndex}`;
      params.push(agencyId);
      paramIndex++;
    }

    query += ` ORDER BY b.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // Count total
    let countQuery = `SELECT COUNT(*) FROM bookings b WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (status) {
      countQuery += ` AND b.status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }
    if (userId) {
      countQuery += ` AND b.user_id = $${countIndex}`;
      countParams.push(userId);
      countIndex++;
    }
    if (agencyId) {
      countQuery += ` AND b.agency_id = $${countIndex}`;
      countParams.push(agencyId);
      countIndex++;
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      bookings: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total
      }
    });

  } catch (error) {
    console.error('❌ Error in getAllBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
};

// ============================================================
// GET BOOKING BY ID
// ============================================================

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        b.id,
        b.pick_up_date,
        b.drop_off_date,
        b.total_price,
        b.status,
        b.payment_method,
        b.is_paid,
        b.created_at,
        b.updated_at,
        -- User complet
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'image', u.image
        ) AS user,
        -- Car complet
        json_build_object(
          'id', c.id,
          'title', c.title,
          'description', c.description,
          'city', c.city,
          'address', c.address,
          'bodyType', c.body_type,
          'priceRent', c.price_rent,
          'transmission', c.transmission,
          'seats', c.seats,
          'fuelType', c.fuel_type
        ) AS car,
        -- Agency complète
        json_build_object(
          'id', a.id,
          'name', a.name,
          'email', a.email,
          'contact', a.contact,
          'address', a.address,
          'city', a.city
        ) AS agency
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      JOIN agencies a ON b.agency_id = a.id
      WHERE b.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Adapter les données pour le frontend
    const adaptedBooking = adaptBooking(result.rows[0]);

    res.status(200).json({
      success: true,
      booking: adaptedBooking
    });

  } catch (error) {
    console.error('❌ Error in getBookingById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation',
      error: error.message
    });
  }
};

// ============================================================
// CREATE BOOKING
// ============================================================

export const createBooking = async (req, res) => {
  try {
    const {
      userId,
      carId,
      agencyId,
      pickUpDate,
      dropOffDate,
      totalPrice,
      paymentMethod = 'Pay at Pick-up'
    } = req.body;

    // Validation
    if (!userId || !carId || !agencyId || !pickUpDate || !dropOffDate || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être renseignés'
      });
    }

    // Vérifier que les dates sont cohérentes
    const pickup = new Date(pickUpDate);
    const dropoff = new Date(dropOffDate);

    if (dropoff <= pickup) {
      return res.status(400).json({
        success: false,
        message: 'La date de retour doit être après la date de prise en charge'
      });
    }

    // Utiliser une transaction
    const result = await db.transaction(async (client) => {
      // Vérifier que la voiture existe et est disponible
      const carCheck = await client.query(
        'SELECT is_available FROM cars WHERE id = $1 FOR UPDATE',
        [carId]
      );

      if (carCheck.rows.length === 0) {
        throw new Error('Voiture non trouvée');
      }

      if (!carCheck.rows[0].is_available) {
        throw new Error('Cette voiture n\'est plus disponible');
      }

      // Vérifier qu'il n'y a pas de conflit de dates
      const conflictCheck = await client.query(
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

      if (conflictCheck.rows.length > 0) {
        throw new Error('Cette voiture est déjà réservée pour ces dates');
      }

      // Créer la réservation
      const bookingQuery = `
        INSERT INTO bookings (
          user_id, car_id, agency_id, pick_up_date, drop_off_date,
          total_price, payment_method, status, is_paid
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', false)
        RETURNING *
      `;

      const bookingResult = await client.query(bookingQuery, [
        userId, carId, agencyId, pickUpDate, dropOffDate,
        totalPrice, paymentMethod
      ]);

      return bookingResult.rows[0];
    });

    // Adapter les données pour le frontend
    const adaptedBooking = adaptBooking(result);

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      booking: adaptedBooking,
      bookingId: result.id
    });

  } catch (error) {
    console.error('❌ Error in createBooking:', error);

    // Gérer les erreurs métier spécifiques
    if (error.message.includes('disponible') || error.message.includes('réservée')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
};

// ============================================================
// UPDATE BOOKING
// ============================================================

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Champs autorisés
    const allowedFields = ['status', 'payment_method', 'is_paid'];

    const setClause = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

      if (allowedFields.includes(snakeKey)) {
        setClause.push(`${snakeKey} = $${paramIndex}`);
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
      UPDATE bookings
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Note: Le trigger handle_car_availability() gère automatiquement
    // la mise à jour de is_available quand is_paid passe à TRUE

    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour avec succès',
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error in updateBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la réservation',
      error: error.message
    });
  }
};

// ============================================================
// CANCEL BOOKING
// ============================================================

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.transaction(async (client) => {
      // Récupérer la réservation
      const booking = await client.query(
        'SELECT * FROM bookings WHERE id = $1 FOR UPDATE',
        [id]
      );

      if (booking.rows.length === 0) {
        throw new Error('Réservation non trouvée');
      }

      const bookingData = booking.rows[0];

      // Vérifier qu'elle n'est pas déjà annulée
      if (bookingData.status === 'cancelled') {
        throw new Error('Cette réservation est déjà annulée');
      }

      // Annuler la réservation
      const updateResult = await client.query(
        `UPDATE bookings
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      // Le trigger rendra automatiquement la voiture disponible
      // si elle était marquée comme indisponible

      return updateResult.rows[0];
    });

    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès',
      booking: result
    });

  } catch (error) {
    console.error('❌ Error in cancelBooking:', error);

    if (error.message.includes('non trouvée') || error.message.includes('annulée')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation',
      error: error.message
    });
  }
};

// ============================================================
// CONFIRM PAYMENT (appelé par webhook Stripe)
// ============================================================

export const confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId, paymentMethod } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'ID de réservation manquant'
      });
    }

    const result = await db.transaction(async (client) => {
      // Mettre à jour la réservation
      const updateQuery = `
        UPDATE bookings
        SET
          is_paid = TRUE,
          status = 'confirmed',
          payment_method = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const bookingResult = await client.query(updateQuery, [
        paymentMethod || 'Stripe',
        bookingId
      ]);

      if (bookingResult.rows.length === 0) {
        throw new Error('Réservation non trouvée');
      }

      // Le trigger handle_car_availability() marquera automatiquement
      // la voiture comme indisponible (is_available = FALSE)

      return bookingResult.rows[0];
    });

    res.status(200).json({
      success: true,
      message: 'Paiement confirmé, voiture réservée',
      booking: result
    });

  } catch (error) {
    console.error('❌ Error in confirmPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement',
      error: error.message
    });
  }
};

// ============================================================
// DELETE BOOKING
// ============================================================

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier le statut avant suppression
    const checkResult = await db.query(
      'SELECT status, is_paid FROM bookings WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    const { status, is_paid } = checkResult.rows[0];

    if (status === 'confirmed' && is_paid) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une réservation payée et confirmée. Annulez-la d\'abord.'
      });
    }

    // Suppression
    await db.query('DELETE FROM bookings WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Réservation supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Error in deleteBooking:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la réservation',
      error: error.message
    });
  }
};

// ============================================================
// GET USER BOOKINGS
// ============================================================

export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT
        b.id,
        b.pick_up_date,
        b.drop_off_date,
        b.total_price,
        b.status,
        b.is_paid,
        b.created_at,
        b.updated_at,
        json_build_object(
          'id', c.id,
          'title', c.title,
          'city', c.city,
          'address', c.address,
          'bodyType', c.body_type,
          'body_type', c.body_type,
          'seats', c.seats,
          'transmission', c.transmission,
          'fuelType', c.fuel_type,
          'fuel_type', c.fuel_type,
          'priceRent', c.price_rent,
          'price_rent', c.price_rent,
          'images', COALESCE(
            (SELECT json_agg(ci.image_url ORDER BY ci.display_order)
             FROM car_images ci
             WHERE ci.car_id = c.id),
            '[]'::json
          )
        ) AS car,
        json_build_object(
          'id', a.id,
          'name', a.name,
          'contact', a.contact,
          'email', a.email
        ) AS agency
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      JOIN agencies a ON b.agency_id = a.id
      WHERE b.user_id = $1
    `;

    const params = [userId];

    if (status) {
      query += ` AND b.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await db.query(query, params);

    // Adapter les données pour le frontend
    const adaptedBookings = adaptBookings(result.rows);

    res.status(200).json({
      success: true,
      bookings: adaptedBookings,
      total: adaptedBookings.length
    });

  } catch (error) {
    console.error('❌ Error in getUserBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
};

// ============================================================
// GET AGENCY BOOKINGS (dashboard agency)
// ============================================================

export const getAgencyBookings = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT
        b.id,
        b.pick_up_date,
        b.drop_off_date,
        b.total_price,
        b.status,
        b.is_paid,
        b.created_at,
        b.updated_at,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email
        ) AS user,
        json_build_object(
          'id', c.id,
          'title', c.title,
          'city', c.city,
          'bodyType', c.body_type
        ) AS car
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN cars c ON b.car_id = c.id
      WHERE b.agency_id = $1
    `;

    const params = [agencyId];

    if (status) {
      query += ` AND b.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await db.query(query, params);

    // Calculer revenue
    const revenueQuery = `
      SELECT COALESCE(SUM(total_price), 0) AS total_revenue
      FROM bookings
      WHERE agency_id = $1 AND is_paid = TRUE
    `;

    const revenueResult = await db.query(revenueQuery, [agencyId]);

    // Adapter les données pour le frontend
    const adaptedBookings = adaptBookings(result.rows);

    res.status(200).json({
      success: true,
      bookings: adaptedBookings,
      dashboard: {
        bookings: adaptedBookings,
        totalBookings: adaptedBookings.length,
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue)
      },
      totalBookings: adaptedBookings.length,
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue)
    });

  } catch (error) {
    console.error('❌ Error in getAgencyBookings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations de l\'agence',
      error: error.message
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmPayment,
  deleteBooking,
  getUserBookings,
  getAgencyBookings
};
