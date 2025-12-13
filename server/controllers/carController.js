// import { v2 as cloudinary } from "cloudinary";
// import Car from "../models/Car.js";
// import Agency from "../models/Agency.js";

// // CREATE A NEW CAR [POST "/cars"]
// export const addNewCar = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       city,
//       country,
//       address,
//       odometer,
//       bodyType,
//       priceRent,
//       priceSale,
//       transmission,
//       seats,
//       fuelType,
//       featured,
//       features,
//     } = req.body;

//     const agency = await Agency.findOne({ owner: req.user._id });

//     if (!agency) {
//       return res.status(404).json({ message: "Agency not found" });
//     }

//     // Upload images to Cloudinary
//     const uploadedImages = req.files.map(async file => {
//       const response = await cloudinary.uploader.upload(file.path);
//       return response.secure_url;
//     });

//     // Waiting for uploads to complete
//     const images = await Promise.all(uploadedImages);

//     await Car.create({
//       agency: agency._id,
//       title,
//       description,
//       city,
//       country,
//       address,
//       odometer,
//       bodyType,
//       price: {
//         rent: priceRent ? +priceRent : null,
//         sale: priceSale ? +priceSale : null,
//       },
//       specs: {
//         transmission,
//         seats: +seats,
//         fuelType,
//       },

//       features: JSON.parse(features),
//       images,
//     });
//     res.status(201).json({ success: true, message: "New car added successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// // GET ALL AVAILABLE CARS [GET "/cars"]
// export const getAllAvailableCars = async (req, res) => {
//   try {
//     const cars = await Car.find({ isAvailable: true }).populate({
//       path: "agency",
//       populate: { path: "owner", select: "image email" },
//     });
//     res.status(200).json({ success: true, cars });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // GET CARS OF THE LOGGED IN AGENCY OWNER [GET "/owner"]

// export const getOwnerCars = async (req, res) => {
//   try {
//     const agencyData = await Agency.findOne({ owner: req.user._id });
//     const cars = await Car.find({ agency: agencyData._id.toString() }).populate("agency");
//     res.status(200).json({ success: true, cars });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // TOGGLE AVAILABILITY STATUS OF A CAR [POST "/cars/toggle-availability"]
// export const toggleCarAvailability = async (req, res) => {
//   try {
//     const { carId } = req.body;
//     const carData = await Car.findById(carId);
//     carData.isAvailable = !carData.isAvailable;
//     await carData.save();
//     res
//       .status(200)
//       .json({ success: true, message: "Car availability status updated successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

import db from "../config/database.js";
import { adaptCar, adaptCars } from "../utils/dataAdapter.js";

// ============================================================
// GET ALL CARS (avec filtres optionnels)
// ============================================================

