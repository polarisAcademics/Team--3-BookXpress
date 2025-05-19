const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generatePDF = (ticketInfo, path) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(path));
  doc.fontSize(20).text("Ticket Information", { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Name: ${ticketInfo.name}`);
  doc.text(`Ticket ID: ${ticketInfo.id}`);
  doc.text(`Event: ${ticketInfo.event}`);
  doc.text(`Date: ${ticketInfo.date}`);
  doc.end();
};
