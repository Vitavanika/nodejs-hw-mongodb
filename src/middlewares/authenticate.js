import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

export const authenticate = ctrlWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createHttpError(401, 'Authorization header not found!'));
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Auth header should be of type Bearer'));
  }

  const session = await Session.findOne({ accessToken: token });
  if (!session) {
    return next(createHttpError(401, 'Session not found!'));
  }

  if (new Date() > session.accessTokenValidUntil) {
    return next(createHttpError(401, 'Access token expired!'));
  }

  const user = await User.findById(session.userId);
  if (!user) {
    return next(createHttpError(401, 'User not found for this session!'));
  }

  req.user = user;

  next();
});