export const getAllCars = async (req, res) => {
  try {
    const {
      city,
      bodyType,
      minPrice,
      maxPrice,
      transmission,
      fuelType,
      page = 1,
      limit = 10,
    } = req.query;

    // Construction dynamique de la query
    let query = `
      SELECT
        c.id,
        c.title,
        c.description,
        c.city,
        c.country,
        c.address,
        c.body_type,
        c.price_rent,
        c.price_sale,
        c.transmission,
        c.seats,
        c.fuel_type,
        c.odometer,
        c.is_available,
        c.status,
        c.created_at,
        c.updated_at,
        -- Agency info
        a.id AS agency_id,
        a.name AS agency_name,
        a.email AS agency_email,
        -- Images (tableau JSON)
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'url', ci.image_url,
            'order', ci.display_order
          ) ORDER BY ci.display_order) FILTER (WHERE ci.id IS NOT NULL),
          '[]'::json
        ) AS images,
        -- Features (tableau de noms)
        COALESCE(
          array_agg(DISTINCT fc.name ORDER BY fc.name) FILTER (WHERE fc.id IS NOT NULL),
          ARRAY[]::VARCHAR[]
        ) AS features
      FROM cars c
      LEFT JOIN agencies a ON c.agency_id = a.id
      LEFT JOIN car_images ci ON c.id = ci.car_id
      LEFT JOIN car_features cf ON c.id = cf.car_id
      LEFT JOIN feature_catalog fc ON cf.feature_id = fc.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtres dynamiques
    if (city) {
      query += ` AND LOWER(c.city) = LOWER($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }

    if (bodyType) {
      query += ` AND LOWER(c.body_type) = LOWER($${paramIndex})`;
      params.push(bodyType);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND c.price_rent >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND c.price_rent <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (transmission) {
      query += ` AND c.transmission = $${paramIndex}`;
      params.push(transmission);
      paramIndex++;
    }

    if (fuelType) {
      query += ` AND c.fuel_type = $${paramIndex}`;
      params.push(fuelType);
      paramIndex++;
    }

    // Groupement et tri
    query += `
      GROUP BY c.id, a.id, a.name, a.email, u.id, u.id
      ORDER BY c.created_at DESC
    `;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    // Exécution de la requête
    const result = await db.query(query, params);

    // Count total pour pagination
    let countQuery = `SELECT COUNT(DISTINCT c.id) FROM cars c WHERE 1=1`;
    const countParams = [];
    let countIndex = 1;

    if (city) {
      countQuery += ` AND LOWER(c.city) = LOWER($${countIndex})`;
      countParams.push(city);
      countIndex++;
    }
    if (bodyType) {
      countQuery += ` AND LOWER(c.body_type) = LOWER($${countIndex})`;
      countParams.push(bodyType);
      countIndex++;
    }
    if (minPrice) {
      countQuery += ` AND c.price_rent >= $${countIndex}`;
      countParams.push(parseFloat(minPrice));
      countIndex++;
    }
    if (maxPrice) {
      countQuery += ` AND c.price_rent <= $${countIndex}`;
      countParams.push(parseFloat(maxPrice));
      countIndex++;
    }
    if (transmission) {
      countQuery += ` AND c.transmission = $${countIndex}`;
      countParams.push(transmission);
      countIndex++;
    }
    if (fuelType) {
      countQuery += ` AND c.fuel_type = $${countIndex}`;
      countParams.push(fuelType);
      countIndex++;
    }

    const countResult = await db.query(countQuery, countParams);
    const totalCars = parseInt(countResult.rows[0].count);

    // Adapter les données pour le frontend
    const adaptedCars = adaptCars(result.rows);

    res.status(200).json({
      success: true,
      cars: adaptedCars,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCars / limit),
        totalCars,
        carsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error in getAllCars:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des voitures",
      error: error.message,
    });
  }
};

