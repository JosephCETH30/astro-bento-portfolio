import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect }) => {
  return redirect('/v2', 301);
}; 