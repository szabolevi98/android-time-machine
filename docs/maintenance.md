# Maintenance

[← Back to the README](../README.md)

Publishing, the social preview images, the sitemap and adding a version. How the code is laid out is in
[architecture.md](architecture.md); how the factory images are unpacked and the generated files rebuilt is in
[sources.md](sources.md).

## Publishing

The live site, [android.levente.net](https://android.levente.net/), is served as a static site from a checkout of
`main`. A mirror runs on [GitHub Pages](https://szabolevi98.github.io/android-time-machine/), which publishes the
repository root from `main` after each push. The `.nojekyll` file keeps the site out of Jekyll processing.
Deployment progress is in the repository's **Actions** tab; the publishing source is under **Settings → Pages**.

The live site is behind a CDN that caches CSS and JavaScript by their full URL. A change to a version's CSS or
JavaScript file only reaches visitors when the file's `?v=` revision in that version's `index.html` is raised
(`docs/tools/bump-version.py`).

## Social preview images

`assets/og-cover.jpg` is the English social preview; `assets/og-cover-hu.jpg` is its Hungarian counterpart. Both are
1200 × 630 and are rendered together from `docs/tools/og-cover.html`, using each phone's frame and `landing-home.jpg`.
Regenerate both with local Chrome (or set `CHROME`):

```bash
node docs/tools/make-og-cover.mjs
```

Every page ships English SEO, Open Graph and X/Twitter tags directly in its HTML. The English cover is the stable
default for sharing, independent of the interface language selected in JavaScript; the Hungarian image remains
separately available. The metadata comes from the English release catalogue:

```bash
node docs/tools/make-social-meta.mjs          # update all pages
node docs/tools/make-social-meta.mjs --check  # verify them
```

When the cover changes, bump its image revision in that script, regenerate the metadata, and update the README's
cover alt text if the phones on it changed.

The portfolio card on levente.net uses a 1600 × 960 variant with an English headline, from
`docs/tools/portfolio-cover.html` (1200 × 720 at a 4/3 device pixel ratio):

```bash
node docs/tools/make-og-cover.mjs --portfolio <png>
```

## Search engines

`robots.txt` allows every crawler and points to `sitemap.xml`. The sitemap is a static file that lists the landing
page and each available version from `versions/catalog.js`. Each `lastmod` is the date of the last commit that changed
that page. Regenerate it after committing page changes, then commit the new `sitemap.xml`:

```bash
node docs/tools/make-sitemap.mjs
```

## Adding a version

1. Create a `versions/<version>/` directory with its own `index.html`, CSS, JavaScript, and assets.
2. Add an entry to `versions/catalog.js` with `status: 'available'` and a `url` pointing to the new directory.
3. Run `node docs/tools/make-sitemap.mjs` so that the sitemap lists the new version.
4. Start it with the shared used-phone demo data ([demo-data.md](demo-data.md)) and give it its own save key
   ([saved-state.md](saved-state.md)).
5. Add it to the README's version table and gallery, with a `docs/features-<version>.md` page.

Each version keeps its interface and saved state separate, so adding a release does not change the other versions.
