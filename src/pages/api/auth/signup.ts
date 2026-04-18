import type { APIRoute } from 'astro';
import { hashPassword, generateId, createSessionCookie } from '../../../lib/auth';

function getDB(locals: any) {
  return locals.DB 
    ?? locals.runtime?.env?.DB 
    ?? locals.runtime?.DB;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDB(locals);
  if (!db) {
    return new Response(JSON.stringify({ error: 'DB not bound', locals: Object.keys(locals) }), { status: 500 });
  }

  const formData = await request.formData();
  const email = formData.get('email')?.toString().toLowerCase();
  const password = formData.get('password')?.toString();
  const orgName = formData.get('company')?.toString();

  if (!email || !password || !orgName) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const exists = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (exists) {
    return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400 });
  }

  const userId = generateId('usr_');
  const orgId = generateId('org_');
  const sessionId = generateId('sess_');
  const hashedPw = hashPassword(password);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.batch([
    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').bind(userId, email, hashedPw),
    db.prepare('INSERT INTO orgs (id, name) VALUES (?, ?)').bind(orgId, orgName),
    db.prepare('INSERT INTO org_users (org_id, user_id, role) VALUES (?, ?, ?)').bind(orgId, userId, 'owner'),
    db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(sessionId, userId, expiresAt.toISOString())
  ]);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Set-Cookie': createSessionCookie(sessionId, expiresAt) }
  });
};
