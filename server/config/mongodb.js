import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/CarRental`);
    console.log("✅ Database Connected");
  } catch (error) {
    console.log("❌ Database Connection Error", error.message);
  }
};

export default connectDB;
