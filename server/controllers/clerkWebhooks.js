// import User from "../models/User.js";
// import { Webhook } from "svix";

// const clerkWebhooks = async (req, res) => {
//   try {
//     // Creating a Svix instance
//     const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
//     // Get Headers
//     const headers = {
//       "svix-id": req.headers["svix-id"],
//       "svix-timestamp": req.headers["svix-timestamp"],
//       "svix-signature": req.headers["svix-signature"],
//     };

//     // When using express.raw for this route, req.body is a Buffer containing the raw JSON.
//     // We must verify the raw body exactly as received by Svix.
//     const rawBody = req.body && typeof req.body !== "string" ? req.body.toString() : req.body;

//     // Verify the Headers and raw body
//     await whook.verify(rawBody, headers);

//     // Parse the payload after successful verification
//     const payload = typeof rawBody === "string" ? JSON.parse(rawBody) : req.body;
//     const { data, type } = payload;

//     // Switch case for different Events
//     switch (type) {
//       case "user.created": {
//         // defensively extract fields from Clerk payload
//         const email = data?.email_addresses?.[0]?.email_address || data?.primary_email_address || "";
//         const firstName = data?.first_name || "";
//         const lastName = data?.last_name || "";
//         const username = (firstName + " " + lastName).trim() || data?.username || email || "Utilisateur";
//         const image = data?.image_url || "";

//         const userData = {
//           _id: data.id,
//           email,
//           username,
//           image,
//         };

//         // Create user if not exists (avoid duplicate key error)
//         try {
//           const existing = await User.findById(data.id);
//           if (!existing) await User.create(userData);
//         } catch (err) {
//           console.log("Error creating Clerk user:", err.message);
//         }

//         break;
//       }

//       case "user.update": {
//         const email = data?.email_addresses?.[0]?.email_address || data?.primary_email_address || "";
//         const firstName = data?.first_name || "";
//         const lastName = data?.last_name || "";
//         const username = (firstName + " " + lastName).trim() || data?.username || email || "Utilisateur";
//         const image = data?.image_url || "";

//         const userData = {
//           username,
//           email,
//           image,
//         };

//         try {
//           await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
//         } catch (err) {
//           console.log("Error updating Clerk user:", err.message);
//         }

//         break;
//       }

//       case "user.deleted": {
//         await User.findByIdAndDelete(data.id);
//         break;
//       }
//       default:
//         break;
//     }
//     res.json({ success: true, message: "Webhook Receveid" });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// export default clerkWebhooks;

// server/webhooks/clerkWebhooks.js
import db from '../config/database.js';
import { Webhook } from 'svix';

export const handleClerkWebhook = async (req, res) => {
  try {
    // Vérification Svix (seulement si le secret est configuré)
    let payload;

    if (process.env.CLERK_WEBHOOK_SECRET) {
      try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const headers = {
          "svix-id": req.headers["svix-id"],
          "svix-timestamp": req.headers["svix-timestamp"],
          "svix-signature": req.headers["svix-signature"],
        };

        // Le body est déjà un Buffer grâce à express.raw()
        const rawBody = req.body;

        // Vérifier la signature
        payload = whook.verify(rawBody, headers);
      } catch (verifyError) {
        console.error('❌ Svix verification failed:', verifyError.message);
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    } else {
      // En développement, accepter sans vérification (non recommandé en production)
      console.warn('⚠️ CLERK_WEBHOOK_SECRET not set, skipping verification');
      const rawBody = req.body;
      payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    }

    const { type, data } = payload;
    if (type === 'user.created') {
      // Extraire les données de Clerk
      const email = data?.email_addresses?.[0]?.email_address || data?.primary_email_address || '';
      const firstName = data?.first_name || '';
      const lastName = data?.last_name || '';
      const username = (firstName + ' ' + lastName).trim() || data?.username || email || 'User';
      const image = data?.image_url || 'https://via.placeholder.com/150';

      // Créer l'utilisateur dans PostgreSQL
      await db.query(
        `INSERT INTO users (id, username, email, image, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [data.id, username, email, image, 'user']
      );

      console.log('✅ User créé via Clerk:', data.id);
    }

    if (type === 'user.updated') {
      const email = data?.email_addresses?.[0]?.email_address || data?.primary_email_address || '';
      const firstName = data?.first_name || '';
      const lastName = data?.last_name || '';
      const username = (firstName + ' ' + lastName).trim() || data?.username || email || 'User';
      const image = data?.image_url || 'https://via.placeholder.com/150';

      await db.query(
        `UPDATE users
         SET username = $1, email = $2, image = $3, updated_at = NOW()
         WHERE id = $4`,
        [username, email, image, data.id]
      );
    }

    if (type === 'user.deleted') {
      // Vérifier dépendances avant suppression
      const checkBookings = await db.query(
        'SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status IN ($2, $3)',
        [data.id, 'pending', 'confirmed']
      );

      if (parseInt(checkBookings.rows[0].count) === 0) {
        await db.query('DELETE FROM users WHERE id = $1', [data.id]);
      } else {
        console.warn('⚠️ User has active bookings, skipping deletion');
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Clerk webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Export par défaut pour compatibilité avec server.js
const clerkWebhooks = handleClerkWebhook;
export default clerkWebhooks;
