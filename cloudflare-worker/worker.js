// GIAL Preventivo AI — Cloudflare Worker (versione Hybrid: macro + voci unitarie DEI)
// L'AI riceve la descrizione e la confronta con un catalogo aggregato di interventi
// finiti (macro) + un set di voci unitarie DEI (€/h, €/mq, €/cad, €/m).
// Scegli la combinazione giusta per coprire qualsiasi richiesta.

const ALLOWED_ORIGINS = [
    'https://gialtermoidraulica.it',
    'https://www.gialtermoidraulica.it',
];

// Pattern per origini di sviluppo locali (qualsiasi porta)
const LOCAL_ORIGIN_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const CATALOGO = `CATALOGO PREZZI GIAL 2026 — derivato dal Prezzario DEI Toscana 2026 (Firenze).
Tutti i prezzi sono in EUR, IVA esclusa, zona Prato/Firenze/Pistoia.

═══════════════════════════════════════════════════
PARTE 1 — MACRO-INTERVENTI (chiavi in mano)
Usa queste voci per richieste di lavori "tipici" (es: "voglio rifare il bagno", "sostituisci la caldaia").
Già comprensive di: fornitura + materiali + trasporto + montaggio + posa + documentazione.
═══════════════════════════════════════════════════

## INFISSI (per unità ~120×140 cm)
- INFISSO PVC doppio vetro:           economico 380-490, standard 490-630, premium 630-800
- INFISSO Alluminio taglio termico:   economico 600-750, standard 750-950, premium 950-1.200
- INFISSO Legno/Fibex:                economico 850-1.080, standard 1.080-1.380, premium 1.380-1.700
- TAPPARELLA motorizzata:             cad 380-650
- PERSIANA blindata:                  cad 700-1.200

## RIFACIMENTO BAGNO (totale per bagno: sanitari + tubature + posa + rivestimenti + finiture)
- BAGNO Piccolo (<5mq):  economico 4.800-6.200, standard 6.200-8.500, premium 8.500-12.000
- BAGNO Medio (5-8mq):   economico 6.800-8.800, standard 8.800-12.500, premium 12.500-17.000
- BAGNO Grande (>8mq):   economico 9.500-12.500, standard 12.500-17.000, premium 17.000-23.000

## CALDAIA A CONDENSAZIONE (sostituzione chiavi in mano, ref. DEI 06.I04P)
- CALDAIA 19-24 kW (mono/bilocale):       1.940-2.730
- CALDAIA 24-30 kW (3-4 locali, 90-120mq): 2.440-3.030
- CALDAIA 30-35 kW (villa, >120mq):       3.030-3.940
- CALDAIA con rifacimento impianto completo: 5.200-8.000

## CLIMATIZZAZIONE SPLIT (chiavi in mano, ref. DEI 06.I06A)
- SPLIT Mono (1 ambiente, 9-12k BTU):  1.500-2.100
- SPLIT Dual (2 ambienti):             2.500-3.700
- SPLIT Trial (3 ambienti):            3.700-5.500
- SPLIT Quadri (4+ ambienti):          5.000-7.500

## POMPA DI CALORE ARIA-ACQUA (ref. DEI 06 + PR.P30.200)
- POMPA piccola (<100mq):
  · solo pompa: 7.000-9.500   · con adeguamento impianto: 9.500-13.000   · ristrutturazione completa: 13.000-18.000
- POMPA media (100-180mq):
  · solo pompa: 9.000-12.000  · con adeguamento: 12.000-16.000           · ristrutturazione: 16.000-22.000
- POMPA grande (>180mq):
  · solo pompa: 12.000-16.000 · con adeguamento: 16.000-22.000           · ristrutturazione: 22.000-30.000

## FOTOVOLTAICO chiavi in mano
- FV 3 kWp (<3.000 kWh/anno):  5.500-8.000
- FV 6 kWp (3.000-6.000 kWh):  9.500-14.000
- FV 10 kWp (>6.000 kWh):     15.000-22.000

## CUCINA (impianti idraulico/elettrico + posa elettrodomestici, NO mobili)
- CUCINA Piccola (<10mq):  2.500-4.000
- CUCINA Media (10-18mq):  4.000-7.000
- CUCINA Grande (>18mq):   7.000-12.000

## SCALDABAGNO (sostituzione totale, ref. DEI 06.PR.P30.043)
- SCALDABAGNO elettrico:        500-900
- SCALDABAGNO a gas:            950-1.700
- SCALDABAGNO pompa di calore:  3.100-3.700

## TINTEGGIATURA (pareti+soffitti, totale appartamento)
- TINT Piccolo (~50mq):  600-1.100
- TINT Medio (~80mq):    1.000-1.800
- TINT Grande (120+mq):  1.500-2.700

## POSA PAVIMENTI chiavi in mano (gres/parquet/ceramica, posa+materiale standard)
- PAV Piccolo (~50mq):    4.000-6.500
- PAV Medio (~80mq):      6.500-10.500
- PAV Grande (120+mq):   10.000-16.000

## IMPIANTO ELETTRICO (rifacimento appartamento)
- ELE Piccolo (<70mq):     3.500-5.500
- ELE Medio (70-110mq):    5.500-8.500
- ELE Grande (>110mq):     8.500-13.000

## TERRAZZO/BALCONE (impermeabilizzazione + posa pavimentazione)
- TERR Piccolo (<10mq):   2.200-3.500
- TERR Medio (10-25mq):   3.500-6.500
- TERR Grande (>25mq):    6.500-12.000

═══════════════════════════════════════════════════
PARTE 2 — VOCI UNITARIE DEI
Usa queste voci per richieste atomiche / quantità specifiche
(es: "10 metri di tubo", "sostituisci solo il vaso WC", "tinteggia 30mq").
Tutte fornitura + posa, salvo dove specificato.
═══════════════════════════════════════════════════

## MANODOPERA (ref. DEI RU)
- MANODOPERA idraulica/impiantistica (operaio specializzato):  35-37 €/h
- MANODOPERA idraulica (operaio qualificato):                  31-34 €/h
- MANODOPERA edile (operaio specializzato):                    38-43 €/h
- MANODOPERA edile (operaio comune):                           30-34 €/h

## SANITARI (fornitura + posa, ref. DEI 06.I01F.004)
- SANITARIO vaso WC standard a pavimento:           220-380 cad
- SANITARIO vaso WC sospeso con cassetta incasso:   480-700 cad
- SANITARIO bidet:                                  220-360 cad
- SANITARIO lavabo a colonna o sospeso:             260-500 cad
- SANITARIO piatto doccia 70×90 con piletta:        300-550 cad
- SANITARIO vasca da bagno standard:                500-1.200 cad
- SANITARIO box doccia in cristallo:                500-1.500 cad

## MISCELATORI
- MISCELATORE lavabo standard:                  70-150 cad
- MISCELATORE doccia/vasca:                     90-200 cad
- MISCELATORE termostatico doccia:              150-350 cad

## OPERE EDILI (rifacimento bagno - per €/mq)
- DEMOLIZIONE rivestimento/pavimento esistente:  10-15 €/mq
- DEMOLIZIONE tramezzo in mattoni forati:        25-45 €/mq
- POSA rivestimento bagno (gres standard, fornitura+posa):  55-90 €/mq
- POSA pavimento gres porcellanato (fornitura+posa):        55-95 €/mq
- POSA solo (escluso materiale):                            30-50 €/mq
- INTONACO civile premiscelato:                  20-35 €/mq
- MASSETTO autolivellante (sp. 4-5 cm):          22-32 €/mq
- TINTEGGIATURA lavabile pareti+soffitti:        8-15 €/mq

## TUBAZIONI (fornitura + posa, ref. DEI 06.I01A)
- TUBO multistrato pe-x DN16-20:    8-15 €/m
- TUBO multistrato pe-x DN26-32:    12-22 €/m
- TUBO rame ricotto DN16-20:        18-28 €/m
- TUBO rame DN26-32:                25-40 €/m
- TUBO scarico in PP DN40-50:       12-22 €/m
- TUBO scarico in PP DN100-110:     22-35 €/m

## IMPIANTO ELETTRICO (€/punto, ref. DEI cap 07)
- PUNTO luce semplice (con frutto):     45-75 cad
- PUNTO presa 10/16A:                   45-80 cad
- PUNTO presa industriale 16-32A:       80-150 cad
- QUADRO elettrico domestico base:      220-450 cad
- LINEA dorsale dal quadro (per locale): 80-180 cad

## RADIATORI E TERMOREGOLAZIONE
- RADIATORE in alluminio/acciaio (per elemento, fornitura+posa):  35-65 cad
- VALVOLA termostatica radiatore:                                  35-70 cad
- TERMOSTATO/CRONOTERMOSTATO ambiente:                             80-180 cad

## ALTRE VOCI COMUNI
- BOLLITORE accumulo 200-300L (ref. DEI 06.I02B.100):  1.000-1.300 cad
- ADDOLCITORE acqua domestico:                          1.000-1.800 cad
- COLLETTORE distribuzione idraulico (8 vie):             200-400 cad
- VALVOLA intercettazione gas a sfera:                     30-80 cad
- IMPERMEABILIZZAZIONE terrazzo (guaina + posa):           45-80 €/mq
- ISOLAMENTO termico tubazioni (guaina elastomerica):      8-15 €/m`;

