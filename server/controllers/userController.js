// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/userModel.js";

// Generate JWT Token
// const generateToken = userId => {
//   const payload = userId;
//   return jwt.sign(payload, process.env.JWT_SECRET);
// };

// ...existing code...
// const generateToken = userId => {
//   const payload = { id: userId };
//   return jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || "7d",
//   });
// };
// // ...existing code...
// export const registerUser = async (req, res) => {
//   try {
//     console.log("register body:", req.body);
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ success: false, message: "Provide name, email and password" });
//     }

//     if (password.length < 8) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Password must be at least 8 characters" });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(409).json({ success: false, message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashedPassword });
//     const token = generateToken(user._id.toString());

//     // remove password before sending
//     const userResponse = { id: user._id, name: user.name, email: user.email };

//     res.status(201).json({
//       success: true,
//       token,
//       user: userResponse,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// // ...existing code...

// export const registerUser = async (req, res) => {
//   try {

//     const { name, email, password } = req.body;

//     if (!name || !email || !password || password.length < 8) {
//       return res.json({ success: false, message: "Fill all the fields" });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.json({ success: false, message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashedPassword });
//     const token = generateToken(user._id.toString());
//     res.json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Login User

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.json({ success: false, message: "User does not exist" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.json({ success: false, message: "Incorrect Password" });
//     }
//     const token = generateToken(user._id.toString());
//     res.json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Cars from "../models/Car.js";

// ✅ Créer JWT
const createToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // ✅ Validation input
    if (!email || !password || !name) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // ✅ Vérifier doublon
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // ✅ Hasher password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    const token = createToken(newUser._id);
    res.json({
      success: true,
      token,
      user: { id: newUser._id, name, email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET user data using Token (JWT)

export const getUserData = async (req, res) => {
  try {
    const { user } = req;
    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get All Cars for the frontend
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvailiable: true });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
