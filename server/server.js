import express from "express";
import cors from "cors";
import "dotenv/config";
import db from './config/database.js';
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoute.js";
import agencyRouter from "./routes/agencyRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import carRouter from "./routes/carRoute.js";
import bookingRouter from "./routes/bookingRoute.js";
// import { stripeWebhooks } from "./controllers/stripeWebhooks.js"; // Commenté car non utilisé actuellement

// Tester la connexion PostgreSQL au démarrage
try {
  await db.testConnection();
} catch (error) {
  console.error('❌ Erreur lors du test de connexion PostgreSQL:', error.message);
  // Ne pas arrêter le serveur, continuer quand même
}

// Connect to Cloudinary
try {
  await connectCloudinary();
  console.log('✅ Cloudinary configuré');
} catch (error) {
  console.error('❌ Erreur lors de la configuration Cloudinary:', error.message);
  // Ne pas arrêter le serveur, continuer quand même
}

// initialize Express
const app = express();
// Enable Cors Origin Ressource sharing
app.use(cors());

// Fermer proprement à l'arrêt
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu, fermeture...');
  await db.closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT reçu, fermeture...');
  await db.closePool();
  process.exit(0);
});

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
