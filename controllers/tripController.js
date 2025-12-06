const Trip = require("../models/Trip");

exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({});
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
