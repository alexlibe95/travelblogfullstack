import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { ROUTES } from '../../constants/index.js';

export const authRoutes = Router();

authRoutes.post(ROUTES.API.AUTH.LOGIN, login);
authRoutes.post(ROUTES.API.AUTH.LOGOUT, logout);
