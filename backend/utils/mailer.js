import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const sendMail = async (email, pdfPath) => {
  // Validate PDF exists
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found at path: ${pdfPath}`);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'darshit02736@gmail.com',  // Fixed email address (removed extra @)
      pass: 'Shadow,07012006'          // You'll need to replace this with an App Password
    },
  });

  const mailOptions = {
    from: 'darshit02736@gmail.com',    // Same as auth.user
    to: email,
    subject: 'Your Ticket',
    text: 'Here is your ticket PDF.',
    attachments: [{ 
      filename: path.basename(pdfPath),
      path: pdfPath 
    }],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
