import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const generateSessionTokens = () => {
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + THIRTY_DAYS);

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

export const registerUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) throw createHttpError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const newUser = await User.create({ ...payload, password: hashedPassword });
  return newUser;
};

export async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new createHttpError.Unauthorized('Email is incorrect');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new createHttpError.Unauthorized('Password is incorrect');
  }

  await Session.deleteOne({ userId: user._id });
  const {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  } = generateSessionTokens();

  const newSession = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
  };
}

export const refreshSession = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (!session || new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Session not found or expired');
  }
  await Session.deleteOne({ _id: session._id });
  const {
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  } = generateSessionTokens();
  const newSession = await Session.create({
    userId: session.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
  };
};

export const logoutUser = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (session) {
    await Session.deleteOne({ _id: session._id });
  }
  return { message: 'User logged out successfully' };
};

export const sendResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const passwordResetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  const resetPasswordLink = `${process.env.APP_DOMAIN}/reset-password?token=${passwordResetToken}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset Request',
    text: `To reset your password, please click the following link: ${resetPasswordLink}`,
    html: `<p>To reset your password, please click the following link: <a href="${resetPasswordLink}">${resetPasswordLink}</a></p>
           <p>The link is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>`,
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

export const resetPassword = async (token, password) => {
  let decodedPayload;
  try {
    decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({ email: decodedPayload.email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const newHashedPassword = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(user._id, { password: newHashedPassword });
  await Session.deleteMany({ userId: user._id });
};
