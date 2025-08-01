import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  sendResetEmail,
  resetPassword,
} from '../services/auth.js';
import createHttpError from 'http-errors';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
  if (!user) {
    throw createHttpError(409, 'User already exists');
  }

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export async function loginUserController(req, res) {
  const { email, password } = req.body;
  const session = await loginUser(email, password);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
}

export const refreshSessionController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token not provided');
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshSession(
    refreshToken,
  );

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    expire: refreshToken.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await logoutUser(refreshToken);
  res.clearCookie('refreshToken', { httpOnly: true });
  res.status(204).send();
};

export const sendResetEmailController = async (req, res) => {
  await sendResetEmail(req.body.email);
  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;
  await resetPassword(token, password);
  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
