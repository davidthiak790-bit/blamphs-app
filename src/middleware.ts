import { defineMiddleware } from 'astro:middleware';

function getDB(locals: any) {
  // Try multiple access patterns for Cloudflare Pages + Astro 5
  return locals.DB 
    ?? locals.runtime?.env?.DB 
    ?? locals.runtime?.DB;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies } = context;
  const locals = context.locals as any;
  
  const db = getDB(locals);
  locals.user = null;
  locals.org = null;

  const sessionId = cookies.get('session')?.value;
  if (!sessionId || !db) return next();

  const { results } = await db.prepare(`
    SELECT u.id, u.email, u.name, s.expires_at,
           o.id as org_id, o.name as org_name, o.plan as org_plan
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN org_users ou ON u.id = ou.user_id
    LEFT JOIN orgs o ON ou.org_id = o.id
    WHERE s.id = ?
  `).bind(sessionId).all();

  const row = results?.[0] as any;
  if (row) {
    if (new Date(row.expires_at) > new Date()) {
      locals.user = { id: row.id, email: row.email, name: row.name };
      if (row.org_id) {
        locals.org = { id: row.org_id, name: row.org_name, plan: row.org_plan };
      }
    } else {
      await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
      cookies.delete('session');
    }
  }

  const url = new URL(request.url);
  const isProtected = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/settings');
  if (isProtected && !locals.user) {
    return context.redirect('/login');
  }
  if ((url.pathname === '/login' || url.pathname === '/signup') && locals.user) {
    return context.redirect('/dashboard');
  }

  return next();
});
