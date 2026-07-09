#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Estrae e ricalcola le fasce di prezzo reali dal Prezzario DEI Toscana 2026 (Firenze)
per aggiornare i cataloghi del sito GIAL (worker.js, index.html, landing, guida).
Non ridistribuisce il prezzario: produce solo statistiche aggregate derivate."""
import csv
import re
import statistics
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "Prezzario DEI Firenze 2026"
ART = BASE / "Firenze-Articolo-2026.csv"
REL = BASE / "estratto" / "dei-rilevanti-grezzo.csv"


def pct(values, p):
    if not values:
        return None
    values = sorted(values)
    k = (len(values) - 1) * p
    f, c = int(k), min(int(k) + 1, len(values) - 1)
    if f == c:
        return values[f]
    return values[f] + (values[c] - values[f]) * (k - f)


def summarize(values, label):
    if not values:
        print(f"{label}: NESSUN DATO")
        return None
    values = sorted(values)
    r = {
        "n": len(values),
        "min": values[0],
        "p10": pct(values, 0.10),
        "p50": pct(values, 0.50),
        "p90": pct(values, 0.90),
        "max": values[-1],
        "avg": statistics.mean(values),
    }
    print(f"{label}: n={r['n']} p10={r['p10']:.0f} p50={r['p50']:.0f} p90={r['p90']:.0f} min={r['min']:.0f} max={r['max']:.0f}")
    return r


# ---------- 1) Articolo CSV (grande, pipe-delimited, quotato) ----------
def load_articolo(prefix_filters):
    """prefix_filters: dict[name] = regex prefix su Codice. Ritorna dict[name] = list of (codice, prezzo, unita, desc5)."""
    out = {k: [] for k in prefix_filters}
    with open(ART, encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f, delimiter="|", quotechar='"')
        header = next(reader)
        for row in reader:
            if len(row) < 9:
                continue
            codice = row[0]
            for name, rx in prefix_filters.items():
                if rx.match(codice):
                    try:
                        prezzo = float(row[8])
                    except (ValueError, IndexError):
                        continue
                    unita = row[6] if len(row) > 6 else ""
                    desc = row[4] if len(row) > 4 else ""
                    articolo = row[5] if len(row) > 5 else ""
                    out[name].append((codice, prezzo, unita, desc, articolo))
    return out


print("=" * 70)
print("CALDAIE (cap. 06.I04P) — fornitura+posa per fascia di potenza")
print("=" * 70)
caldaia_filters = {"caldaia": re.compile(r'^TOS26_06\.I04P\.')}
caldaia_data = load_articolo(caldaia_filters)["caldaia"]
caldaia_kw = []  # (codice, prezzo, kw_min, kw_max)
for codice, prezzo, unita, desc, articolo in sorted(caldaia_data, key=lambda x: x[1]):
    kw = re.search(r"Potenza utile minima \(kW\):\s*([\d,]+)\s*Potenza utile massima \(kW\):\s*([\d,]+)", articolo)
    if kw:
        kmin = float(kw.group(1).replace(",", "."))
        kmax = float(kw.group(2).replace(",", "."))
        caldaia_kw.append((codice, prezzo, kmin, kmax))
        print(f"  {codice}  {prezzo:>9.2f} EUR  ({kmin:g}-{kmax:g} kW)")
    else:
        print(f"  {codice}  {prezzo:>9.2f} EUR  (kW n/d: {articolo[:60]})")

def caldaia_bracket(kw_lo, kw_hi, label):
    vals = [p for _, p, kmin, kmax in caldaia_kw if kmax <= kw_hi and kmax >= kw_lo]
    summarize(vals, label)

print("\n--- fasce residenziali ricalcolate ---")
caldaia_bracket(0, 24, "Caldaia mono/bilocale (fino a 24kW)")
caldaia_bracket(25, 35, "Caldaia appartamento 90-120mq (25-35kW)")
caldaia_bracket(36, 50, "Caldaia villa >120mq (36-50kW)")

print()
print("=" * 70)
print("INFISSI (cap. PR.P70) — SOLO MATERIALE EUR/m2, esclusa posa")
print("=" * 70)
infissi_filters = {
    "pvc": re.compile(r'^TOS26_PR\.P70\.002\.'),
    "alluminio": re.compile(r'^TOS26_PR\.P70\.003\.'),
    "legno": re.compile(r'^TOS26_PR\.P70\.001\.'),
    "legnoalluminio": re.compile(r'^TOS26_PR\.P70\.004\.'),
    "tapparelle": re.compile(r'^TOS26_PR\.P70\.032\.'),
}
infissi_data = load_articolo(infissi_filters)
infissi_stats = {}
for name, rows in infissi_data.items():
    prezzi = [p for _, p, _, _, _ in rows]
    infissi_stats[name] = summarize(prezzi, name)

print()
print("=" * 70)
print("POMPA DI CALORE ARIA-ACQUA e SCALDABAGNO (ricerca per parola chiave)")
print("=" * 70)
with open(ART, encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f, delimiter="|", quotechar='"')
    next(reader)
    pompa_rows, scaldabagno_rows, foto_rows = [], [], []
    for row in reader:
        if len(row) < 9:
            continue
        blob = " ".join(row[3:6]).lower()
        try:
            prezzo = float(row[8])
        except ValueError:
            continue
        unita = row[6]
        if "pompa di calore" in blob and ("aria/acqua" in blob or "aria-acqua" in blob or "acs" in blob or "riscaldamento" in blob) and "condizionatore" not in blob and "multisplit" not in blob and "split" not in blob:
            pompa_rows.append((row[0], prezzo, unita, row[4][:90]))
        if ("scaldabagno" in blob or "accumulo" in blob and "pompa di calore" in blob) and unita == "cad":
            scaldabagno_rows.append((row[0], prezzo, unita, row[4][:90]))
        if "fotovoltaic" in blob and unita in ("kW", "kWp", "cad"):
            foto_rows.append((row[0], prezzo, unita, row[4][:90]))

print(f"Trovate {len(pompa_rows)} righe 'pompa di calore aria-acqua'")
for c, p, u, d in sorted(pompa_rows, key=lambda x: x[1])[:15]:
    print(f"  {c}  {p:>9.2f} {u}  {d}")

print(f"\nTrovate {len(scaldabagno_rows)} righe 'scaldabagno/accumulo a pompa di calore'")
for c, p, u, d in sorted(scaldabagno_rows, key=lambda x: x[1])[:10]:
    print(f"  {c}  {p:>9.2f} {u}  {d}")

print(f"\nTrovate {len(foto_rows)} righe 'fotovoltaico' (unita kW/kWp/cad)")
for c, p, u, d in sorted(foto_rows, key=lambda x: x[1])[:15]:
    print(f"  {c}  {p:>9.2f} {u}  {d}")

# ---------- 2) dei-rilevanti-grezzo.csv (piccolo, gia' curato) ----------
print()
print("=" * 70)
print("VOCI CURATE (dei-rilevanti-grezzo.csv): sanitari, tubazioni, posa infissi, elettrico, clima, manodopera")
print("=" * 70)


def load_rel():
    rows = []
    with open(REL, encoding="latin-1") as f:
        for line in f:
            line = line.strip().strip('"')
            parts = line.split("|")
            if len(parts) < 4:
                continue
            codice, unita, prezzo_txt, desc = parts[0], parts[1], parts[2], parts[3]
            m = re.search(r"([\d.]+)", prezzo_txt.replace(",", "."))
            if not m:
                continue
            rows.append((codice, unita, float(m.group(1)), desc))
    return rows


rel_rows = load_rel()


def filter_rel(prefix):
    return [(c, u, p, d) for c, u, p, d in rel_rows if c.startswith(prefix)]


sanitari = filter_rel("TOS26_06.I01F")
summarize([p for _, _, p, _ in sanitari], "sanitari (06.I01F, cad)")

tubazioni = filter_rel("TOS26_06.I01A")
summarize([p for _, _, p, _ in tubazioni], "tubazioni (06.I01A, €/m)")

posa_infissi = filter_rel("TOS26_02.E07.005")
summarize([p for _, _, p, _ in posa_infissi], "posa infissi (02.E07.005, cad)")

elettrico = filter_rel("TOS26_07.I05")
summarize([p for _, _, p, _ in elettrico], "punti elettrici (07.I05, cad)")

clima = filter_rel("TOS26_06.I06A")
for c, u, p, d in sorted(clima, key=lambda x: x[2]):
    print(f"  clima {c}  {p:>9.2f} {u}  {d[:70]}")

ru = filter_rel("TOS26_RU") + [r for r in rel_rows if "TOS26_AT" in r[0] or ".RU." in r[0]]
if not ru:
    ru = [r for r in rel_rows if "manodopera" in r[3].lower() or "operaio" in r[3].lower()]
summarize([p for _, _, p, _ in ru], "manodopera RU (€/h)")

print()
print("=== ricerca rivestimenti/piastrelle in tutte le voci curate ===")
riv = [r for r in rel_rows if "piastrell" in r[3].lower() or "rivestiment" in r[3].lower()]
summarize([p for _, _, p, _ in riv], "rivestimenti (curato)")

print()
print("=== ricerca pavimenti in tutte le voci curate ===")
pav = [r for r in rel_rows if "pavimento" in r[3].lower() or "gres" in r[3].lower()]
summarize([p for _, _, p, _ in pav], "pavimenti (curato)")

print()
print("=== ricerca tinteggiatura in tutte le voci curate ===")
tin = [r for r in rel_rows if "tinteggiatura" in r[3].lower() or "pittura" in r[3].lower()]
summarize([p for _, _, p, _ in tin], "tinteggiatura (curato)")
