import express from "express";
import { clerkMiddleware } from "@clerk/express";
import User from "../models/User.js";

const debugRouter = express.Router();

// Debug endpoint to check Clerk auth
debugRouter.get("/auth-info", clerkMiddleware(), async (req, res) => {
  try {
    const { userId } = req.auth;
    console.log("Auth info:", { userId, user: req.auth.user?.emailAddresses });

    if (!userId) {
      return res.json({ success: false, message: "No userId in auth", auth: req.auth });
    }

    const userInDb = await User.findById(userId);
    res.json({
      success: true,
      userId,
      userInDb: !!userInDb,
      clerkEmail: req.auth.user?.emailAddresses?.[0]?.emailAddress,
      dbUser: userInDb ? { username: userInDb.username, email: userInDb.email } : null,
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

export default debugRouter;
