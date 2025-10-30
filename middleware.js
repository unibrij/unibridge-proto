// middleware.js
export const config = {
  matcher: ['/docs/:path*', '/openapi-public.yaml'],
};

export default function middleware(req) {
  const basicAuth = req.headers.get('authorization');

  const USER = process.env.DOCS_USER || 'unibridge';
  const PASS = process.env.DOCS_PASS || 'demo-only';

  if (!basicAuth) return unauthorized();

  const [scheme, encoded] = basicAuth.split(' ');
  if (scheme !== 'Basic') return unauthorized();

  const buffer = Buffer.from(encoded, 'base64').toString('utf8');
  const [user, pass] = buffer.split(':');

  if (user === USER && pass === PASS) {
    const res = new Response(null, { status: 200 });
    // اطلب من العناكب ما تفهرس
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }

  return unauthorized();
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': "Basic realm='docs'"
    },
  });
}
