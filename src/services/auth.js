import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import {
  createAccessToken,
  createRefreshToken,
  createResetToken,
  verifyToken,
} from './jwt.js';
import { sendEmail } from './email.js';
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from '../utils/googleOAuth2.js';

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
    throw new createHttpError.Unauthorized('Email is incorrect.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new createHttpError.Unauthorized('Password is incorrect!');
  }

  await Session.deleteOne({ userId: user._id });
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const newSession = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
  });

  return {
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
  };
}

export const refreshSession = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (!session || new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Session not found or expired!');
  }

  await Session.deleteOne({ _id: session._id });
  const newAccessToken = createAccessToken(session.userId);
  const newRefreshToken = createRefreshToken(session.userId);

  const newSession = await Session.create({
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return {
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
    refreshTokenValidUntil: newSession.refreshTokenValidUntil,
  };
};

export const logoutUser = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (session) {
    await Session.deleteOne({ _id: session._id });
  }
  return { message: 'User logged out successfully.' };
};

export const sendResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }
  const passwordResetToken = createResetToken(email);
  const resetPasswordLink = `${process.env.APP_DOMAIN}/reset-password?token=${passwordResetToken}`;
  const htmlContent = `<p>To reset your password, please click the following link: <a href="${resetPasswordLink}">${resetPasswordLink}</a></p>
                       <p>The link is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>`;

  await sendEmail(email, 'Password Reset Request', htmlContent);
};

export const resetPassword = async (token, password) => {
  const decodedPayload = verifyToken(token);
  const user = await User.findOne({ email: decodedPayload.email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const newHashedPassword = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(user._id, { password: newHashedPassword });
  await Session.deleteMany({ userId: user._id });
};

export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload)
    throw createHttpError(401, 'Failed to authenticate with Google.');

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(payload.sub, 10);
    user = await User.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'parent',
    });
  }

  await Session.deleteOne({ userId: user._id });
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const newSession = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
  });

  return {
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
    refreshTokenValidUntil: newSession.refreshTokenValidUntil,
  };
};
