export const config = {
  matcher: ['/docs/:path*', '/openapi-public.yaml'],
};

export default function middleware(req) {
  const basicAuth = req.headers.get('authorization');

  const USER = process.env.DOCS_USER || 'unibridge';
  const PASS = process.env.DOCS_PASS || 'demo-only';

  // لا يوجد header أساساً
  if (!basicAuth) {
    return unauthorized();
  }

  // مش Basic
  const [scheme, encoded] = basicAuth.split(' ');
  if (scheme !== 'Basic') {
    return unauthorized();
  }

  // فك base64 -> "username:password"
  const buffer = Buffer.from(encoded, 'base64').toString('utf8');
  const [user, pass] = buffer.split(':');

  // صح؟ نسمح بالمرور
  if (user === USER && pass === PASS) {
    // السماح بالمتابعة بدون اعتراض
    // (لا نرجّع Response هون)
    return;
  }

  // خطأ
  return unauthorized();
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="docs"',
      'X-Robots-Tag': 'noindex'
    },
  });
}
