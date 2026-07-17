# UIQ-Suite — Finanzierungskonzept & Kostenkalkulation
**Version 1.0 — 17.07.2026**

⚠️ **Wichtiger Vorbehalt:** Alle Preisangaben in diesem Dokument sind
**illustrative Platzhalter** auf Basis öffentlich bekannter Preisklassen zum
Zeitpunkt der Erstellung. Vor jeder Entscheidung müssen die aktuellen Preise
direkt bei den Anbietern (Anthropic, Twelve Data, Finnhub, Polygon.io etc.)
verifiziert werden — Preise ändern sich, und dieses Dokument wird nicht
automatisch aktualisiert.

---

## 1. Grundprinzip — Migrations-Trigger statt Bauchgefühl

> **Migration von kostenlosen/unsicheren auf kostenpflichtige/sichere
> Anbieter erfolgt NICHT bei Erreichen einer Nutzerzahl, sondern bei
> Erreichen einer Kostendeckungs-Kennzahl:**
>
> **Monatlich wiederkehrende Einnahmen (MRR) ≥ 1,5× geschätzte
> Monatskosten (Daten + KI-Tokens) bei aktueller Nutzerzahl**
>
> Der 1,5×-Puffer fängt Nutzungsschwankungen ab (z.B. volatile Markttage
> mit mehr Briefing-Aufrufen), ohne dass ein einzelner Monat ins Minus rutscht.

---

## 2. Zwei strukturell unterschiedliche Kostenblöcke

### Block A — Marktdaten (weitgehend nutzerzahl-unabhängig)

**Warum:** Der ko-aggregator scannt zentral 2× täglich (Cron: 03:37 UTC /
13:30 UTC) alle ~680 Titel und schreibt in einen gemeinsamen KV-Cache. Alle
Nutzer lesen aus demselben Cache — es gibt keine 1:1-Kopplung zwischen
Nutzerzahl und API-Calls, bis eine anbieterseitige Rate-Limit-Grenze
(Requests/Minute, nicht Requests/Nutzer) erreicht wird.

**Migrationsbedarf (aktuell teils Yahoo Finance via CORS-Proxy — unzuverlässig,
siehe heutige 418/429-Fehler):**

| Anbieter | Kategorie | Typische Einstiegsstufe (illustrativ, VERIFIZIEREN) |
|---|---|---|
| Twelve Data | Kurse/Fundamentaldaten | ~$30-80/Monat je nach Call-Volumen |
| Finnhub | Kurse/Fundamentaldaten | ~$50-100/Monat |
| Polygon.io | US-Aktien production-grade | ~$100-200/Monat |
| Tradier / ORATS / CBOE DataShop | **Echte Optionsketten** (für Options-Doktor) | deutlich teurer, oft $100-500+/Monat |

**Kalkulationsannahme:** Solange nur Kurs-/Fundamentaldaten benötigt werden
(UIQ-Kernbetrieb), ist ein **fixer Kostenblock von ca. 100-150 €/Monat**
realistisch — unabhängig davon, ob 10 oder 500 Nutzer aktiv sind. Der Sprung
zu echten Optionsketten (für Collar/Vertical-Spreads/Options-Doktor) ist ein
separater, höherer Fixkostenblock.

### Block B — KI-Tokens (skaliert linear mit aktiven Nutzern)

**Warum:** Jede Morning-Briefing-Anfrage, jeder DeepDive, jede
Strategieempfehlung ist ein individueller API-Call pro Nutzer — im
Gegensatz zu den Marktdaten gibt es hier keinen gemeinsamen Cache-Effekt
(die KI-Antwort ist zwar cachebar, aber unterschiedliche Nutzer fragen zu
unterschiedlichen Zeiten/Titeln ab).

**Illustrative Kalkulationsannahmen (VERIFIZIEREN gegen aktuelle API-Preise):**

