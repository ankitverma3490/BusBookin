const paypal = require("@paypal/checkout-server-sdk");
const { client } = require("../config/paypal");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const { generateTicketPDF } = require("../utils/ticketGenerator");

// --------------------------------------------------
// 1️⃣ CREATE PAYPAL ORDER
// --------------------------------------------------
exports.createOrder = async (req, res) => {
  try {
    const { tripId, passenger } = req.body;

    if (!tripId) {
      return res.status(400).json({ message: "tripId is required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Calculate price
    const age = Number(passenger?.age);
    const childPrice = age > 0 && age < 16 ? 50 : trip.basePrice;

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: childPrice.toFixed(2),
          },
        },
      ],
    });

    const order = await client.execute(request);

    return res.json({
      orderId: order.result.id,
      amount: childPrice,
    });

  } catch (err) {
    console.error("❌ PayPal Create Order Error:", err);
    return res.status(500).json({
      message: "PayPal order creation failed",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// 2️⃣ CAPTURE PAYMENT + SAVE BOOKING
// --------------------------------------------------
// exports.captureOrder = async (req, res) => {
//   try {
//     const { orderId, tripId, date, passenger } = req.body;

//     if (!orderId) {
//       return res.status(400).json({ message: "orderId is required" });
//     }

//     const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
//     captureRequest.requestBody({});

//     const capture = await client.execute(captureRequest);

//     if (!capture.result ||
//         !capture.result.purchase_units ||
//         capture.result.status !== "COMPLETED") 
//     {
//       return res.status(400).json({ message: "Payment not completed" });
//     }

//     // Fetch trip again
//     const trip = await Trip.findById(tripId);
//     if (!trip) {
//       return res.status(404).json({ message: "Trip not found" });
//     }

//     const age = Number(passenger.age);
//     const price = age > 0 && age < 16 ? 50 : trip.basePrice;

//     // Save booking
//     const booking = await Booking.create({
//       trip: tripId,
//       date,
//       passenger,
//       pricePaid: price,
//       paymentId: capture.result.id,
//       paymentStatus: "PAID"
//     });

//     return res.json({
//       message: "Payment captured and booking saved",
//       booking,
//     });

//   } catch (err) {
//     console.error("❌ PayPal Capture Error:", err);
//     return res.status(500).json({
//       message: "PayPal capture failed",
//       error: err.message,
//     });
//   }
// };
exports.captureOrder = async (req, res) => {
  try {
    const { orderId, tripId, date, passenger } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }
    if (!tripId || !date || !passenger) {
      return res.status(400).json({ message: "Missing booking fields" });
    }

    // -------------------------------
    // 1️⃣ CAPTURE PAYMENT
    // -------------------------------
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({}); // required but empty

    const capture = await client.execute(captureRequest);

    if (
      !capture.result ||
      capture.result.status !== "COMPLETED"
    ) {
      return res.status(400).json({
        message: "Payment not completed",
        paypalStatus: capture.result?.status,
      });
    }

    // -------------------------------
    // 2️⃣ VALIDATE TRIP & PRICE LOGIC
    // -------------------------------
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const age = Number(passenger.age);
    const price = age > 0 && age <= 15 ? 50 : trip.basePrice;

    // -------------------------------
    // 3️⃣ SAVE BOOKING IN DATABASE
    // -------------------------------
    const booking = await Booking.create({
      trip: tripId,
      date,
      passenger,
      pricePaid: price,
      paymentId: capture.result.id,
      paymentStatus: "PAID",
    });

    await booking.populate("trip");

    // -------------------------------
    // 4️⃣ GENERATE PDF TICKET + QR
    // -------------------------------
    const pdfPath = await generateTicketPDF(booking);

    const ticketUrl = `${process.env.BASE_URL}/tickets/${pdfPath.split("tickets/")[1]}`;

    // -------------------------------
    // 5️⃣ SEND RESPONSE
    // -------------------------------
    return res.json({
      message: "Payment captured and booking saved",
      booking,
      ticketUrl, // ⬅ Frontend shows “Download Ticket”
    });

  } catch (err) {
    console.error("❌ PayPal Capture Error:", err);
    return res.status(500).json({
      message: "PayPal capture failed",
      error: err.message,
    });
  }
};