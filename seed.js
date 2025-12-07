require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Trip = require("./models/Trip");

const trips = [
  {   name: "Augusta State Medical Prison (Roundtrip)", time: "7:00 AM", basePrice: 100  },
   {  name: "Baldwin State Prison (Roundtrip)", time: "7:00 AM", basePrice: 100 },
  {  name: "Macon State Prison (Roundtrip)", time: "7:00 AM", basePrice: 100 },
  {  name: "Riverbend Correctional Facility (Roundtrip)", time: "7:00 AM", basePrice: 100 },
  {  name: "Georgia Diagnostic Prison (Roundtrip)", time: "7:00 AM", basePrice: 100 },
];
const run = async () => {
  await connectDB(process.env.MONGO_URI);
  await Trip.deleteMany({});
  await Trip.insertMany(trips);
  console.log("Seeded trips");
  mongoose.connection.close();
};

run().catch(err => console.error(err));

 