// const { client } = require("../config/paypal");
// const Trip = require("../models/Trip");
// const Booking = require("../models/Booking");

// // 1️⃣ CREATE ORDER
// exports.createOrder = async (req, res) => {
//   try {
//     const { tripId, date, passenger } = req.body;

//     const trip = await Trip.findById(tripId);
//     if (!trip) return res.status(404).json({ message: "Trip not found" });

//     const age = Number(passenger.age);
//     const price = age > 0 && age < 16 ? 50 : trip.basePrice;

//     const request = {
//       intent: "CAPTURE",
//       purchase_units: [
//         {
//           amount: { currency_code: "USD", value: price }
//         }
//       ]
//     };

//     const order = await client.execute(
//       new (require("@paypal/checkout-server-sdk").orders.OrdersCreateRequest)()
//         .setRequestBody(request)
//     );

//     res.json({
//       orderId: order.result.id,
//       amount: price
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "PayPal order creation failed" });
//   }
// };

// // 2️⃣ CAPTURE PAYMENT & SAVE BOOKING
// exports.captureOrder = async (req, res) => {
//   try {
//     const { orderId, tripId, date, passenger } = req.body;

//     // ---- CAPTURE ----
//     const captureReq =
//       new (require("@paypal/checkout-server-sdk").orders.OrdersCaptureRequest)(orderId);

//     captureReq.requestBody({});
//     const capture = await client.execute(captureReq);

//     if (!capture.result.purchase_units)
//       return res.status(400).json({ message: "Payment failed" });

//     // ---- SAVE BOOKING ----
//     const trip = await Trip.findById(tripId);
//     const age = Number(passenger.age);
//     const price = age > 0 && age < 16 ? 50 : trip.basePrice;

//     const booking = await Booking.create({
//       trip: tripId,
//       date,
//       passenger,
//       pricePaid: price
//     });

//     res.json({
//       message: "Payment captured & booking saved",
//       booking
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "PayPal capture failed" });
//   }
// };
import paypal from "@paypal/checkout-server-sdk";
import Trip from "../models/tripModel.js";

// PayPal Environment
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { tripId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const price = trip.basePrice.toFixed(2);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price,
          },
        },
      ],
    });

    const order = await client.execute(request);

    res.json({
      orderId: order.result.id,
      amount: price,
    });

  } catch (err) {
    console.error("PAYPAL CREATE ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// CAPTURE ORDER
export const captureOrder = async (req, res) => {
  try {
    const { orderId, tripId, date, passenger } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    // Here you save booking in DB
    const booking = {
      tripId,
      date,
      passenger,
      paymentId: capture.result.id,
      status: "paid",
    };

    res.json({ booking });
  } catch (err) {
    console.error("PAYPAL CAPTURE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
