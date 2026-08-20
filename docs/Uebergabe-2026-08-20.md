# Übergabeprotokoll — 20.08.2026 → nächste Session

## PFLICHT-HEADER

**"committed ≠ deployed" — vor Übernahme verifizieren, nicht ungeprüft glauben.**

Diese Session war reine Recherche + Datenbeschaffung + ein gegen echte Daten
getesteter, aber **nicht ins Repo committeter** Patch-Vorschlag. Nichts hiervon
ist bereits live. Konkret zu verifizieren, bevor irgendetwas als "erledigt"
gilt:

1. `cboe_backfill.py` wurde lokal gegen die tatsächlichen CBOE-CSVs getestet
   (Output unten) — aber **nicht** in `voranalyse_regime.py` eingebunden.
   Diese Einbindung ist der nächste konkrete Schritt, kein automatischer.
2. Ob `market_aggregator.py::fetch_mse_history()` seit dem 19.08.-Fix im
   echten GHA-Cron-Lauf tatsächlich wieder frische Daten liefert, wurde in
   dieser Session **nicht** geprüft (nur aus dem Changelog-Text geschlossen,
   der selbst als "live bestätigt" markiert war — sollte trotzdem stichprobig
   im nächsten KV-Abruf gegengecheckt werden).
3. Die Kontaminations-Prüfung (`check_frozen_window_contamination()`) wurde
   nur gegen eine **simulierte** kontaminierte Reihe getestet, nicht gegen
   echte gespeicherte Track-Record-/History-Daten aus dem betroffenen Fenster
   (17.07.–19.08.2026) — falls solche Daten irgendwo persistiert sind
   (KV, Snapshots, Backups), sollten sie mit dieser Funktion tatsächlich
   geprüft werden.

---

## §1 Was heute erledigt wurde

### 1.1 VVIX/SKEW-Datenblocker (Top of mind) — Rohdaten-Beschaffung erledigt

- CBOE-Historical-Data direkt bezogen (kostenlos, kein Login), Lücke seit
  17.07.2026 geschlossen — Daten jetzt lückenlos bis 19.08.2026.
- Vier Rohdateien + ein aufbereitetes Master-Panel erstellt und **bereits
  committet** (Commit "Document CBOE data sources and update process",
  `data/raw_data/` + `data/cboe_vol_panel_daily.csv`).
- Neu: `skew_cm30` — konstante 30-Tage-Restlaufzeit-SKEW-Reihe, aus der
  Term-Structure-Rohdaten linear interpoliert (analog zur VIX-Konstruktions-
  methode) — methodisch sauberer als der rohe `SKEW_History`-Wert.
- Alle vier Quell-URLs verifiziert (drei direkt aus dem CBOE-Seitenquelltext
  per Browsersteuerung ausgelesen, eine von Axel beigesteuert) und in
  `CBOE_DATA_SOURCES.md` dokumentiert, inkl. Refresh-Anleitung.

### 1.2 Root-Cause-Abgleich mit bestehendem Code

Beim Versuch, die CBOE-Daten in die Pipeline einzubinden, im Repo nachgesehen,
was den Blocker eigentlich verursacht hat:

- `market_aggregator.py::fetch_mse_history()` (Zeile 6751) und
  `analysis/voranalyse_regime.py::fetch_yf_series()` litten am selben
  yfinance-Bug: `yf.download()` liefert für `^VIX3M`/`^VVIX`/`^SKEW`
  gelegentlich nur 1 Zeile statt der vollen Historie (Ticker-spezifische
  yfinance-Eigenart, kein Logikfehler im eigenen Code).
- **Beide Funktionen wurden bereits vor dieser Session (18.–19.08.2026) auf
  `yf.Ticker(sym).history()` umgestellt** und laut Changelog live bestätigt.
  Das heißt: Der ursprüngliche Live-Blocker scheint bereits behoben — die
  heutige CBOE-Beschaffung schließt primär die **historische Lücke**
  (17.07.–Fix-Datum) und schafft eine von yfinance unabhängige Langzeit-
  quelle für Backtests, ersetzt aber keinen kaputten Live-Pfad mehr.

### 1.3 Patch-Vorschlag erarbeitet und lokal getestet (nicht committet)

`cboe_backfill.py` — bewusst **nicht** in `market_aggregator.py` eingegriffen
(Live-Pfad ist gerade erst repariert, Risiko eines Regressions-Bruchs höher
als der Nutzen). Stattdessen:

- `fetch_cboe_series(key, start)` — lädt VIX/VVIX/SKEW aus
  `data/raw_data/*.csv`, gibt `None` zurück wenn Datei fehlt.
