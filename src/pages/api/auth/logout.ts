import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth';

function getDB(locals: any) {
  return locals.DB ?? locals.runtime?.env?.DB ?? locals.runtime?.DB;
}

export const GET: APIRoute = async ({ cookies, locals }) => {
  const sessionId = cookies.get('session')?.value;
  const db = getDB(locals);
  if (sessionId && db) {
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  }
  return new Response(null, {
    status: 302,
    headers: { 'Set-Cookie': clearSessionCookie(), 'Location': '/login' }
  });
};
