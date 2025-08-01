import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html: htmlContent,
    text: htmlContent.replace(/<[^>]+>/g, ''),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
