# MINDFORGE weboldal (Astro)

A www.mindforge.hu Wix-oldal kódolt másolata. Statikus HTML-t generál: gyors, SEO-barát, bármilyen tárhelyre feltölthető.

## Parancsok

```bash
npm install      # első alkalommal
npm run dev      # fejlesztői szerver: http://localhost:4321
npm run build    # éles build a dist/ mappába
```

## Felépítés

- `src/pages/` – oldalak (index, rolam, sikersztorik, blog, jogi oldalak, 404)
- `src/components/` – fejléc/menü, lábléc, kapcsolati űrlap, blog lista
- `src/content/blog/*.md` – blogposztok. **Új poszt = új .md fájl** (a frontmatter mintája a meglévőkben).
- `src/content/legal/` – Adatkezelési Nyilatkozat, Impresszum szövege
- `src/styles/global.css` – teljes arculat (színek, betűk a fájl tetején, változókban)
- `src/config.ts` – elérhetőségek, menü, űrlap-végpont
- `public/assets/` – képek, videók

## Élesítés előtt

1. **Űrlap:** `src/config.ts` → `FORM_ENDPOINT` (pl. Formspree / Web3Forms URL). Üresen hagyva az e-mail kliens nyílik meg.
2. **Impresszum / Adatkezelés:** a tárhelyszolgáltató adatait frissíteni kell (jelenleg Wix, illetve Mozello szerepel).
3. **Átirányítások:** a régi Wix URL-ek (/rólam, /blank, /post/...) 301-gyel az újakra mutatnak – Vercelen a `vercel.json`, Apache/cPanel tárhelyen a `public/.htaccess` intézi.
4. Google Search Console-ban beküldeni: `https://www.mindforge.hu/sitemap-index.xml`

## SEO

- **Metaadatok:** minden oldalon egyedi `title` (≤60 karakter) és `description` (≤155 karakter). Blogposztnál a frontmatter `seoTitle` mezője a Google-cím, a `title` a látható H1.
- **Strukturált adatok (JSON-LD):** WebSite, ProfessionalService (szolgáltatási terület: Győr, Budapest, online), Person (ICF tagság), BreadcrumbList, FAQPage (Rólam), BlogPosting.
- **Képek:** a `src/assets/img` képei buildkor AVIF/WebP formátumra és több méretre konvertálódnak (`src/components/Img.astro`). Új képet ide tegyél, ne a `public/` mappába.
- **Betűtípusok:** helyben kiszolgálva (@fontsource), nincs Google Fonts hívás (gyorsabb és GDPR-barát).
- **Sitemap:** `sitemap-index.xml` (dátumokkal, a jogi oldalak nélkül), **RSS:** `/rss.xml`.
- **Belső linkelés:** minden blogposzt alatt CTA, szerzői doboz és 3 kapcsolódó írás.

### Új blogposzt SEO-ellenőrzőlista
1. Fájlnév = URL (ékezet nélkül, kötőjellel): `src/content/blog/verseny-elotti-izgulas.md`
2. `seoTitle`: fő kulcsszó elöl, max. 60 karakter
3. `description`: 120–155 karakter, legyen benne a kulcsszó és egy ígéret
4. `cover` + `coverAlt` (kép leírása), `category` ha sorozat része
5. A szövegben használj `<h2>`/`<h3>` alcímeket, és linkelj a /rolam vagy /#kapcsolat oldalra
