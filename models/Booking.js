const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  date: { type: String, required: true }, // ISO YYYY-MM-DD
  passenger: {
    fullName: String,
    email: String,
    phone: String,
    gender: String,
    age: Number,
  },
  pricePaid: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
