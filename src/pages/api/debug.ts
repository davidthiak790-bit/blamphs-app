import type { APIRoute } from 'astro';
export const GET: APIRoute = async ({ locals }) => {
  return new Response(JSON.stringify({
    localsKeys: Object.keys(locals),
    localsRuntime: locals.runtime ? Object.keys(locals.runtime) : null,
    runtimeEnv: locals.runtime?.env ? Object.keys(locals.runtime.env) : null,
    db: locals.DB ? 'EXISTS' : 'NULL',
    dbType: locals.DB ? typeof locals.DB : 'undefined'
  }, null, 2));
};