- `fetch_cboe_or_yf_series(key, start, fetch_yf_series_fn)` — bevorzugt CBOE,
  fällt auf die bestehende `fetch_yf_series()` zurück. Gedacht als Drop-in
  für `voranalyse_regime.py`, ohne dortige Funktion zu ersetzen.
- `check_frozen_window_contamination(series, key)` — prüft, ob eine
  vorhandene Reihe im Fenster ab 17.07.2026 auffällig oft den bekannten
  eingefrorenen Wert (VVIX 104.87 / SKEW 147.28, aus dem Changelog) trägt.
  Liefert nur einen Befund + Empfehlung, **keine automatische Korrektur**.

**Lokal getestet gegen die echten bereinigten CBOE-Daten:**
```
vix: 9254 Tage, 1990-01-02 - 2026-08-19, letzter Wert: 14.89
vvix: 5086 Tage, 2006-03-06 - 2026-08-19, letzter Wert: 86.53
skew: 9209 Tage, 1990-01-02 - 2026-08-19, letzter Wert: 142.93
```
Kontaminations-Check gegen eine künstlich eingefrorene Testreihe erkannte
24/24 simulierte Frozen-Werte korrekt; gegen die echten (sauberen) CBOE-Daten
lieferte er korrekt "nicht kontaminiert" (1 zufälliger Treffer von 24, unter
der Schwelle).

### 1.4 Forschungsansatz "Regime-Antizipation" wiederentdeckt

Im Zuge der Microsoft-Qlib/DDG-DA-Recherche (Konzeptdrift-Vorhersage statt
nur -Erkennung) fiel auf: Das ist im Kern dieselbe Idee wie der
"Stickiness"-Frühwarn-Mechanismus aus dem KO-Scanner-Markov-v3-Indikator
(Chat vom 08.06.2026, AVGO/SMH-Analyse) — Divergenz zwischen Kurshoch und
sinkender Regime-Persistenz als Vorlauf-Signal. Zwei-Ebenen-Modellarchitektur
(Basis-Bayesian-HMM + Antizipations-Layer) und siebenstufiger Umsetzungsplan
im Zwischenstand-Dokument der Regime-Detection-Recherche festgehalten.

---

## §2 Offene Punkte für die nächste Session

1. **`cboe_backfill.py` tatsächlich in `voranalyse_regime.py` einbinden**
   (Import + Aufrufstelle anpassen — bisher nur als eigenständiges Modul
   erstellt und isoliert getestet, noch nicht am echten Skript verdrahtet).
2. **Stichprobe: liefert `fetch_mse_history()` im nächsten echten GHA-Lauf
   tatsächlich frische Werte?** (KV-Direktabfrage, wie in den vorherigen
   Live-Bestätigungen im Changelog üblich — Version 5.36.9/5.36.10-Muster).
3. **Kontaminations-Check gegen echte gespeicherte Daten laufen lassen**,
   falls Track-Record-/History-Snapshots aus dem Fenster 17.07.–19.08.2026
   existieren (`tr:*`-KV-Keys, `backups/`-Verzeichnis) — bisher nur simuliert
   getestet.
4. **SKEW_History-URL nicht explizit im CBOE-Seitenquelltext verifiziert**
   (nur Muster-Analogie zu VIX/VVIX) — bei Gelegenheit gegenchecken.
5. **Regime-Antizipation (§1.4):** Schritt 1+2 aus dem Umsetzungsplan
   (Datenbasis sichern — jetzt erledigt durch heutige CBOE-Beschaffung —,
   SDS-Vortest) sind jetzt tatsächlich startbereit, da die Datenbasis steht.
6. **Client-seitige Paritäts-Lücken aus dem Aggregator-Changelog** (v5.36.11:
   PFLICHTREGEL fehlt im Client-Fallback-Prompt; v5.36.14: ko-indicators.json
   noch nicht nachgezogen) — nicht heutiger Fokus, aber weiterhin offen laut
   Code-Kommentaren, falls das für die nächste Session relevant wird.

---

## §3 Dateien aus dieser Session

| Datei | Zweck | Status |
|---|---|---|
| `CBOE_DATA_SOURCES.md` | Quellen-Doku VIX/VVIX/SKEW/Term-Structure | committet |
| `cboe_vol_loader.py` | Aufbereitung Rohdaten → Master-Panel | erstellt, Status im Repo nicht geprüft |
| `cboe_vol_panel_daily.csv` | Master-Panel (VIX/VVIX/SKEW/CM30) | committet |
| `cboe_backfill.py` | CBOE-first-Loader + Kontaminations-Check | **lokal getestet, NICHT committet** |
| `Regime-Detection-Recherche_Zwischenstand.md` | Literatur-/Methodik-Übersicht + Umsetzungsplan Regime-Antizipation | separates Dokument, außerhalb Repo |