const SYSTEM_PROMPT = `Sei l'assistente di stima preventivi di GIAL Termoidraulica (Prato). Analizzi descrizioni di lavori in italiano e produci una stima orientativa basata RIGOROSAMENTE sul catalogo qui sotto.

${CATALOGO}

REGOLE FERREE - DEVI rispettarle TUTTE:

0. MODALITÀ: prima di tutto decidi se hai abbastanza info per stimare.
   • Se mancano info CRITICHE che farebbero variare il prezzo del 50%+ (es: "voglio rifare due bagni" senza dimensioni → range varia da 4.800 a 23.000 per bagno!) → modalita="chiarimento", voci=[], domande_chiarimento con 2-4 domande cliccabili.
   • Se hai abbastanza info per stimare anche con incertezza media → modalita="stima" con voci popolate.
   ESEMPI:
   • "Voglio rifare due bagni uno piccolo e uno grande" → MODALITÀ STIMA. Hai dimensioni. Manca solo finitura → assumi standard, eventualmente in domande_suggerite proponi "Vuoi specificare la finitura?".
   • "Voglio rifare due bagni" → MODALITÀ CHIARIMENTO. L'utente ha detto QUANTITÀ esplicita = 2, quindi fai una domanda PER OGNI bagno (tracciabilità):
     - id="bagno1-dim", testo="Dimensione del primo bagno?" opzioni: <5mq (piccolo) / 5-8mq (medio) / >8mq (grande)
     - id="bagno2-dim", testo="Dimensione del secondo bagno?" opzioni: <5mq (piccolo) / 5-8mq (medio) / >8mq (grande)
     - id="finitura", testo="Livello di finitura desiderato?" opzioni: economico/standard/premium
   • "Voglio rifare 3 bagni" → 3 domande per le dimensioni + 1 finitura.
   • "Voglio rifare i bagni" (senza quantità!) → 2 domande sole:
     - id="bagni-qta", testo="Quanti bagni in totale?" opzioni: 1/2/3/4 o più
     - id="finitura", testo="Livello di finitura?" opzioni: economico/standard/premium
   • "Cambiare la caldaia" → MODALITÀ CHIARIMENTO. Domande:
     - id="caldaia-pot", testo="Potenza appartamento?" opzioni: mono/bilocale, 3-4 locali, villa, con rifacimento impianto
   • "Voglio installare il fotovoltaico" → MODALITÀ CHIARIMENTO. Domande:
     - id="fv-kwp", testo="Consumo annuo o potenza desiderata?" opzioni: <3000kWh / 3000-6000kWh / >6000kWh
   • "5 finestre PVC standard" → MODALITÀ STIMA (hai tutto: 5, PVC, standard).
   • "Sostituzione caldaia 24kW con accumulo" → MODALITÀ STIMA (hai potenza, hai accumulo).

   REGOLA D'ORO sulle domande: una DOMANDA PER OGGETTO se la quantità è esplicita ("due bagni" = 2 domande dimensione, una per bagno). Una DOMANDA AGGREGATA se la quantità è ignota ("i bagni" = 1 domanda per quantità + 1 per finitura).
   NON chiedere mai info che l'utente ha già fornito.

1. SCEGLI MACRO O UNITARIA con criterio:
   • Se l'utente descrive un INTERVENTO TIPICO ("rifacimento bagno", "sostituzione caldaia", "metti il fotovoltaico") → usa una voce MACRO.
   • Se l'utente è ATOMICO ("voglio sostituire solo il vaso WC", "10 metri di tubo multistrato", "tinteggia 30 mq") → usa voci UNITARIE.
   • Se l'utente mischia ("rifacimento bagno + sostituzione caldaia") → una macro per ciascuno.
   • Se la descrizione richiede dettaglio dentro un intervento ("rifacimento bagno con vasca rimossa e box doccia premium") → puoi sommare macro+unitarie. Esempio: macro "BAGNO Medio standard" + unitaria "BOX doccia premium 1.500".

2. USA SOLO PREZZI DEL CATALOGO. Ogni voce DEVE avere min/max che corrispondono ESATTAMENTE a un range del catalogo (eventualmente moltiplicato per la quantità). Non inventare prezzi. Non interpolare. Non fare medie.

3. MOLTIPLICA PER QUANTITÀ solo se gli oggetti sono IDENTICI (stessa dimensione + stessa finitura + stesso materiale).
   • "5 finestre PVC standard" → UNA voce: 490-630 × 5 = 2.450-3.150 con titolo "5 finestre PVC standard". OK.
   • "2 bagni medi standard" → UNA voce: 8.800-12.500 × 2 = 17.600-25.000. OK.
   • "10 metri di tubo multistrato 20mm" → UNA voce: 8-15 × 10 = 80-150. OK.

3-bis. QUANTITÀ ETEROGENEE → VOCI SEPARATE. Se gli oggetti hanno proprietà diverse (dimensione/finitura/materiale diversi), NON moltiplicare: crea una voce per ogni variante.
   • "Rifare 2 bagni, uno piccolo e uno grande" → DUE voci:
       - voce 1: "Bagno piccolo standard"  → 6.200-8.500
       - voce 2: "Bagno grande standard"   → 12.500-17.000
   • "5 finestre: 3 in PVC e 2 in alluminio" → DUE voci:
       - voce 1: "3 finestre PVC standard"     → 490-630 × 3 = 1.470-1.890
       - voce 2: "2 finestre alluminio standard" → 750-950 × 2 = 1.500-1.900
   • "Sostituzione 1 vaso WC, 1 bidet, 1 lavabo" → 1 sola voce CUMULATIVA "Sostituzione 3 sanitari (vaso+bidet+lavabo)" sommando i range (es. 220-380 + 220-360 + 260-500 = 700-1.240) — perché qui sono "fungibili" come categoria sanitari.

3-ter. COMBINAZIONI MACRO + UNITARIE quando una macro non basta. Se l'utente specifica un'aggiunta a un intervento tipico, usa due voci:
   • "Sostituzione caldaia con accumulo" → DUE voci:
       - voce 1: "Caldaia 24kW media potenza"  → 2.440-3.030 (macro)
       - voce 2: "Bollitore accumulo 200-300L" → 1.000-1.300 (unitaria)
   • "Rifacimento bagno con box doccia premium" → DUE voci:
       - voce 1: "Bagno medio standard"        → 8.800-12.500 (macro)
       - voce 2: "Box doccia in cristallo premium" → 1.000-1.500 (unitaria)
   • "Rifacimento bagno + sostituzione 5 finestre" → DUE voci macro distinte.

4. CATEGORIE NON IN CATALOGO: se il lavoro non rientra (es: irrigazione giardino, canna fumaria, sgombero, opere strutturali importanti), NON inventare prezzi. Aggiungi al campo "fuori_listino" come stringa testuale.

5. INFORMAZIONI MANCANTI:
   • Se mancano dimensione/finitura per scegliere il range → copri tutto lo spettro plausibile (es: "voglio rifare il bagno" senza dimensione → 4.800-23.000 unendo da bagno piccolo economico a grande premium) e imposta "incertezza":"alta". Inserisci in "domande_suggerite" 1-2 domande che restringerebbero la stima.
   • Se manca quantità → assumi un default realistico (5 finestre per appartamento, 1 bagno, 1 cucina) e dichiaralo nella nota.

6. INCERTEZZA: bassa = utente ha specificato dimensione+finitura+quantità. media = manca uno dei tre. alta = mancano due+, oppure descrizione vaga.

7. NESSUN MARGINE FUORI CATALOGO. Se il catalogo dice "BAGNO Medio standard 8.800-12.500" il min DEVE essere ≥8.800 e il max ≤12.500. Non aggiungere "premium plus" o "extra economico".

8. MANODOPERA: NON aggiungerla come voce separata se stai usando una voce macro o una voce unitaria con "fornitura+posa" — la manodopera è già inclusa. Aggiungila SOLO se l'utente chiede esplicitamente "quanto costa l'ora del tecnico" o lavori in economia.

9. MASSIMO 6 VOCI. Se l'utente descrive moltissimi lavori, raggruppa o seleziona i 6 più rilevanti.

10. NOTA delle voci: indica sempre quantità, dimensione assunta, finitura, e (per le voci macro) la sigla DEI di riferimento se disponibile (es. "Caldaia 24kW media potenza, ref. DEI 06.I04P.020").

Chiama SEMPRE lo strumento "invia_stima" con i dati strutturati. Non rispondere mai in testo libero.`;

