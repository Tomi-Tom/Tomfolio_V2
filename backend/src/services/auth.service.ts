import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/tokens.js';
import { AppError } from '../utils/errors.js';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function excludePassword<T extends { password?: string | null }>(
  user: T
): Omit<T, 'password'> {
  const { password: _, ...rest } = user;
  return rest;
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
    },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return { user: excludePassword(user), accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  if (!user.password) {
    throw new AppError(401, 'UNAUTHORIZED', 'Please sign in with Google');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return { user: excludePassword(user), accessToken, refreshToken };
}

export async function refreshTokens(oldRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  const hashed = hashToken(oldRefreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashed },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const userId = payload.sub as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found');
  }

  const accessToken = generateAccessToken(userId, user.role);
  const newRefreshToken = generateRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      token: hashToken(newRefreshToken),
      userId,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  const hashed = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashed },
  });

  if (stored) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });
  }
}

export async function getOrCreateGoogleUser(profile: {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existing) {
    return existing;
  }

  const user = await prisma.user.create({
    data: {
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
      provider: 'google',
    },
  });

  return user;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return excludePassword(user);
}
