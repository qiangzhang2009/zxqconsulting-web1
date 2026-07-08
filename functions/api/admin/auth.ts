/**
 * Shared admin authentication module
 * Used by all /api/admin/* endpoints
 */

interface AuthResult {
  ok: true;
  email: string;
}

interface AuthContext {
  request: Request;
  env: {
    ADMIN_KV?: KVNamespace;
  };
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function verifySession(auth: AuthContext): Promise<AuthResult | null> {
  const { request, env } = auth;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Promise.resolve(null);
  }

  const token = authHeader.substring(7);

  if (!token.startsWith('qhs_')) {
    return Promise.resolve(null);
  }

  if (!env.ADMIN_KV) {
    console.error('[auth] ADMIN_KV not configured');
    return Promise.resolve(null);
  }

  return env.ADMIN_KV.get(`session:${token}`).then(stored => {
    if (!stored) return null;

    try {
      const session = JSON.parse(stored) as { email: string; expiresAt: number };
      if (session.expiresAt < Date.now()) {
        return env.ADMIN_KV.delete(`session:${token}`).then(() => null);
      }
      return { ok: true as const, email: session.email };
    } catch {
      return null;
    }
  });
}

export function authResponse(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
