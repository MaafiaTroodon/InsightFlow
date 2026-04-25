import { prisma } from '../utils/prisma.js';
import { authCookieName, verifyAuthToken } from '../utils/auth.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const token =
      req.cookies?.[authCookieName] ||
      req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      const error = new Error('Please sign in to continue.');
      error.status = 401;
      throw error;
    }

    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      const error = new Error('Please sign in to continue.');
      error.status = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = 'Please sign in to continue.';
    }
    next(error);
  }
};
