const express = require("express");
const router = express.Router();
const { getTrips, getTripById } = require("../controllers/tripController");

router.get("/", getTrips);
router.get("/:id", getTripById);

module.exports = router;
