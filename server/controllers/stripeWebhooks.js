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
