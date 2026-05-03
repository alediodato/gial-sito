# Pubblicare il sito su GitHub Pages

I file del sito sono nella root del repository. Questo workflow GitHub Actions pubblicherà il contenuto della repository su un branch `gh-pages` quando si effettua push su `main`.

Passaggi rapidi:

1. Inizializza il repository locale (se non già fatto):

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<tuo-username>/<tuo-repo>.git
git push -u origin main
```

2. GitHub Actions eseguirà il workflow e pubblicherà su `gh-pages` automaticamente.

3. Vai su Settings → Pages nel repository GitHub e verifica che la sorgente sia `gh-pages` (dovrebbe essere selezionata automaticamente).

4. Per dominio personalizzato: crea un file `CNAME` nella root con il dominio e configura i record DNS verso GitHub Pages.

Note:
- Se preferisci pubblicare da `main`/`docs`, modifica `publish_dir` nel workflow.
- Controlla le azioni in Actions tab per vedere lo stato del deploy.

## Script QR cartellino

Lo script `kolm_cartellino.py` genera un'immagine con testo sopra, QR al centro e testo sotto.

Esempio rapido:

```bash
python kolm_cartellino.py --text-top "Perché costa solo 40€?" --text-bottom "www.kolm.it"
```

Esempio completo:

```bash
python kolm_cartellino.py \
	--url "https://kolm.it" \
	--text-top "Perché costa solo 40€? Offerta speciale" \
	--text-bottom "www.kolm.it" \
	--font-size-top 100 \
	--font-size-bottom 110 \
	--max-text-width 500 \
	--spacing-top 80 \
	--spacing-bottom 80 \
	--padding-top 40 \
	--padding-bottom 60 \
	--padding-left 80 \
	--padding-right 80 \
	--qr-style rounded \
	--qr-box-size 12 \
	--qr-border 2 \
	--trim-qr \
	--output-name kolm_qr_grande.png
```

Parametri principali:

- Contenuto: `--url`, `--text-top`, `--text-bottom`
- Font: `--font-type`, `--font-path-top`, `--font-path-bottom`, `--font-size-top`, `--font-size-bottom`
- Testo: `--text-align-top`, `--text-align-bottom`, `--line-spacing-top`, `--line-spacing-bottom`, `--max-text-width`
- Spaziatura e layout: `--spacing-top`, `--spacing-bottom`, `--padding-top`, `--padding-bottom`, `--padding-left`, `--padding-right`, `--canvas-width`
- Colori: `--bg-color`, `--text-color`, `--text-color-top`, `--text-color-bottom`, `--qr-color`
- QR: `--qr-style`, `--qr-align`, `--qr-error-correction`, `--qr-box-size`, `--qr-border`, `--trim-qr`, `--no-trim-qr`
- Output: `--output-name`, `--dpi`

Per l'elenco completo con default aggiornati:

```bash
python kolm_cartellino.py --help
```

## Script immagine "III"

Lo script [scripts/generate_roman_badge.py](scripts/generate_roman_badge.py) rigenera l'immagine allegata in alta qualita, con supersampling e molte opzioni configurabili.

Esempio base:

```bash
python scripts/generate_roman_badge.py
```

Esempio vicino all'immagine allegata ma piu definito:

```bash
python scripts/generate_roman_badge.py \
	--text "III" \
	--width 2000 \
	--height 2000 \
	--font-name times \
	--tracking 70 \
	--background-color 243,243,243 \
	--text-color 0,0,0 \
	--supersample 5 \
	--dpi 300 \
	--output img/gial/roman_badge_hd.png
```

Parametri utili:

- Testo e layout: `--text`, `--align`, `--offset-x`, `--offset-y`, `--tracking`, `--line-spacing`
- Dimensioni: `--width`, `--height`, `--padding-x`, `--padding-y`, `--supersample`, `--dpi`
- Font: `--font-name`, `--font-path`, `--font-size`, `--min-font-size`, `--max-font-size`
- Colori: `--background-color`, `--text-color`, `--border-color`, `--stroke-color`, `--shadow-color`
- Effetti: `--border-width`, `--stroke-width`, `--shadow-offset-x`, `--shadow-offset-y`, `--shadow-blur`
- Trasparenza: `--transparent-background`

Per tutti i dettagli:

```bash
python scripts/generate_roman_badge.py --help
```
