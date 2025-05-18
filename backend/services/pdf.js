import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePDF = async (ticket, outputPath) => {
  // Ensure temp directory exists
  const tempDir = path.dirname(outputPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    
    // Handle errors
    doc.on('error', reject);
    
    // Pipe the PDF to a file
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    
    // Add content to the PDF
    doc.fontSize(25).text('Event Ticket', 100, 80);
    doc.fontSize(12).text(`Name: ${ticket.name}`, 100, 120);
    doc.fontSize(12).text(`Email: ${ticket.email}`, 100, 140);
    doc.fontSize(12).text(`Ticket ID: ${ticket.id}`, 100, 160);
    doc.fontSize(12).text(`Event: ${ticket.event}`, 100, 180);
    doc.fontSize(12).text(`Date: ${ticket.date}`, 100, 200);
    
    // Finalize the PDF
    doc.end();
    
    // Resolve when the stream is finished
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}; 