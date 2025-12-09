 require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const tripRoutes = require("./routes/tripRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paypalRoutes = require("./routes/paypalRoutes");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://visitmysheeptransportation.netlify.app",
      "https://visitmysheeptransportatadmin.netlify.app"
    ],
    credentials: true
  })
);

// ⭐ NEW — Serve tickets folder publicly for PDF downloads
app.use("/tickets", express.static(path.join(__dirname, "tickets")));

const PORT = process.env.PORT || 8080;
connectDB(process.env.MONGO_URI);

app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/paypal", paypalRoutes);

app.get("/", (req, res) => res.send("Sheep Transport API is running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