- Ein durchschnittlicher aktiver Nutzer löst geschätzt 3-5 KI-Calls/Handelstag
  aus (1× Morning Briefing, 2-4× DeepDive/Strategieempfehlung)
- ~21 Handelstage/Monat
- Pro Call geschätzt 2.000-4.000 Input-Tokens (Marktkontext) +
  500-1.000 Output-Tokens
- **Bei Nutzung eines Modells der Sonnet-Klasse**: exemplarisch angenommene
  Kosten von ca. 0,02-0,05 € pro Call (Platzhalter — aktuelle Preise auf
  anthropic.com/pricing prüfen)

---

## 3. Kostenkalkulation nach Nutzerzahl (illustrativ)

| Aktive Nutzer | Marktdaten (Block A, fix) | KI-Tokens (Block B, variabel)* | Geschätzte Gesamtkosten/Monat |
|---|---|---|---|
| 1 (nur du) | ~0-30 € (kostenlose Tiers reichen oft) | ~5-15 € | **~5-45 €** |
| 10 | ~100-150 € | ~50-150 € | **~150-300 €** |
| 50 | ~100-150 € | ~250-750 € | **~350-900 €** |
| 200 | ~150-200 € | ~1.000-3.000 € | **~1.150-3.200 €** |
| 1.000 | ~150-250 € (evtl. höherer API-Tier nötig) | ~5.000-15.000 € | **~5.150-15.250 €** |

*\*KI-Token-Kosten sind die dominante, variable Größe — sie bestimmen die
Preisgestaltung eines Abo-Modells maßgeblich.*

**Wichtige Kalkulationskonsequenz für ein späteres Abo-Preismodell:**
Wenn die KI-Kosten pro Nutzer bei ca. 5-15 €/Monat liegen (illustrativ),
muss der Abo-Preis diese Marge deutlich übersteigen (Faustregel: Abo-Preis
≥ 3× variable Kosten pro Nutzer), sonst frisst Erfolg (mehr Nutzer = mehr
Nutzung) die Marge auf, statt sie zu vergrößern.

---

## 4. Migrations-Reihenfolge bei Erreichen der 1,5×-Schwelle

1. **Zuerst:** Marktdaten-Anbieter wechseln (Yahoo/CORS-Proxy → Twelve
   Data/Finnhub/Polygon) — behebt das akute Zuverlässigkeitsproblem
   (CNN-418, Proxy-429 von heute) und ist der günstigere, fixe Kostenblock
2. **Danach, bei weiterem Wachstum:** KI-Kontingente von "Bring your own
   Key" (aktueller Zustand — Nutzer hinterlegen eigenen API-Key) auf einen
   zentral verwalteten, im Abo-Preis eingepreisten Kontingent-Pool umstellen
3. **Optional, bei Bedarf für Options-Doktor:** Echte Optionsketten-Feed
   (Tradier/ORATS) — separater, höherer Fixkostenblock, nur wenn das
   Options-Modul kommerziell tragfähig wird

---

## 4a. BYOK vs. All-Inclusive — zwei Preismodelle, kein Entweder-Oder

**Ausgangslage (17.07.2026):** UIQ nutzt bereits heute "Bring Your Own Key"
(BYOK) — jeder Nutzer hinterlegt seinen eigenen Anthropic-API-Key im
Einstellungs-Tab. UIQ trägt aktuell KEINE KI-Token-Kosten für andere Nutzer.
Das ist kein zukünftiges Konzept, sondern der Status quo.

**Die eigentliche Entscheidung:** Soll BYOK das dauerhafte, einzige
Geschäftsmodell bleiben (reine Plattform-Miete), oder wird zusätzlich ein
All-Inclusive-Modell mit eingepreisten KI-Kontingenten angeboten?

**Abwägung:**

