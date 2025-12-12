import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    // Creating a Svix instance
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    // Get Headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // When using express.raw for this route, req.body is a Buffer containing the raw JSON.
    // We must verify the raw body exactly as received by Svix.
    const rawBody = req.body && typeof req.body !== "string" ? req.body.toString() : req.body;

    // Verify the Headers and raw body
    await whook.verify(rawBody, headers);

    // Parse the payload after successful verification
    const payload = typeof rawBody === "string" ? JSON.parse(rawBody) : req.body;
    const { data, type } = payload;

    // Switch case for different Events
    switch (type) {
      case "user.created": {
        // defensively extract fields from Clerk payload
        const email = data?.email_addresses?.[0]?.email_address || data?.primary_email_address || "";
        const firstName = data?.first_name || "";
        const lastName = data?.last_name || "";
        const username = (firstName + " " + lastName).trim() || data?.username || email || "Utilisateur";
        const image = data?.image_url || "";

        const userData = {
          _id: data.id,
          email,
          username,
          image,
        };

        // Create user if not exists (avoid duplicate key error)
        try {
          const existing = await User.findById(data.id);
          if (!existing) await User.create(userData);
        } catch (err) {
          console.log("Error creating Clerk user:", err.message);
        }

        break;
      }

      case "user.update": {
        const email = data?.email_addresses?.[0]?.email_address || data?.primary_email_address || "";
        const firstName = data?.first_name || "";
        const lastName = data?.last_name || "";
        const username = (firstName + " " + lastName).trim() || data?.username || email || "Utilisateur";
        const image = data?.image_url || "";

        const userData = {
          username,
          email,
          image,
        };

        try {
          await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
        } catch (err) {
          console.log("Error updating Clerk user:", err.message);
        }

        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }
      default:
        break;
    }
    res.json({ success: true, message: "Webhook Receveid" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
