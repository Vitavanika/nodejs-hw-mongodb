import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

const generateSessionTokens = () => {
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

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
