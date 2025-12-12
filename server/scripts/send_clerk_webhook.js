import crypto from "crypto";
import process from "process";

// Fallback to node-fetch if global fetch not available (Node <18)
let fetchFn = global.fetch;
if (!fetchFn) {
  try {
    const mod = await import("node-fetch");
    fetchFn = mod.default;
  } catch (err) {
    console.error(
      "Fetch API not available and 'node-fetch' is not installed. Install node 18+ or run 'npm install node-fetch'."
    );
    process.exit(1);
  }
}

const secret = process.env.CLERK_WEBHOOK_SECRET || process.argv[2];
const url = process.argv[3] || "http://localhost:4000/api/clerk";
const eventId = process.argv[4] || `evt_test_${Date.now()}`;

if (!secret) {
  console.error(
    "Usage: set CLERK_WEBHOOK_SECRET or pass it as first arg.\nExample: CLERK_WEBHOOK_SECRET=whsec_xxx node send_clerk_webhook.js http://localhost:4000/api/clerk"
  );
  process.exit(1);
}

// Minimal Clerk user.created payload
const payload = {
  data: {
    id: `user_test_${Date.now()}`,
    email_addresses: [{ email_address: "test+webhook@example.com" }],
    first_name: "Webhook",
    last_name: "Tester",
    image_url: "",
  },
  type: "user.created",
};

const rawBody = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000).toString();
const toSign = `${timestamp}.${rawBody}`;

const sig = crypto.createHmac("sha256", secret).update(toSign).digest("hex");
const signatureHeader = `v1=${sig}`;

const headers = {
  "Content-Type": "application/json",
  "svix-id": eventId,
  "svix-timestamp": timestamp,
  "svix-signature": signatureHeader,
};

console.log("Sending signed webhook to:", url);
console.log("Event ID:", eventId);

try {
  const res = await fetchFn(url, { method: "POST", headers, body: rawBody });
  const text = await res.text();
  console.log("Response status:", res.status);
  console.log("Response body:\n", text);
} catch (err) {
  console.error("Error sending webhook:", err.message);
  process.exit(1);
}
