import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const SESSION_COOKIE_NAME = 'dhq-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  sessionId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(
  userId: string,
  username: string,
  email: string,
  role: string,
  ipAddress: string,
  userAgent?: string
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DURATION);

  // Create session in database
  await prisma.authSession.create({
    data: {
      id: sessionId,
      sessionToken: sessionId,
      userId,
      ipAddress,
      userAgent,
      expires,
    },
  });

  // Create JWT token
  const token = await new SignJWT({
    userId,
    username,
    email,
    role,
    sessionId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Type guard to ensure payload has required fields
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.username !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.sessionId !== 'string'
    ) {
      return null;
    }

    // Verify session exists in database
    const session = await prisma.authSession.findUnique({
      where: { sessionToken: payload.sessionId },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // Set to false to work with HTTP in production
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
    // Add domain if specified in environment
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN })
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    path: '/',
    // Add domain if specified in environment
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN })
  });
}

export async function deleteSession(sessionId: string) {
  await prisma.authSession.delete({
    where: { sessionToken: sessionId },
  });
}

export function getClientInfo(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}