const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

module.exports.generateTicketPDF = async (booking) => {
  const ticketId = booking._id.toString();

  // 📌 QR DATA (what conductor sees)
  const qrData = JSON.stringify({
    bookingId: ticketId,
    name: booking.passenger.fullName,
    trip: booking.trip.name,
    date: booking.date,
    phone: booking.passenger.phone
  });

  // Generate QR as DataURL
  const qrImage = await QRCode.toDataURL(qrData);

  // Output path
  const filePath = path.join(__dirname, `../tickets/ticket_${ticketId}.pdf`);

  // Create folder if missing
  if (!fs.existsSync(path.join(__dirname, "../tickets"))) {
    fs.mkdirSync(path.join(__dirname, "../tickets"));
  }

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  // === HEADER ===
  doc.fontSize(22).text("Visit My Sheep Transport", { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text("Booking Ticket", { align: "center" });
  doc.moveDown(2);

  // === PASSENGER DETAILS ===
  doc.fontSize(14).text(`Passenger Name: ${booking.passenger.fullName}`);
  doc.text(`Email: ${booking.passenger.email}`);
  doc.text(`Phone: ${booking.passenger.phone}`);
  doc.text(`Gender: ${booking.passenger.gender}`);
  doc.text(`Age: ${booking.passenger.age}`);
  doc.moveDown();

  // === TRIP DETAILS ===
  doc.text(`Trip: ${booking.trip.name}`);
  doc.text(`Date: ${booking.date}`);
  doc.text(`Ticket Price: $${booking.pricePaid}`);
  doc.moveDown();

  // === QR CODE ===
  doc.text("Scan this QR for verification:", { align: "center" });
  doc.image(Buffer.from(qrImage.split(",")[1], "base64"), {
    fit: [200, 200],
    align: "center",
  });

  doc.end();

  return filePath;
};
