import type { APIRoute } from 'astro';
import { verifyPassword, generateId, createSessionCookie } from '../../../lib/auth';

function getDB(locals: any) {
  return locals.DB ?? locals.runtime?.env?.DB ?? locals.runtime?.DB;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDB(locals);
  if (!db) return new Response(JSON.stringify({ error: 'DB not bound' }), { status: 500 });

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const email = body.email?.toLowerCase().trim();
  const password = body.password;

  if (!email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });

  const user: any = await db.prepare('SELECT id, password_hash FROM users WHERE email = ?').bind(email).first();
  if (!user || !verifyPassword(password, user.password_hash)) {
    return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
  }

  const sessionId = generateId('sess_');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(sessionId, user.id, expiresAt.toISOString()).run();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Set-Cookie': createSessionCookie(sessionId, expiresAt) }
  });
};
