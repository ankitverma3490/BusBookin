require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Trip = require("./models/Trip");

const trips = [
  { name: "Macon State Prison (Roundtrip)", time: "7:00 AM", basePrice: 100 },
  { name: "Pine Ridge Outing (One-way)", time: "9:00 AM", basePrice: 80 }
];

const run = async () => {
  await connectDB(process.env.MONGO_URI);
  await Trip.deleteMany({});
  await Trip.insertMany(trips);
  console.log("Seeded trips");
  mongoose.connection.close();
};

run().catch(err => console.error(err));
