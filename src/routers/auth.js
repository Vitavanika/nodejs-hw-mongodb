import { Router } from 'express';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  refreshSessionController,
  logoutController,
} from '../controllers/auth.js';
import validateBody from '../middlewares/validateBody.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
authRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);
authRouter.post('/refresh', ctrlWrapper(refreshSessionController));
authRouter.post('/logout', ctrlWrapper(logoutController));

export default authRouter;
