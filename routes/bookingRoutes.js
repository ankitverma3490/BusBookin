// const express = require("express");
// const router = express.Router();
// const { createBooking, getBookings } = require("../controllers/bookingController");

// router.post("/", createBooking);
// router.get("/", getBookings);

// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  verifyTicket
} = require("../controllers/bookingController");

// Create booking (non-paypal flow)
router.post("/", createBooking);

// Get all bookings (admin use)
router.get("/", getBookings);

// Get single booking by ID
router.get("/:id", getBookingById);

// Verify ticket by QR (bus conductor scan)
router.get("/verify/:bookingId", verifyTicket);

module.exports = router;