| | BYOK (reine Plattform-Miete) | All-Inclusive (Kontingent im Preis) |
|---|---|---|
| Kostenrisiko für UIQ | Keins — variable KI-Kosten aus Block B entfallen komplett | Trägt Block B, muss im Preis eingepreist sein |
| Preisgestaltung | Einfach — reine Fixgebühr, nutzungsunabhängig | Komplexer — muss Nutzungsschwankungen abfedern |
| Zugangshürde für Nutzer | **Hoch** — eigenes Anthropic-Konto, Kreditkarte, Guthaben, technisches Verständnis von "Tokens"/Rate Limits nötig | **Niedrig** — zahlt einen Betrag, alles läuft transparent im Hintergrund |
| Passt zur Zielgruppe (Freunde/Verwandte, "Bauch-Empfehlung"-Sucher) | Schlecht — genau diese Zielgruppe scheitert eher an der Hürde | Gut — kein technisches Vorwissen nötig |
| Passt zu technisch versierten Beta-Testern | Gut — wer bereits einen API-Key hat (z.B. für Claude Code), hat keine Hürde | Neutral |

**Empfehlung: Hybrid-Modell, kein Entweder-Oder.**

- **BYOK-Tarif** (niedrigerer Plattform-Preis, nur Marktdaten-/Infrastruktur-
  Kosten gedeckt) — für technisch versierte Nutzer, bestehende Beta-Tester,
  preissensible Nutzer die bereits einen API-Key haben
- **All-Inclusive-Tarif** (höherer Preis, deckt Block A + Block B) — für
  die eigentliche Zielgruppe (Freunde/Verwandte ohne technischen Hintergrund,
  die eine "mittelbare Empfehlungsinstanz auf wissenschaftlich fundierter
  Basis" suchen, siehe Chat-Protokoll 17.07.2026) — genau diese Zielgruppe
  ist die, für die BYOK die größte Hürde darstellt

Diese Zweiteilung löst gleichzeitig zwei Probleme: sie hält das Kostenrisiko
für preissensible/technische Nutzer niedrig UND macht das Produkt für die
eigentlich intendierte Zielgruppe (nicht-technische Freunde/Verwandte)
zugänglich, ohne dass UIQ das volle KI-Kostenrisiko für ALLE Nutzer tragen
muss.

---

## 5. Finanzierungswege — rechtliche Einordnung

| Weg | Charakter | Regulatorischer Aufwand |
|---|---|---|
| **Reward-based Crowdfunding** (z.B. Kickstarter-Stil: früher Zugang, Lifetime-Deal) | Vorverkauf/Spende gegen Gegenleistung | Gering — keine Finanzaufsicht-Regularien |
| **Kleines zahlendes Abo aus Beta-Kreis** | Reguläres SaaS-Geschäftsmodell | Gering — normale Umsatzsteuer-/Gewerbepflichten |
| **Equity-/Investment-Crowdfunding** | Schwarmfinanzierung gegen Unternehmensanteile | **Hoch** — Vermögensanlagengesetz/Kleinanlegerschutzgesetz, bei Finanz-Tool mit WpHG-Bezug NUR mit expliziter Rechtsberatung |

**Empfehlung:** Reward-based Crowdfunding oder direktes Abo aus dem
bestehenden Beta-Kreis sind für die aktuelle Größenordnung deutlich
pragmatischer als jede Form von Investment-Crowdfunding.

---

## 6. Zusammenhang mit der strategischen Roadmap (b)/(c)

Diese Kalkulation ist unabhängig davon relevant, ob das Ziel später
Richtung (b) Vermächtnisprojekt oder (c) M&A-Ambition geht (siehe
Chat-Protokoll 17.07.2026) — die 1,5×-Schwelle ist in beiden Fällen der
richtige, nüchterne Auslöser für die Migration weg von kostenlosen/
unsicheren Datenquellen, unabhängig vom langfristigen Ziel.

---

*Nächster Reviewpunkt: bei spürbarem Wachstum des Beta-Testerkreises über
den engen Freundes-/Familienkreis hinaus, oder spätestens nach 6 Monaten
Track Record — Kalkulation mit dann aktuellen Anbieterpreisen neu prüfen.*
