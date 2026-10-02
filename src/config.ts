export const SITE = {
  name: 'Mindforge',
  url: 'https://www.mindforge.hu',
  owner: 'Seregély Edit',
  role: 'Sport mentáltréner, sportcoach, NLP Mester coach',
  email: 'info@mindforge.hu',
  phone: '+36 30 2276 314',
  phoneHref: 'tel:+36302276314',
  instagram: 'https://www.instagram.com/edit.seregely/',
  facebook: 'https://www.facebook.com/sportmentaltrener/',
  address: { street: 'Arany János u. 13.', city: 'Abda', zip: '9151', country: 'HU' },
};

// Kapcsolati űrlap fogadó végpontja (pl. Formspree: https://formspree.io/f/xxxxxxx,
// vagy Web3Forms). Ha üres, az űrlap e-mail kliensben nyitja meg az üzenetet.
export const FORM_ENDPOINT = '';

// footerLabel: a láblécben eltérő linkszöveg, hogy ne ismétlődjenek a horgonyszövegek (SEO)
export const NAV = [
  { label: 'Főoldal', footerLabel: 'Kezdőlap', href: '/' },
  { label: 'Rólam', footerLabel: 'Seregély Editről', href: '/rolam' },
  { label: 'Sikersztorik', footerLabel: 'Sikertörténetek', href: '/sikersztorik' },
  { label: 'Kapcsolat', footerLabel: 'Kapcsolatfelvétel', href: '/#kapcsolat' },
  { label: 'Blog', footerLabel: 'Mentáltréning blog', href: '/blog' },
];

/**
 * Útvonal-előtag. Éles domainen (www.mindforge.hu) '/', GitHub Pages
 * előnézeten '/mindforge/' – a build a BASE_PATH környezeti változóból veszi.
 */
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Előnézeti build (pl. github.io): minden oldal noindex, hogy ne legyen duplikált tartalom. */
export const IS_PREVIEW = import.meta.env.PUBLIC_PREVIEW === 'true';

/** Az aktuális útvonal előtag nélkül, záró perjellel: '/rolam/' */
export function stripBase(path: string): string {
  let p = BASE !== '/' && path.startsWith(BASE) ? '/' + path.slice(BASE.length) : path;
  if (!p.startsWith('/')) p = '/' + p;
  return /\.[a-z0-9]+$/i.test(p) || p.endsWith('/') ? p : p + '/';
}

/** Abszolút URL az éles domainen (kanonikus link, strukturált adatok, megosztási kép). */
export function abs(path: string): string {
  return new URL(stripBase(path), SITE.url).href;
}
