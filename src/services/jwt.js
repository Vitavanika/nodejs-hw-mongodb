import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import createHttpError from 'http-errors';

dotenv.config();

const { JWT_SECRET, ACCESS_TOKEN_VALIDITY, REFRESH_TOKEN_VALIDITY } =
  process.env;

export const createAccessToken = (user, expiresIn = ACCESS_TOKEN_VALIDITY) => {
  if (!user || !user._id) {
    throw createHttpError(401, 'User data is missing for token creation.');
  }

  const payload = { id: user._id };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const createRefreshToken = (
  user,
  expiresIn = REFRESH_TOKEN_VALIDITY,
) => {
  if (!user || !user._id) {
    throw createHttpError(401, 'User data is missing for token creation.');
  }

  const payload = { id: user._id };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createHttpError(401, 'Token expired!');
    }
    throw createHttpError(401, 'Invalid token.');
  }
};
