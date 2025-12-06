const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, required: true },
  basePrice: { type: Number, required: true },
  durationHours: { type: Number, default: 2 },
  // add any extra fields
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);