const CATEGORIE_VALIDE = [
    'infissi','bagno','caldaia','clima','pompa','fotovoltaico',
    'cucina','scaldabagno','tinteggiatura','pavimenti','elettrico','terrazzo',
    'manodopera','sanitari','miscelatori','opere_edili','tubazioni','altro'
];

// Range plausibili (in EUR) per validazione lato server. Bound LASCO per scartare
// solo allucinazioni assurde (es. caldaia da 50.000€). Tolleriamo quantità grandi.
const RANGES_PLAUSIBILI = {
    infissi:        [200,   80000],   // ~50 finestre legno premium
    bagno:          [3000,  120000],  // ~5 bagni grandi premium
    caldaia:        [1500,  10000],
    clima:          [800,   10000],
    pompa:          [5000,  35000],
    fotovoltaico:   [4000,  25000],
    cucina:         [2000,  15000],
    scaldabagno:    [400,   4500],
    tinteggiatura:  [400,   3500],
    pavimenti:      [1000,  20000],
    elettrico:      [500,   15000],
    terrazzo:       [1500,  15000],
    manodopera:     [25,    8000],     // 1h..200h*40€
    sanitari:       [100,   3000],     // 1..10 sanitari
    miscelatori:    [50,    2500],
    opere_edili:    [50,    8000],     // demolizioni/posa pavimenti per mq
    tubazioni:      [50,    3500],     // tubi multistrato/rame
    altro:          [50,    50000],
};

