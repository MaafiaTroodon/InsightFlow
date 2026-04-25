import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { authCookieName, getCookieOptions, signAuthToken } from '../utils/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

router.post('/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const token = signAuthToken(user);
    res.cookie(authCookieName, token, getCookieOptions());
    res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signAuthToken(user);
    res.cookie(authCookieName, token, getCookieOptions());
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/logout', (_req, res) => {
  res.clearCookie(authCookieName, {
    ...getCookieOptions(),
    maxAge: 0,
  });
  res.status(204).send();
});

router.get('/auth/me', requireAuth, async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

export default router;
