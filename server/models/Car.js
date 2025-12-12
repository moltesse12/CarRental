import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    odometer: { type: Number, required: true },
    bodyType: { type: String, required: true },
    price: {
      rent: { type: Number, required: true },
      sale: { type: Number, required: true },
    },
    specs: {
      transmission: { type: String, required: true },
      seats: { type: Number, required: true },
      fuelType: { type: String, required: true },
    },
    featured: { type: Boolean, default: false },
    features: [{ type: String }],
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);

export default Car;