const TOOL_SCHEMA = {
    name: 'invia_stima',
    description: 'Invia la stima del preventivo, oppure restituisci domande strutturate se la descrizione è troppo vaga',
    input_schema: {
        type: 'object',
        properties: {
            modalita: {
                type: 'string',
                enum: ['stima','chiarimento'],
                description: 'Usa "chiarimento" se la descrizione è troppo vaga per produrre una stima utile; "stima" altrimenti.'
            },
            voci: {
                type: 'array',
                description: 'Lista delle voci stimate (max 6). Vuoto se modalita=chiarimento.',
                items: {
                    type: 'object',
                    properties: {
                        titolo:    { type: 'string', description: 'Titolo breve della voce (max 90 char)' },
                        categoria: { type: 'string', enum: CATEGORIE_VALIDE },
                        min:       { type: 'integer', description: 'Stima minima in EUR (intero, IVA esclusa)' },
                        max:       { type: 'integer', description: 'Stima massima in EUR (intero, IVA esclusa)' },
                        nota:      { type: 'string', description: 'Quantità, dimensione, finitura, ipotesi, ref. DEI se disponibile' }
                    },
                    required: ['titolo','categoria','min','max']
                }
            },
            totale_min:        { type: 'integer' },
            totale_max:        { type: 'integer' },
            incertezza:        { type: 'string', enum: ['bassa','media','alta'] },
            fuori_listino:     { type: 'array', items: { type: 'string' } },
            domande_chiarimento: {
                type: 'array',
                description: 'SOLO se modalita=chiarimento: 2-4 domande strutturate con opzioni cliccabili per ottenere info mancanti. Una domanda per ogni info che serve davvero.',
                items: {
                    type: 'object',
                    properties: {
                        id:     { type: 'string', description: 'ID kebab-case univoco (es: "bagno1-dim")' },
                        testo:  { type: 'string', description: 'Domanda chiara e diretta' },
                        opzioni: {
                            type: 'array',
                            description: 'Da 2 a 5 alternative cliccabili',
                            items: {
                                type: 'object',
                                properties: {
                                    label: { type: 'string', description: 'Cosa vede l\'utente sul bottone' },
                                    value: { type: 'string', description: 'Valore tecnico (es: "piccolo", "standard")' }
                                },
                                required: ['label','value']
                            }
                        }
                    },
                    required: ['id','testo','opzioni']
                }
            },
            domande_suggerite: { type: 'array', items: { type: 'string' }, description: 'SOLO se modalita=stima: 1-2 suggerimenti testo per affinare ulteriormente' }
        },
        required: ['modalita','voci','totale_min','totale_max','incertezza']
    }
};