// ============================================================
// GET CAR BY ID
// ============================================================

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        c.id,
        c.title,
        c.description,
        c.city,
        c.country,
        c.address,
        c.body_type,
        c.price_rent,
        c.price_sale,
        c.transmission,
        c.seats,
        c.fuel_type,
        c.odometer,
        c.is_available,
        c.status,
        c.created_at,
        c.updated_at,
        -- Agency complète
        json_build_object(
          'id', a.id,
          'name', a.name,
          'email', a.email,
          'contact', a.contact,
          'address', a.address,
          'city', a.city,
          'ownerId', a.owner_id,
          'owner', json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'image', u.image
          )
        ) AS agency,
        -- Images
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'url', ci.image_url,
            'order', ci.display_order
          ) ORDER BY ci.display_order) FILTER (WHERE ci.id IS NOT NULL),
          '[]'::json
        ) AS images,
        -- Features
        COALESCE(
          array_agg(DISTINCT fc.name ORDER BY fc.name) FILTER (WHERE fc.id IS NOT NULL),
          ARRAY[]::VARCHAR[]
        ) AS features
      FROM cars c
      LEFT JOIN agencies a ON c.agency_id = a.id
      LEFT JOIN users u ON a.owner_id = u.id
      LEFT JOIN car_images ci ON c.id = ci.car_id
      LEFT JOIN car_features cf ON c.id = cf.car_id
      LEFT JOIN feature_catalog fc ON cf.feature_id = fc.id
      WHERE c.id = $1
      GROUP BY c.id, a.id, u.id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Voiture non trouvée",
      });
    }

    // Adapter les données pour le frontend
    const adaptedCar = adaptCar(result.rows[0]);

    res.status(200).json({
      success: true,
      car: adaptedCar,
    });
  } catch (error) {
    console.error("❌ Error in getCarById:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la voiture",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE CAR (avec images et features)
// ============================================================

export const createCar = async (req, res) => {
  try {
    const {
      agencyId,
      title,
      description,
      address,
      city,
      country,
      bodyType,
      priceRent,
      priceSale,
      transmission,
      seats,
      fuelType,
      odometer,
      images = [], // Array d'URLs
      features = [], // Array de noms de features
    } = req.body;

    // Validation
    if (!agencyId || !title || !description || !city) {
      return res.status(400).json({
        success: false,
        message: "Champs obligatoires manquants",
      });
    }

    // Utiliser une transaction pour cohérence des données
    const result = await db.transaction(async client => {
      // 1. Insérer la voiture
      const carQuery = `
        INSERT INTO cars (
          agency_id, title, description, address, city, country, body_type,
          price_rent, price_sale, transmission, seats, fuel_type, odometer
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const carResult = await client.query(carQuery, [
        agencyId,
        title,
        description,
        address,
        city,
        country,
        bodyType,
        priceRent,
        priceSale,
        transmission,
        seats,
        fuelType,
        odometer,
      ]);

      const carId = carResult.rows[0].id;

      // 2. Insérer les images (max 5)
      if (images.length > 0) {
        const imagesToInsert = images.slice(0, 5); // Limiter à 5 images

        for (let i = 0; i < imagesToInsert.length; i++) {
          await client.query(
            `INSERT INTO car_images (car_id, image_url, display_order) VALUES ($1, $2, $3)`,
            [carId, imagesToInsert[i], i]
          );
        }
      }

      // 3. Insérer les features
      if (features.length > 0) {
        // Récupérer les IDs des features depuis le catalogue
        const featureIds = await client.query(
          `SELECT id FROM feature_catalog WHERE name = ANY($1)`,
          [features]
        );

        for (const row of featureIds.rows) {
          await client.query(`INSERT INTO car_features (car_id, feature_id) VALUES ($1, $2)`, [
            carId,
            row.id,
          ]);
        }
      }

      // 4. Récupérer la voiture complète
      const fullCarQuery = `
        SELECT
          c.*,
          json_build_object(
            'id', a.id,
            'name', a.name,
            'email', a.email,
            'contact', a.contact,
            'address', a.address,
            'city', a.city,
            'owner', json_build_object(
              'id', u.id,
              'username', u.username,
              'email', u.email,
              'image', u.image
            )
          ) AS agency,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object(
              'url', ci.image_url,
              'order', ci.display_order
            ) ORDER BY ci.display_order) FILTER (WHERE ci.id IS NOT NULL),
            '[]'::json
          ) AS images,
          COALESCE(
            array_agg(DISTINCT fc.name) FILTER (WHERE fc.id IS NOT NULL),
            ARRAY[]::VARCHAR[]
          ) AS features
        FROM cars c
        LEFT JOIN agencies a ON c.agency_id = a.id
        LEFT JOIN users u ON a.owner_id = u.id
        LEFT JOIN car_images ci ON c.id = ci.car_id
        LEFT JOIN car_features cf ON c.id = cf.car_id
        LEFT JOIN feature_catalog fc ON cf.feature_id = fc.id
        WHERE c.id = $1
        GROUP BY c.id, a.id, u.id
      `;

      const fullCarResult = await client.query(fullCarQuery, [carId]);
      return fullCarResult.rows[0];
    });

    // Adapter les données pour le frontend
    const adaptedCar = adaptCar(result);

    res.status(201).json({
      success: true,
      message: "Voiture créée avec succès",
      car: adaptedCar,
    });
  } catch (error) {
    console.error("❌ Error in createCar:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la voiture",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE CAR
// ============================================================

export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Construire dynamiquement la requête UPDATE
    const allowedFields = [
      "title",
      "description",
      "address",
      "city",
      "country",
      "body_type",
      "price_rent",
      "price_sale",
      "transmission",
      "seats",
      "fuel_type",
      "odometer",
      "is_available",
      "status",
    ];

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
        message: "Aucun champ valide à mettre à jour",
      });
    }

    params.push(id); // Dernier param pour WHERE

    const query = `
      UPDATE cars
      SET ${setClause.join(", ")}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Voiture non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voiture mise à jour avec succès",
      car: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error in updateCar:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la voiture",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE CAR
// ============================================================

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la voiture a des bookings actifs
    const bookingCheck = await db.query(
      `SELECT COUNT(*) FROM bookings
       WHERE car_id = $1 AND status IN ('pending', 'confirmed')`,
      [id]
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer: la voiture a des réservations actives",
      });
    }

    // Suppression (CASCADE supprimera automatiquement images et features)
    const result = await db.query("DELETE FROM cars WHERE id = $1 RETURNING id, title", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Voiture non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: `Voiture "${result.rows[0].title}" supprimée avec succès`,
    });
  } catch (error) {
    console.error("❌ Error in deleteCar:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la voiture",
      error: error.message,
    });
  }
};

