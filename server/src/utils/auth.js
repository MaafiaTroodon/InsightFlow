import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'insightflow_token';

const getJwtSecret = () => process.env.JWT_SECRET || 'development-secret';

export const authCookieName = COOKIE_NAME;

export const signAuthToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

export const verifyAuthToken = (token) => jwt.verify(token, getJwtSecret());

export const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
