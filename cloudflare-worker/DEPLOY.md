# Deploy del Cloudflare Worker per il Preventivatore AI

Tempo stimato: **15 minuti**. Costo: **0 €** (free tier Cloudflare + ~5 € di credito Anthropic per migliaia di preventivi).

## 1. Crea la chiave API Anthropic

1. Vai su https://console.anthropic.com
2. Registrati / accedi
3. Aggiungi crediti: **Settings → Billing → Add credit** (5 € bastano per anni di traffico tipico)
4. Genera la chiave: **Settings → API Keys → Create Key** → dalle un nome (es. "gial-worker") → **copia la chiave** (inizia con `sk-ant-...`). Apparirà una sola volta.

## 2. Crea l'account Cloudflare

1. Vai su https://dash.cloudflare.com/sign-up → registrati (è gratuito, non serve aggiungere il dominio)
2. Una volta dentro, nella sidebar a sinistra clicca **Workers & Pages**
3. Se è la prima volta ti chiede di scegliere un sottodominio (es. `gial-marketing.workers.dev`) — scegli quello che preferisci

## 3. Crea il Worker

1. Clicca **Create application → Create Worker**
2. Dagli un nome: `gial-preventivo-ai` (l'URL sarà `https://gial-preventivo-ai.<TUO-SOTTODOMINIO>.workers.dev`)
3. Clicca **Deploy** (deploya il codice di esempio)
4. Clicca **Edit code** (pulsante in alto a destra)
5. Nell'editor che si apre, **cancella tutto il contenuto** del file `worker.js`
6. Apri il file `cloudflare-worker/worker.js` di questo repo, **copia tutto il contenuto** e incollalo nell'editor Cloudflare
7. Clicca **Deploy** in alto a destra

## 4. Aggiungi la chiave Anthropic come variabile segreta

1. Torna alla pagina del Worker (clicca il nome in alto a sinistra)
2. Vai su **Settings → Variables and Secrets**
3. Clicca **Add variable**:
   - **Type**: `Secret` (importante! NON "Text")
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: incolla la chiave `sk-ant-...` copiata al punto 1
4. Clicca **Deploy**

## 5. Testa il Worker

Apri un terminale e lancia (sostituisci l'URL con il tuo):

```bash
curl -X POST https://gial-preventivo-ai.TUO-SOTTODOMINIO.workers.dev/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://gialtermoidraulica.it" \
  -d '{"descrizione":"Devo rifare due bagni piccoli e cambiare la caldaia"}'
```

Dovresti ricevere qualcosa come:
```json
{"tipi":["bagno","caldaia"],"risposte":{"bagno":{"qta":"2","dim":"piccolo"},"caldaia":{"pot":"media"}}}
```

## 6. Collega il sito al Worker

Nel file `index.html`, trova la riga:

```javascript
var WORKER_URL = '';
```

Sostituisci con l'URL del tuo Worker:

```javascript
var WORKER_URL = 'https://gial-preventivo-ai.TUO-SOTTODOMINIO.workers.dev';
```

Committa, push, e GitHub Pages aggiornerà il sito da solo. **Fatto.**

---

## Sicurezza

- La chiave Anthropic vive solo dentro Cloudflare, mai esposta al browser.
- Il Worker accetta richieste solo da `gialtermoidraulica.it` (CORS limitato in `ALLOWED_ORIGINS`).
- Limite hard: descrizioni 10–2000 caratteri (per non far esplodere i costi se qualcuno prova ad abusare).
- Free tier Cloudflare: 100.000 richieste/giorno. Anche con un picco virale stai sotto.
- Se vuoi un limite più stretto sull'API Anthropic, in console.anthropic.com → Settings → Limits puoi mettere un budget mensile (es. 2 €/mese) e si blocca da solo.

## Costi reali attesi

- Una richiesta tipica: ~500 token input + ~150 token output con Claude Haiku 4.5
- Costo per richiesta: **~0,0008 €** (meno di un decimo di centesimo)
- 1000 preventivi/anno = circa **0,80 €**
- Cloudflare: gratis fino a 100k req/giorno

## Fallback

Il sito chiama il Worker con timeout di 6 secondi. Se il Worker è giù, è lento, o la chiave Anthropic ha esaurito i crediti, il sito usa automaticamente il vecchio rilevamento basato su regex. **Non si rompe mai.**

## Aggiornamenti futuri

Per modificare le categorie, le percentuali, o il prompt: edita `worker.js`, incollalo nell'editor Cloudflare, clicca Deploy. Nessun deploy richiesto sul sito.
