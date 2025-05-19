import { generatePDF } from '../services/pdf.js';
import { sendMail } from '../utils/mailer.js';

export const sendTicket = async (req, res) => {
  const ticket = req.body;
  const pdfPath = 'ticket.pdf';

  generatePDF(ticket, pdfPath);

  try {
    await sendMail(ticket.email, pdfPath);
    res.status(200).json({ message: 'Ticket sent!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send ticket' });
  }
};
