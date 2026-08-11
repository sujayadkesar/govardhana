/**
 * UPI intent construction and hand-off.
 *
 * Two rules govern everything here:
 *
 *  1. One builder. Every surface — QR, Android intent, each iOS app scheme —
 *     comes from buildUpiUri(), so a field can never be present on one path
 *     and missing on another. (The old site shipped twelve pages whose
 *     intents had no payee name.)
 *
 *  2. Detection promotes, it never eliminates. Every donor on every device
 *     can always reach the QR, the app list and the copy-VPA control.
 *     Detection only decides what is shown first.
 */

export type PayContext = 'android' | 'ios' | 'webview' | 'desktop';

export interface UpiParams {
  /** Payee VPA, e.g. govardhanylp@sbi */
  vpa: string;
  /** Payee name — required by the NPCI spec; apps warn or refuse without it */
  payeeName: string;
  /** Rupees. Number or fixed-2 string. */
  amount: number | string;
  /** Our own reference; lands in the bank narration for reconciliation */
  ref: string;
  /** Shown to the donor in their UPI app */
  note: string;
}

/** Scheme prefixes. `upi:` is the generic Android intent; the rest are iOS. */
export const SCHEMES = {
  upi: 'upi://pay?',
  gpay: 'gpay://upi/pay?', // NOT tez:// — that was the pre-rebrand name
  phonepe: 'phonepe://pay?',
  paytm: 'paytmmp://pay?',
  bhim: 'bhim://upi/pay?',
} as const;

export type SchemeKey = keyof typeof SCHEMES;

/**
 * Build a complete UPI intent URI.
 * Field order follows the NPCI deep-linking spec.
 */
export function buildUpiUri(p: UpiParams, scheme: SchemeKey = 'upi'): string {
  const amount = typeof p.amount === 'number' ? p.amount.toFixed(2) : p.amount;
  const q = [
    `pa=${encodeURIComponent(p.vpa)}`,
    `pn=${encodeURIComponent(p.payeeName)}`,
    `am=${encodeURIComponent(amount)}`,
    `cu=INR`,
    `tn=${encodeURIComponent(p.note)}`,
    `tr=${encodeURIComponent(p.ref)}`,
  ].join('&');
  return SCHEMES[scheme] + q;
}

/**
 * A short, unique, human-readable reference.
 * Base-36 second-precision timestamp plus two random chars keeps it
 * under 14 characters so bank narration fields do not truncate it.
 */
export function makeRef(prefix = 'GOV'): string {
  const t = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `${prefix}${t}${r}`;
}

/**
 * Which hand-off should be promoted.
 *
 * Note what is absent: no isDesktop() sniffing for "windows" or "macintosh".
 * Desktop is the fallback branch, so Linux, touch laptops, unknown devices
 * and future hardware all land somewhere sensible without being recognised.
 */
export function detectContext(ua = navigator.userAgent): PayContext {
  // In-app browsers first — they sit inside Android and iOS and handle
  // custom schemes unreliably, so they must be caught before either.
  if (/FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|MicroMessenger|WhatsApp|Snapchat|LinkedInApp/i.test(ua)) {
    return 'webview';
  }
  if (/android/i.test(ua)) return 'android';
  // iPadOS in desktop mode reports as Macintosh; touch points disambiguate.
  const iPadOSDesktop =
    /Macintosh/.test(ua) &&
    typeof navigator !== 'undefined' &&
    navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || iPadOSDesktop) return 'ios';
  return 'desktop';
}

/** The iOS app sheet, in the order Indian donors actually use them. */
export const IOS_APPS: { key: SchemeKey; name: string; icon: string }[] = [
  { key: 'gpay',    name: 'Google Pay', icon: '/images/apps/gpay.png' },
  { key: 'phonepe', name: 'PhonePe',    icon: '/images/apps/phonepe.png' },
  { key: 'paytm',   name: 'Paytm',      icon: '/images/apps/paytm.png' },
  { key: 'bhim',    name: 'BHIM UPI',   icon: '/images/apps/bhim.png' },
];

/**
 * Fire a UPI intent and detect the case where nothing happened.
 *
 * There is no success callback in UPI intent flows. What we can observe is
 * whether the browser ever lost focus: if the page is still visible a beat
 * later, no app opened — no UPI app installed, or the webview swallowed it.
 * `onNoApp` then reveals the QR and app list rather than leaving the donor
 * on a dead page, which is what the old site did.
 */
export function launchIntent(uri: string, onNoApp: () => void, delay = 1600): void {
  let handled = false;

  const settle = () => {
    if (handled) return;
    handled = true;
    cleanup();
  };

  const cleanup = () => {
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', settle);
    window.removeEventListener('blur', settle);
  };

  const onHide = () => {
    if (document.visibilityState === 'hidden') settle();
  };

  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', settle);
  window.addEventListener('blur', settle);

  // Must be a direct navigation inside the originating user gesture —
  // iOS discards navigation that has drifted out of its gesture.
  window.location.href = uri;

  window.setTimeout(() => {
    if (handled || document.visibilityState === 'hidden') {
      cleanup();
      return;
    }
    handled = true;
    cleanup();
    onNoApp();
  }, delay);
}

/** Clipboard with a synchronous fallback for older in-app browsers. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** ₹11,000 — Indian digit grouping, no decimals when whole. */
export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}
