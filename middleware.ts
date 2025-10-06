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

  // Bypass locale redirect for Studio and add X-Robots-Tag to avoid indexing
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  // If already prefixed with a supported locale, normalize unknown sections
  const localePrefixed = pathname.match(/^\/(es|pt|en)(?:\/(.*))?$/);
  if (localePrefixed) {
    const currentLocale = localePrefixed[1];
    const rest = (localePrefixed[2] || '').split('/').filter(Boolean);
    const first = rest[0] || '';
    const allowed = new Set(['', 'services', 'solutions', 'portfolio', 'project', 'blog', 'contact']);
    const url = req.nextUrl.clone();

    // Strip legacy Woo query like add-to-cart
    if (url.searchParams.has('add-to-cart')) {
      url.search = '';
      url.pathname = `/${currentLocale}`;
      return NextResponse.redirect(url, 301);
    }

    if (!allowed.has(first)) {
      url.search = '';
      url.pathname = `/${currentLocale}`;
      return NextResponse.redirect(url, 301);
    }
    return NextResponse.next();
  }

  // Redirect ANY non-prefixed path strictly to detected locale root
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  // Always send to '/<locale>' and drop queries like add-to-cart
  url.search = '';
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ['/((?!_next|api|.*\..*).*)']
};
