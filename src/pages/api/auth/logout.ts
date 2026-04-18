import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const sessionId = cookies.get('session')?.value;
  if (sessionId && locals.db) {
    await locals.db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  }
  return new Response(null, {
    status: 302,
    headers: { 'Set-Cookie': clearSessionCookie(), 'Location': '/login' }
  });
};
