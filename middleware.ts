import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['es', 'pt', 'en'] as const;
const defaultLocale = 'es';

function detectLocale(req: NextRequest): string {
  const header = req.headers.get('accept-language') || '';
  const preferred = header.split(',').map(s => s.split(';')[0].trim().slice(0,2));
  for (const code of preferred) {
    if (locales.includes(code as any)) return code;
  }
  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore next internals, files and API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Allow if already prefixed with a supported locale
  if (/^\/(es|pt|en)(\/|$)/.test(pathname)) {
    return NextResponse.next();
  }

  // Redirect root or non-prefixed paths to detected locale
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\..*).*)']
};
