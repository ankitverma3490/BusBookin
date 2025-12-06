const Booking = require("../models/Booking");
const Trip = require("../models/Trip");

exports.createBooking = async (req, res) => {
  try {
    const { tripId, date, passenger } = req.body;
    if (!tripId || !date || !passenger) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // price logic: child <16 -> 50 else trip.basePrice
    const age = Number(passenger.age || 0);
    const isChild = age > 0 && age < 16;
    const pricePaid = isChild ? 50 : trip.basePrice;

    const booking = new Booking({
      trip: trip._id,
      date,
      passenger,
      pricePaid,
    });

    await booking.save();

    res.status(201).json({ booking, message: "Booking created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate("trip");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
