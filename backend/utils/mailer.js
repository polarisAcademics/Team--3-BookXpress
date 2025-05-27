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
      user: 'demoirctc903@gmail.com',  
      pass: 'wtmhbwtmsheksarl'     
    },
  });

  const mailOptions = {
    from: 'demoirctc903@gmail.com',    
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
