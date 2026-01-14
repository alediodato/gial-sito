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
