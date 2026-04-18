import bcrypt from 'bcryptjs';

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function generateId(prefix: string = '') {
  return prefix + crypto.randomUUID().replace(/-/g, '');
}

export function createSessionCookie(sessionId: string, expiresAt: Date) {
  return `session=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Secure`;
}

export function clearSessionCookie() {
  return `session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Secure`;
}
