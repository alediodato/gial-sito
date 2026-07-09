# gialtermoidraulica.it — sito GIAL SRL

Sito statico pubblicato con **GitHub Pages** direttamente dal branch `main` (nessun workflow di build: ogni push su `main` va in produzione). Dominio personalizzato configurato via file `CNAME`.

## Struttura

| Percorso | Contenuto |
|---|---|
| `index.html` | Home single-page (hero, chi siamo, filosofia, team, servizi, infissi, portfolio, preventivo AI, FAQ, recensioni, contatti, privacy) |
| `infissi-serramenti-prato/` | Landing SEO dedicata a infissi e serramenti |
| `rifacimento-bagno-prato/` | Landing SEO dedicata al rifacimento bagno |
| `404.html` | Pagina "non trovata" brandizzata (usata automaticamente da GitHub Pages) |
| `css/style.css` | Tailwind CSS v4 **precompilato**: le classi non presenti vanno aggiunte nel blocco `<style>` inline delle pagine |
| `cloudflare-worker/` | Worker del Preventivo AI (Claude Haiku). Deploy separato con `wrangler`, vedi `DEPLOY.md` |
| `scripts/` | Utility Python (richiedono Pillow): `generate_favicons.py`, `generate_og_image.py`, `convert_itec_webp.py` |
| `sitemap.xml`, `robots.txt` | SEO. Aggiornare `lastmod` quando si modifica una pagina |
| `site.webmanifest`, `favicon*`, `icon-*.png`, `apple-touch-icon.png` | Set icone (rigenerabile con `python scripts/generate_favicons.py`) |

## Note operative

- **CSS**: Tailwind è precompilato e "purgato" — se usi una classe nuova non presente in `css/style.css`, non renderizza. Aggiungila al blocco `<style>` inline della pagina (vedi esempi in `index.html`).
- **Preventivo AI**: il frontend chiama il worker Cloudflare (URL in `index.html`, var `WORKER_URL`). Il worker valida le stime lato server e richiede un header `Origin` del sito. Consigliata una regola di **Rate Limiting** nel pannello Cloudflare.
- **Analytics**: Google Analytics (`G-4QWQKJ6TL6`) viene caricato **solo dopo il consenso** dal banner cookie. La mappa Google in Contatti si carica solo al click.
- **Immagini**: usare WebP con `width`/`height` espliciti e `loading="lazy"` sotto la piega.
- **Prezzario DEI**: la cartella `Prezzario*/` è in `.gitignore` perché contiene materiale protetto da copyright. **Non committarla mai.**

## Pubblicazione

```bash
git add <file modificati>
git commit -m "descrizione"
git push origin main   # → GitHub Pages aggiorna il sito in pochi minuti
```