function corsHeaders(origin) {
    let allowed = ALLOWED_ORIGINS[0];
    if (ALLOWED_ORIGINS.includes(origin)) allowed = origin;
    else if (LOCAL_ORIGIN_RE.test(origin)) allowed = origin;
    else if (origin === 'null') allowed = 'null'; // file:// in locale per testing
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
    };
}

function jsonResponse(body, status, cors) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json' },
    });
}

// Validazione anti-hallucination lato server: scarta voci con prezzi assurdi,
// clampa nei range plausibili, ricalcola i totali sommando le voci validate.
function validaStima(parsed) {
    if (!parsed || !Array.isArray(parsed.voci)) return null;

    const voci = [];
    for (const v of parsed.voci) {
        if (!v || typeof v !== 'object') continue;
        const cat = String(v.categoria || '').toLowerCase();
        if (!CATEGORIE_VALIDE.includes(cat)) continue;

        let min = Math.max(0, Math.round(Number(v.min) || 0));
        let max = Math.max(min, Math.round(Number(v.max) || 0));
        if (max <= 0) continue;

        const [pmin, pmax] = RANGES_PLAUSIBILI[cat] || [50, 100000];
        // Scarta voci totalmente fuori range plausibile (probabile hallucination)
        if (max < pmin / 2 || min > pmax * 1.5) continue;
        // Tolleranze: lasciamo qualche margine ai bordi
        min = Math.max(min, Math.floor(pmin / 4));
        max = Math.min(max, Math.ceil(pmax * 1.2));

        voci.push({
            titolo:    String(v.titolo || cat).slice(0, 110),
            categoria: cat,
            min,
            max,
            nota: String(v.nota || '').slice(0, 280),
        });

        if (voci.length >= 6) break;
    }

    const totale_min = voci.reduce((s, v) => s + v.min, 0);
    const totale_max = voci.reduce((s, v) => s + v.max, 0);
    const incertezza = ['bassa','media','alta'].includes(parsed.incertezza) ? parsed.incertezza : 'media';

    const fuori_listino = Array.isArray(parsed.fuori_listino)
        ? parsed.fuori_listino.filter(s => typeof s === 'string' && s.length).map(s => s.slice(0, 200)).slice(0, 5)
        : [];
    const domande_suggerite = Array.isArray(parsed.domande_suggerite)
        ? parsed.domande_suggerite.filter(s => typeof s === 'string' && s.length).map(s => s.slice(0, 200)).slice(0, 3)
        : [];

    // Domande strutturate (modalita=chiarimento)
    const domande_chiarimento = Array.isArray(parsed.domande_chiarimento)
        ? parsed.domande_chiarimento.filter(d => d && typeof d === 'object' && d.testo && Array.isArray(d.opzioni) && d.opzioni.length >= 2).slice(0, 4).map(d => ({
            id: String(d.id || '').slice(0, 60).replace(/[^a-z0-9-]/gi, '-') || ('q-' + Math.random().toString(36).slice(2, 8)),
            testo: String(d.testo).slice(0, 200),
            opzioni: d.opzioni.filter(o => o && o.label && o.value).slice(0, 5).map(o => ({
                label: String(o.label).slice(0, 80),
                value: String(o.value).slice(0, 80)
            }))
        })).filter(d => d.opzioni.length >= 2)
        : [];

    // Determina modalita: se l'AI dice chiarimento ma non ha domande, oppure dice stima ma non ha voci, ricalibra
    let modalita = parsed.modalita === 'chiarimento' ? 'chiarimento' : 'stima';
    if (modalita === 'chiarimento' && !domande_chiarimento.length) modalita = 'stima';
    if (modalita === 'stima' && !voci.length && domande_chiarimento.length) modalita = 'chiarimento';

    return { modalita, voci, totale_min, totale_max, incertezza, fuori_listino, domande_suggerite, domande_chiarimento };
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const cors = corsHeaders(origin);

        if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
        if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, cors);

        // Difesa anti-abuso: rifiuta richieste che non arrivano dal sito o da sviluppo locale.
        // (L'header Origin è falsificabile via script, ma questo blocca gli abusi più comuni:
        // curl/bot senza Origin e siti terzi che embeddano l'endpoint. Per una protezione
        // robusta aggiungere una regola di Rate Limiting nel pannello Cloudflare.)
        const originAllowed = ALLOWED_ORIGINS.includes(origin) || LOCAL_ORIGIN_RE.test(origin);
        if (!originAllowed) return jsonResponse({ error: 'Forbidden' }, 403, cors);

        let body;
        try { body = await request.json(); }
        catch { return jsonResponse({ error: 'Invalid JSON' }, 400, cors); }

        const desc = (body.descrizione || '').toString().trim();
        if (desc.length < 10)   return jsonResponse({ error: 'Descrizione troppo breve' }, 400, cors);
        if (desc.length > 2000) return jsonResponse({ error: 'Descrizione troppo lunga' }, 400, cors);

        try {
            const r = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 1800,
                    system: [
                        {
                            type: 'text',
                            text: SYSTEM_PROMPT,
                            cache_control: { type: 'ephemeral' },
                        },
                    ],
                    tools: [TOOL_SCHEMA],
                    tool_choice: { type: 'tool', name: 'invia_stima' },
                    messages: [{ role: 'user', content: desc }],
                }),
            });

            if (!r.ok) {
                const errText = await r.text();
                console.error('Anthropic error', r.status, errText);
                return jsonResponse({ error: 'AI service unavailable' }, 502, cors);
            }

            const data = await r.json();
            const toolUse = (data.content || []).find(b => b && b.type === 'tool_use');
            if (!toolUse || !toolUse.input) {
                return jsonResponse({ modalita: 'stima', voci: [], totale_min: 0, totale_max: 0, incertezza: 'alta', fuori_listino: [], domande_suggerite: [], domande_chiarimento: [] }, 200, cors);
            }

            const validato = validaStima(toolUse.input);
            if (!validato) {
                return jsonResponse({ modalita: 'stima', voci: [], totale_min: 0, totale_max: 0, incertezza: 'alta', fuori_listino: [], domande_suggerite: [], domande_chiarimento: [] }, 200, cors);
            }

            return jsonResponse(validato, 200, cors);
        } catch (e) {
            console.error('Worker error', e);
            return jsonResponse({ error: 'Server error' }, 500, cors);
        }
    },
};
