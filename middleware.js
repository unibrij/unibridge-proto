import { NextResponse } from "next/server";

export const config = {
  matcher: ['/docs/:path*', '/openapi-public.yaml'],
};

export default function middleware(req) {
  const basicAuth = req.headers.get('authorization');

  const USER = process.env.DOCS_USER || 'unibridge';
  const PASS = process.env.DOCS_PASS || 'demo-only';

  // ما في auth überhaupt
  if (!basicAuth) {
    return unauthorized();
  }

  // auth مو Basic
  const [scheme, encoded] = basicAuth.split(' ');
  if (scheme !== 'Basic') {
    return unauthorized();
  }

  // فك الـ Base64 "username:password"
  const buffer = Buffer.from(encoded, 'base64').toString('utf8');
  const [user, pass] = buffer.split(':');

  // صح؟ اسم المستخدم و الباسوورد يطابقوا؟
  if (user === USER && pass === PASS) {
    // مرر الطلب للستاتيك فايل بدل ما نرجع صفحة فاضية
    const res = NextResponse.next();
    // noindex = لا تسمح لمحركات البحث تفهرس هالمسار
    res.headers.set('X-Robots-Tag', 'noindex');
    return res;
  }

  // خطأ بالباسورد
  return unauthorized();
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': "Basic realm='docs'",
      'X-Robots-Tag': 'noindex'
    },
  });
}