// ============================================================
// GET CARS BY AGENCY
// ============================================================

export const getCarsByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    const query = `
      SELECT
        c.id,
        c.title,
        c.city,
        c.body_type,
        c.price_rent,
        c.price_sale,
        c.is_available,
        c.odometer,
        -- Première image uniquement
        (SELECT image_url FROM car_images WHERE car_id = c.id ORDER BY display_order LIMIT 1) AS main_image,
        -- Count des features
        (SELECT COUNT(*) FROM car_features WHERE car_id = c.id) AS features_count
      FROM cars c
      WHERE c.agency_id = $1
      ORDER BY c.created_at DESC
    `;

    const result = await db.query(query, [agencyId]);

    // Adapter les données pour le frontend
    const adaptedCars = adaptCars(result.rows);

    res.status(200).json({
      success: true,
      cars: adaptedCars,
      total: adaptedCars.length,
    });
  } catch (error) {
    console.error("❌ Error in getCarsByAgency:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des voitures de l'agence",
      error: error.message,
    });
  }
};

// ============================================================
// SEARCH CARS (fulltext search)
// ============================================================

export const searchCars = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Requête de recherche trop courte (min 2 caractères)",
      });
    }

    const searchTerm = `%${q}%`;

    const query = `
      SELECT
        c.id,
        c.title,
        c.city,
        c.body_type,
        c.price_rent,
        c.is_available,
        (SELECT image_url FROM car_images WHERE car_id = c.id ORDER BY display_order LIMIT 1) AS main_image
      FROM cars c
      WHERE
        LOWER(c.title) LIKE LOWER($1)
        OR LOWER(c.description) LIKE LOWER($1)
        OR LOWER(c.city) LIKE LOWER($1)
        OR LOWER(c.body_type) LIKE LOWER($1)
      ORDER BY c.title
      LIMIT 20
    `;

    const result = await db.query(query, [searchTerm]);

    // Adapter les données pour le frontend
    const adaptedCars = adaptCars(result.rows);

    res.status(200).json({
      success: true,
      results: adaptedCars,
      total: adaptedCars.length,
    });
  } catch (error) {
    console.error("❌ Error in searchCars:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche",
      error: error.message,
    });
  }
};

// ============================================================
// GET AVAILABLE CARS (shortcut)
// ============================================================

export const getAvailableCars = async (req, res) => {
  try {
    const { city } = req.query;

    let query = `
      SELECT
        c.id,
        c.title,
        c.city,
        c.body_type,
        c.price_rent,
        c.transmission,
        c.fuel_type,
        c.seats,
        (SELECT image_url FROM car_images WHERE car_id = c.id ORDER BY display_order LIMIT 1) AS main_image,
        a.name AS agency_name
      FROM cars c
      LEFT JOIN agencies a ON c.agency_id = a.id
      WHERE c.is_available = TRUE
    `;

    const params = [];

    if (city) {
      query += ` AND LOWER(c.city) = LOWER($1)`;
      params.push(city);
    }

    query += ` ORDER BY c.created_at DESC LIMIT 50`;

    const result = await db.query(query, params);

    // Adapter les données pour le frontend - getAvailableCars retourne une structure simplifiée
    const adaptedCars = result.rows.map(car => ({
      _id: car.id,
      title: car.title,
      city: car.city,
      bodyType: car.body_type,
      price: {
        rent: car.price_rent || 0,
        sale: 0,
      },
      specs: {
        transmission: car.transmission || '',
        seats: car.seats || 0,
        fuelType: car.fuel_type || '',
      },
      images: car.main_image ? [car.main_image] : [],
      agency: {
        name: car.agency_name || '',
      },
    }));

    res.status(200).json({
      success: true,
      cars: adaptedCars,
      total: adaptedCars.length,
    });
  } catch (error) {
    console.error("❌ Error in getAvailableCars:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des voitures disponibles",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getCarsByAgency,
  searchCars,
  getAvailableCars,
};
