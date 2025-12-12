import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoute.js";
import agencyRouter from "./routes/agencyRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import carRouter from "./routes/carRoute.js";
import bookingRouter from "./routes/bookingRoute.js";
// import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// Connect to Database and Cloudinary

await connectDB();
await connectCloudinary();

// initialize Express
const app = express();
// Enable Cors Origin Ressource sharing
app.use(cors());

// API to listen stripe Webhooks
{
  /*app.post('/api/stripe',express({type:"application/json"}), stripeWebhooks)
   */
}
// API to listen to Clerk Webhooks
// Register the raw body route BEFORE express.json() so the raw payload is available for Svix verification.
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Middleware for other routes
app.use(express.json());
app.use(clerkMiddleware());

// Define API Route
app.use("/api/user", userRouter);
app.use("/api/agencies", agencyRouter);
app.use("/api/cars", carRouter);
app.use("/api/bookings", bookingRouter);

// Route Endpoint to Check API status
app.get("/", (req, res) => res.send("Mr Folly your API Succeessfully Connected"));

// Define server port
const port = process.env.PORT || 4000;

// Start the Server
app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
