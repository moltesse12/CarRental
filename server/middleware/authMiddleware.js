import User from "../models/User.js";

export const authUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    let user = await User.findById(userId);

    // If user doesn't exist, create it from Clerk data
    if (!user) {
      try {
        const clerkUser = req.auth;
        user = await User.create({
          _id: userId,
          username: clerkUser.user?.firstName
            ? `${clerkUser.user.firstName} ${clerkUser.user.lastName || ""}`.trim()
            : "User",
          email: clerkUser.user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com",
          image: clerkUser.user?.imageUrl || "https://via.placeholder.com/150",
          role: "user",
          recentSearchedCities: [],
        });
        console.log("✓ User created from Clerk:", userId);
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.json({ success: false, message: "Failed to create user" });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth error:", error);
    res.json({ success: false, message: error.message });
  }
};
