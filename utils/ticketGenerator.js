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

      // ===========================================
      // COLORS & BRANDING
      // ===========================================
      const primary = "#1a73e8"; // blue
      const dark = "#222";
      const gray = "#555";

      // ===========================================
      // HEADER
      // ===========================================
      doc
        .image("https://i.ibb.co/vv11Vmdf/visit-my-sheep-logo-high.webp", 40, 30, { width: 80 })
        .fillColor(primary)
        .fontSize(26)
        .text("Visit My Sheep Transportation", 130, 40)
        .fillColor(gray)
        .fontSize(12)
        .text("Official Travel Ticket", 130, 70);

      doc.moveDown(2);
      doc.moveTo(40, 110).lineTo(550, 110).strokeColor(primary).stroke();

      // ===========================================
      // QR CODE (LARGE + CENTER)
      // ===========================================
      const qrData = `BOOKING:${booking._id}`;
      const qrImage = await QRCode.toDataURL(qrData);

      doc.image(qrImage, 400, 140, { width: 150 });

      // ===========================================
      // TICKET DETAILS SECTION
      // ===========================================
      doc
        .fillColor(dark)
        .fontSize(18)
        .text("Passenger Information", 40, 140);

      doc
        .fontSize(12)
        .fillColor(gray)
        .text(`Full Name: `, 40, 170)
        .fillColor(dark)
        .text(booking.passenger.fullName, 150, 170);

      doc
        .fillColor(gray)
        .text(`Email: `, 40, 190)
        .fillColor(dark)
        .text(booking.passenger.email, 150, 190);

      doc
        .fillColor(gray)
        .text(`Phone: `, 40, 210)
        .fillColor(dark)
        .text(booking.passenger.phone, 150, 210);

      doc
        .fillColor(gray)
        .text(`Gender: `, 40, 230)
        .fillColor(dark)
        .text(booking.passenger.gender, 150, 230);

      doc
        .fillColor(gray)
        .text(`Age: `, 40, 250)
        .fillColor(dark)
        .text(booking.passenger.age, 150, 250);

      // ===========================================
      // TRIP DETAILS
      // ===========================================
      doc
        .fillColor(primary)
        .fontSize(18)
        .text("Trip Details", 40, 300);

      doc
        .fontSize(12)
        .fillColor(gray)
        .text(`Trip Name: `, 40, 330)
        .fillColor(dark)
        .text(booking.trip.name, 150, 330);

      doc
        .fillColor(gray)
        .text(`Trip Time: `, 40, 350)
        .fillColor(dark)
        .text(booking.trip.time, 150, 350);

      doc
        .fillColor(gray)
        .text(`Travel Date: `, 40, 370)
        .fillColor(dark)
        .text(booking.date, 150, 370);

      doc
        .fillColor(gray)
        .text(`Amount Paid: `, 40, 390)
        .fillColor(primary)
        .fontSize(16)
        .text(`$${booking.pricePaid}`, 150, 388);

      // ===========================================
      // FOOTER
      // ===========================================
      doc.moveDown(3);
      doc
        .fontSize(10)
        .fillColor(gray)
        .text(
          "Please show this ticket to the bus conductor. QR code must be scannable.",
          40,
          460
        );

      doc
        .moveDown()
        .text(
          "Support: support@visitmysheep.com | Phone: +1 (555) 123-4567",
          40,
          480
        );

      doc
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
