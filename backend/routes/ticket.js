import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendMail } from '../utils/mailer.js';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get the correct logo path
const logoPath = path.join(__dirname, '../../public/logo.png');

router.post('/send-ticket', async (req, res) => {
  const { email, ticketDetails } = req.body;
  if (!email || !ticketDetails) {
    return res.status(400).json({ success: false, message: 'Email and ticket details are required.' });
  }

  try {
    // 1. Generate PDF
    const doc = new PDFDocument({ margin: 40 });
    const pdfPath = path.join(uploadsDir, `ticket_${Date.now()}.pdf`);
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Draw a border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(2)
      .strokeColor('#007bff')
      .stroke();

    // Add logo if it exists
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 60, 40, { width: 120, align: 'center' });
      doc.moveDown(2);
    }

    // Title
    doc
      .fontSize(26)
      .fillColor('#007bff')
      .font('Helvetica-Bold')
      .text('Your BookXpress Ticket', { align: 'center' })
      .moveDown(1.5);

    // Draw a line under the title
    doc
      .moveTo(60, doc.y)
      .lineTo(doc.page.width - 60, doc.y)
      .lineWidth(1)
      .strokeColor('#007bff')
      .stroke();

    doc.moveDown(1.5);

    // Ticket details (nicely formatted)
    doc.fontSize(14).fillColor('#222').font('Helvetica');

    const addDetail = (label, value) => {
      doc
        .font('Helvetica-Bold')
        .text(`${label}: `, { continued: true })
        .font('Helvetica')
        .text(value)
        .moveDown(0.5);
    };

    addDetail('PNR', ticketDetails.PNR);
    addDetail('Booking ID', ticketDetails['Booking ID']);
    addDetail('Train', ticketDetails.Train);
    addDetail('Class', ticketDetails.Class);
    addDetail('Date', ticketDetails.Date);
    addDetail('Passengers', ticketDetails.Passengers);
    addDetail('Contact Name', ticketDetails['Contact Name']);
    addDetail('Contact Email', ticketDetails['Contact Email']);
    addDetail('Contact Phone', ticketDetails['Contact Phone']);
    addDetail('Contact Address', ticketDetails['Contact Address']);
    addDetail('Total Amount', ticketDetails['Total Amount']);
    addDetail('Payment ID', ticketDetails['Payment ID']);
    addDetail('Status', ticketDetails.Status);
    addDetail('Booking Date', ticketDetails['Booking Date']);

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor('#888')
      .text('Thank you for booking with BookXpress!', { align: 'center' });

    doc.end();

    // Wait for PDF generation to complete
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // 2. Send Email using mailer utility
    await sendMail(email, pdfPath);

    // 3. Clean up
    fs.unlinkSync(pdfPath);

    res.json({ success: true, message: 'Ticket sent to email!' });
  } catch (err) {
    console.error('Error in send-ticket route:', err);
    res.status(500).json({ success: false, message: 'Failed to process ticket', error: err.message });
  }
});

export default router;