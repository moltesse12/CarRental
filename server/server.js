import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connexion DB
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/bookings", bookingRoutes);

// Gestion erreurs 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





















































// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import connectDB from "./configs/db.js";
// import userRouter from "./routes/userRoutes.js";
// import ownerRouter from "./routes/ownerRoutes.js"
// import bookingRouter from "./routes/bookingRoutes.js"

// //Iniitialize express app
// const app = express();

// //Connect to Database
// await connectDB();

// //Middlewares
// app.use(cors());
// app.use(express.json());


// app.get("/", (req, res) => res.send("Server is running"));
// app.use("/api/user", userRouter);
// app.use("/api/owner",ownerRouter)
// app.use("/api/booking", bookingRouter);

// //Start the server

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
