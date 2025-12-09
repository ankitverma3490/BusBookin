// const PDFDocument = require("pdfkit");
// const QRCode = require("qrcode");
// const fs = require("fs");
// const path = require("path");

// module.exports.generateTicketPDF = async (booking) => {
//   const ticketId = booking._id.toString();

//   // 📌 QR DATA (what conductor sees)
//   const qrData = JSON.stringify({
//     bookingId: ticketId,
//     name: booking.passenger.fullName,
//     trip: booking.trip.name,
//     date: booking.date,
//     phone: booking.passenger.phone
//   });

//   // Generate QR as DataURL
//   const qrImage = await QRCode.toDataURL(qrData);

//   // Output path
//   const filePath = path.join(__dirname, `../tickets/ticket_${ticketId}.pdf`);

//   // Create folder if missing
//   if (!fs.existsSync(path.join(__dirname, "../tickets"))) {
//     fs.mkdirSync(path.join(__dirname, "../tickets"));
//   }

//   const doc = new PDFDocument();
//   doc.pipe(fs.createWriteStream(filePath));

//   // === HEADER ===
//   doc.fontSize(22).text("Visit My Sheep Transport", { align: "center" });
//   doc.moveDown();
//   doc.fontSize(16).text("Booking Ticket", { align: "center" });
//   doc.moveDown(2);

//   // === PASSENGER DETAILS ===
//   doc.fontSize(14).text(`Passenger Name: ${booking.passenger.fullName}`);
//   doc.text(`Email: ${booking.passenger.email}`);
//   doc.text(`Phone: ${booking.passenger.phone}`);
//   doc.text(`Gender: ${booking.passenger.gender}`);
//   doc.text(`Age: ${booking.passenger.age}`);
//   doc.moveDown();

//   // === TRIP DETAILS ===
//   doc.text(`Trip: ${booking.trip.name}`);
//   doc.text(`Date: ${booking.date}`);
//   doc.text(`Ticket Price: $${booking.pricePaid}`);
//   doc.moveDown();

//   // === QR CODE ===
//   doc.text("Scan this QR for verification:", { align: "center" });
//   doc.image(Buffer.from(qrImage.split(",")[1], "base64"), {
//     fit: [200, 200],
//     align: "center",
//   });

//   doc.end();

//   return filePath;
// };
 const PDFDocument = require("pdfkit");
const fs = require("fs");
const QRCode = require("qrcode");
const axios = require("axios");

exports.generateTicketPDF = async (booking) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = `ticket_${booking._id}.pdf`;
      const outputPath = `tickets/${fileName}`;

      // Ensure tickets folder exists
      if (!fs.existsSync("tickets")) {
        fs.mkdirSync("tickets");
      }

      // Create PDF
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // COLORS
      const primary = "#1a73e8";
      const dark = "#222";
      const gray = "#555";

      // ===========================================
      // FETCH LOGO AS BUFFER (important!)
      // ===========================================
      const logoUrl = "https://i.ibb.co/vv11Vmdf/visit-my-sheep-logo-high.webp";

      let logoBuffer = null;
      try {
        const response = await axios.get(logoUrl, { responseType: "arraybuffer" });
        logoBuffer = Buffer.from(response.data, "binary");
      } catch (error) {
        console.error("Unable to download logo:", error);
      }

      // ===========================================
      // HEADER
      // ===========================================
      if (logoBuffer) {
        doc.image(logoBuffer, 40, 30, { width: 80 });
      }

      doc
        .fillColor(primary)
        .fontSize(26)
        .text("Visit My Sheep Transportation", 130, 40)
        .fillColor(gray)
        .fontSize(12)
        .text("Official Travel Ticket", 130, 70);

      doc.moveTo(40, 110).lineTo(550, 110).strokeColor(primary).stroke();

      // ===========================================
      // QR CODE
      // ===========================================
      const qrData = `BOOKING:${booking._id}`;
      const qrImage = await QRCode.toDataURL(qrData);

      doc.image(qrImage, 400, 140, { width: 150 });

      // ===========================================
      // PASSENGER DETAILS
      // ===========================================
      doc.fillColor(dark).fontSize(18).text("Passenger Information", 40, 140);

      const infoY = 170;
      const lineHeight = 20;

      const info = [
        ["Full Name", booking.passenger.fullName],
        ["Email", booking.passenger.email],
        ["Phone", booking.passenger.phone],
        ["Gender", booking.passenger.gender],
        ["Age", booking.passenger.age],
      ];

      info.forEach(([label, value], i) => {
        doc.fontSize(12).fillColor(gray).text(`${label}:`, 40, infoY + i * lineHeight);
        doc.fillColor(dark).text(value, 150, infoY + i * lineHeight);
      });

      // ===========================================
      // TRIP INFO
      // ===========================================
      doc.fillColor(primary).fontSize(18).text("Trip Details", 40, 300);

      const tripDetails = [
        ["Trip Name", booking.trip.name],
        ["Trip Time", booking.trip.time],
        ["Travel Date", booking.date],
        ["Amount Paid", `$${booking.pricePaid}`],
      ];

      tripDetails.forEach(([label, value], i) => {
        doc.fontSize(12).fillColor(gray).text(`${label}:`, 40, 330 + i * 20);
        doc.fillColor(dark).text(value, 150, 330 + i * 20);
      });

      // ===========================================
      // FOOTER
      // ===========================================
      doc
        .fontSize(10)
        .fillColor(gray)
        .text("Please show this ticket to the bus conductor. QR code must be scannable.", 40, 460)
        .text("Support: support@visitmysheep.com | Phone: +1 (555) 123-4567", 40, 480)
        .fillColor(primary)
        .text("Thank you for choosing Visit My Sheep Transportation!", 40, 510);

      doc.end();

      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};
