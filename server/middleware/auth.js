import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}


// export const protect = async (req, res, next) => {
//   const token = req.headers.authorization
//   if (!token) {
//     return res.json({ success: false, message: "No authorized" });
//   }
//   try {
//     const userId = jwt.decode(token, process.env.JWT_SECRET);
//     if (!userId) {
//       return res.json({ success: false, message: "Invalid token" });
//     }
//     req.user = await User.findById(userId).select("-password");
//     next();
//   } catch (error) {
//     res.json({ success: false, message: "Invalid token" });
//   }
// };

// export const protect = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.json({ success: false, message: "No authorized" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     if (!userId) {
//       return res.json({ success: false, message: "Invalid token" });
//     }
//     req.user = await User.findById(userId).select("-password");
//     next();
//   } catch (error) {
//     res.json({ success: false, message: "Invalid token" });
//   }
// };
