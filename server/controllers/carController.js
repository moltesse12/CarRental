import { v2 as cloudinary } from "cloudinary";
import Car from "../models/Car.js";
import Agency from "../models/Agency.js";

// CREATE A NEW CAR [POST "/cars"]
export const addNewCar = async (req, res) => {
  try {
    const {
      title,
      description,
      city,
      country,
      address,
      odometer,
      bodyType,
      priceRent,
      priceSale,
      transmission,
      seats,
      fuelType,
      featured,
      features,
    } = req.body;

    const agency = await Agency.findOne({ owner: req.user._id });

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Upload images to Cloudinary
    const uploadedImages = req.files.map(async file => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    // Waiting for uploads to complete
    const images = await Promise.all(uploadedImages);

    await Car.create({
      agency: agency._id,
      title,
      description,
      city,
      country,
      address,
      odometer,
      bodyType,
      price: {
        rent: priceRent ? +priceRent : null,
        sale: priceSale ? +priceSale : null,
      },
      specs: {
        transmission,
        seats: +seats,
        fuelType,
      },

      features: JSON.parse(features),
      images,
    });
    res.status(201).json({ success: true, message: "New car added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// GET ALL AVAILABLE CARS [GET "/cars"]
export const getAllAvailableCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvailable: true }).populate({
      path: "agency",
      populate: { path: "owner", select: "image email" },
    });
    res.status(200).json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET CARS OF THE LOGGED IN AGENCY OWNER [GET "/owner"]

export const getOwnerCars = async (req, res) => {
  try {
    const agencyData = await Agency.findOne({ owner: req.user._id });
    const cars = await Car.find({ agency: agencyData._id.toString() }).populate("agency");
    res.status(200).json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// TOGGLE AVAILABILITY STATUS OF A CAR [POST "/cars/toggle-availability"]
export const toggleCarAvailability = async (req, res) => {
  try {
    const { carId } = req.body;
    const carData = await Car.findById(carId);
    carData.isAvailable = !carData.isAvailable;
    await carData.save();
    res
      .status(200)
      .json({ success: true, message: "Car availability status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
