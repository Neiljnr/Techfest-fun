import { handleAuthRequest, handleAuthResponse } from '@neon/auth/server';

const AUTH_PATH_PREFIX = '/api/neon-auth/';
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

const toRequestBody = (body) => {
  if (body == null) return undefined;
  if (typeof body === 'string' || body instanceof Uint8Array) return body;
  return JSON.stringify(body);
};

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (!ALLOWED_METHODS.has(request.method)) {
    response.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const authUrl = process.env.VITE_NEON_AUTH_URL?.trim();
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || process.env.QUEST_GUEST_AUTH_SECRET;
  if (!authUrl || !cookieSecret || cookieSecret.length < 32) {
    response.status(503).json({ error: 'Quest sign-in is not configured.' });
    return;
  }

  try {
    const requestUrl = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
    const rawPath = requestUrl.searchParams.get('path') || '';
    const path = rawPath.replace(/^\/+|\/+$/g, '');
    if (!path || !/^[A-Za-z0-9/_-]+$/.test(path)) {
      response.status(400).json({ error: 'Invalid auth path.' });
      return;
    }

    requestUrl.pathname = `${AUTH_PATH_PREFIX}${path}`;
    requestUrl.searchParams.delete('path');
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers || {})) {
      if (typeof value === 'string') headers.set(name, value);
      else if (Array.isArray(value)) headers.set(name, value.join(', '));
    }
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : toRequestBody(request.body);
    const proxyRequest = new Request(requestUrl, {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body })
    });

    const authBaseUrl = authUrl.replace(/\/+$/, '');
    // Forward get-session directly. The proxy's session-cache shortcut can
    // return a cached session without Neon Auth's set-auth-jwt header, leaving
    // the client with the opaque cookie token for Data API requests.
    const upstream = await handleAuthRequest(authBaseUrl, proxyRequest, path);
    const proxied = await handleAuthResponse(upstream, authBaseUrl, {
      secret: cookieSecret,
      sameSite: 'lax'
    });

    proxied.headers.forEach((value, name) => {
      if (!['set-cookie', 'content-encoding', 'content-length'].includes(name.toLowerCase())) {
        response.setHeader(name, value);
      }
    });
    const cookies = proxied.headers.getSetCookie?.() || [];
    if (cookies.length) response.setHeader('Set-Cookie', cookies);
    response.status(proxied.status).send(Buffer.from(await proxied.arrayBuffer()));
  } catch (error) {
    console.error('First-party Neon Auth proxy failed', error);
    response.status(502).json({ error: 'Could not reach Quest sign-in. Please try again.' });
  }
}
