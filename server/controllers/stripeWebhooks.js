// import stripe from 'stripe'
// import Booking from "../models/Bookings.js"


// // handle Stripe Webhooks
// export const stripeWebhooks = async (Request,response)={
//   // Stripe Gateway initialize
//   const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
//   const sig = Request.headers['stripe-signature']
//   let event;
//   try {
//     event = stripeInstance.webhooks.constructEvent(request.body,sig,,process.env.STRIPE_WEBHOOK_SECRET)
//   } catch (error) {
//     response.status(400).send(`Webhooks Error:${erro.message}`)
//   }

//   if(event.type === 'payment_intent.succeeded'){
//     const payment_intent = event.data.object
//     const payment_intentId = payment_intent.id

//     // Getting Session metadata
//     const session = await stripeInstance.checkout.sessions.list({
//       payment_intent: payment_intentId
//     })
//     const {bookingId} = session.data[0].metadata

//     // Mark payment as Paid
//     await Booking.findByIdAndUpdate(bookingId,{isPaid:true, paymentMethod:"Stripe"})

//   }else{
//     console.log("Unhandled event type:",event.type)
//   }
//   response.json({received:true})
// }




// server/webhooks/stripeWebhooks.js
import Stripe from 'stripe';
import db from '../config/database.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;

        if (bookingId) {
          // Marquer la réservation comme payée
          await db.query(
            `UPDATE bookings
             SET is_paid = TRUE,
                 status = 'confirmed',
                 payment_method = 'Stripe',
                 updated_at = NOW()
             WHERE id = $1`,
            [bookingId]
          );

          console.log('✅ Booking paid and confirmed:', bookingId);
          // Le trigger handle_car_availability() marquera automatiquement
          // la voiture comme indisponible
        }
        break;

      case 'payment_intent.payment_failed':
        const failed = event.data.object;
        const failedBookingId = failed.metadata.bookingId;

        if (failedBookingId) {
          await db.query(
            `UPDATE bookings
             SET status = 'cancelled',
                 updated_at = NOW()
             WHERE id = $1`,
            [failedBookingId]
          );

          console.log('❌ Payment failed for booking:', failedBookingId);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};
