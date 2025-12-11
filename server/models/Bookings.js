import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    car: { type: String, ref: "Car", required: true },
    agency: { type: String, ref: "Agency", required: true },
    pickUpDate: { type: Date, required: true },
    dropOffDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentMethode: { type: String, required: true, default: "Pay at pick up" },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
