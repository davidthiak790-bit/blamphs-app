import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies } = context;
  
  // Astro 5 + Cloudflare Pages: bindings are in locals directly or via runtime.env
  const runtime = (context.locals as any).runtime;
  const db = runtime?.env?.DB ?? (context.locals as any).DB;
  
  (context.locals as any).user = null;
  (context.locals as any).org = null;

  const sessionId = cookies.get('session')?.value;
  if (!sessionId || !db) return next();

  // Look up session + user + org
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
      (context.locals as any).user = { id: row.id, email: row.email, name: row.name };
      if (row.org_id) {
        (context.locals as any).org = { id: row.org_id, name: row.org_name, plan: row.org_plan };
      }
    } else {
      await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
      cookies.delete('session');
    }
  }

  // Route guard
  const url = new URL(request.url);
  const isProtected = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/settings');
  if (isProtected && !(context.locals as any).user) {
    return context.redirect('/login');
  }
  if ((url.pathname === '/login' || url.pathname === '/signup') && (context.locals as any).user) {
    return context.redirect('/dashboard');
  }

  return next();
});
