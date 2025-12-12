import mongoose from "mongoose";
import "dotenv/config";
import Car from "./models/Car.js";

async function cleanCars() {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/CarRental`);
    console.log("Connected to MongoDB");

    const result = await Car.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} cars`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

cleanCars();
