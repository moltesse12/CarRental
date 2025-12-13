import db from "../config/database.js";

export const authUser = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // Récupérer l'utilisateur depuis PostgreSQL
    let userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    let user;

    // If user doesn't exist, create it from Clerk data
    if (userResult.rows.length === 0) {
      try {
        const clerkUser = req.auth;
        const username = clerkUser.user?.firstName
          ? `${clerkUser.user.firstName} ${clerkUser.user.lastName || ""}`.trim()
          : "User";
        const email = clerkUser.user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com";
        const image = clerkUser.user?.imageUrl || "https://via.placeholder.com/150";

        const insertResult = await db.query(
          `INSERT INTO users (id, username, email, image, role)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [userId, username, email, image, "user"]
        );

        user = insertResult.rows[0];
        console.log("✓ User created from Clerk:", userId);
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.json({ success: false, message: "Failed to create user" });
      }
    } else {
      user = userResult.rows[0];
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth error:", error);
    res.json({ success: false, message: error.message });
  }
};
