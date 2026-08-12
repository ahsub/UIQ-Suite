# UERBERGABE-2026-08-12

**Session-Schwerpunkt:** Integritätscheck Versionierung · Track-Record-Absicherung
**Repos berührt:** `ahsub/ko-aggregator` (2 Commits) · `ahsub/ko-modules` (nur Analyse)
**Status Phase 0:** unverändert Lead. Alle Arbeiten heute waren Bugfixes (§4-konform).

---

## 1. Durchgeführte Änderungen (verifiziert)

### `tr_layer.py`

| Ort | Änderung |
|---|---|
| Zeile 45 | `AGG_SHA = (os.environ.get("GITHUB_SHA") or "local")[:12]` |
| Zeile 194 | Feld `"aggSha": AGG_SHA` im Snapshot-Dict von `build_snapshot()` |

### `market_aggregator.py`

| Ort | Änderung |
|---|---|
| Zeile 3 | Docstring-Header `v4.7` → `v5.36.0` |
| Zeile 157 | `AGGREGATOR_VERSION = "5.30.0"` → `"5.36.0"` |
| Zeile ~154 | Warnkommentar zur erneuten Drift ergänzt |

**Verifikation (nicht übernommen, sondern geprüft):** Repo-Stand nach Commit erneut
gezogen, `py_compile` für beide Dateien fehlerfrei, Fallback-Verhalten von `AGG_SHA`
getestet (ohne `GITHUB_SHA` → `"local"`, mit → 12-stelliger Hex).

**Offene Kontrolle:** Ersten gestempelten Snapshot `tr:snap:2026-08-13` nach dem
Nachtlauf (04:00 UTC) prüfen. Erwartung: 12-stelliger Hex-Wert, nicht `"local"`.

---

## 2. Befund, der die Änderung ausgelöst hat

`AGGREGATOR_VERSION` stand auf `5.30.0`, während die Commits **v5.31.0 – v5.36.0**
(07./08.08.2026) bereits in `main` lagen. Die Zeichenfolgen `5.32`–`5.36` kamen im
**gesamten Repository nicht vor** — die Versionen existierten ausschließlich in
Commit-Messages.

Betroffen sind Commits, die den Track Record inhaltlich verändert haben:

- **v5.32.0** — `regimeMeta` in `tr:snap` (Snapshot-Struktur)
- **v5.33.0** — T3 Survivorship-Fix
- **v5.35.0** — Earnings-Gate in allen 4 Options-Scorern (Empfehlungslogik)

**Konsequenz:** Alle Snapshots ab dem 07.08.2026 tragen `aggVersion: "5.30.0"`,
stammen faktisch aber aus mindestens fünf verschiedenen Codeständen mit
unterschiedlicher Scoring-Logik. Anhand des Versionsfelds nicht unterscheidbar.

**Keine Rückwirkung geplant.** Nachträgliche Rekonstruktion wäre geraten. Stattdessen
Fußnote in `docs/TRACK_RECORD_SPEC.md` (siehe §5).

**Wiederholungsfall:** Der Kommentar über `AGGREGATOR_VERSION` dokumentiert bereits
denselben Fehler vom 30.06.2026 (`meta["version"]` hartcodiert, aus dem Gleichschritt
gelaufen). Die damalige Lösung — eine zentrale Konstante — hat sechs Wochen gehalten.
Deshalb jetzt `aggSha`: von GitHub Actions gesetzt, kann nicht vergessen werden.

---

## 3. Weitere Funde (nicht behoben)

| # | Fund | Schwere | Aufwand |
|---|---|---|---|
| 1 | `window.KoPrompts` wird von **ko-prompts.js UND ko-strategies.js** belegt. Ladereihenfolge entscheidet; bei falscher Reihenfolge fehlen `getSystemPrompt()`, `getMorningPrompt()`, `getLbKey()`, `stratFromLb()`. Beide setzen zudem `KoPromptsLoaded = true`. | **Bug** | 10 Min |
| 2 | ko-strategies.js (01.07.2026) ist gegenüber ko-prompts.js (v2.6.0, 05.08.2026) veraltet: 13 statt 14 Strategien, alte Sammel-ID `options` statt `csp_wheel`/`cc`, kein `lbKey`. Vermutlich toter Code. | Hygiene | Prüfen |
| 3 | Versionsangaben uneinheitlich: ko-strategies.js (Header 2.1.0 / Konstante 2.4.0), ko-prompts.js (Header 2.5.0 / Changelog 2.6.0), ko-trackrecord.js (Header 1.0.2 / `TR_VERSION` 1.0.0). 10 von 16 Modulen ohne jede Versionsangabe. | Hygiene | Backlog |
| 4 | Kommentar in ko-strategies.js erklärt `dividend`/`value` für am 17.07.2026 entfernt — beide Objekte stehen weiterhin vollständig im Code. | Hygiene | Backlog |

**Zu Fund 1 zuerst klären:** Wird ko-strategies.js in `index.html` überhaupt noch
eingebunden? Wenn nein → löschen, Risiko erledigt.

---

## 4. Neu festzuschreibende Regeln

> Gehören nach `docs/CODING-RULES.md`; R1 zusätzlich nach `SUITE.md` (§4-Umfeld).

### R1 — Versionsnummern sind keine Protokollinhalte

Versionsnummern werden **nicht** in Übergabeprotokolle geschrieben. Sie werden bei
Bedarf aus dem Code gelesen. Steht in einem Protokoll dennoch eine Version, gilt sie
als **Behauptung, nicht als Fakt**, und ist vor Verwendung zu prüfen.

*Begründung:* Die Angabe „v5.36" wurde über mehrere Sessions fortgeschrieben, ohne
dass jemand die Konstante prüfte. Weder Axel noch Claude konnten am 12.08.2026 sagen,
welcher Stand produktiv lief.

### R2 — Verifikationspflicht bei Handover-Übernahme

Claude kennzeichnet jede aus einem Handover übernommene Aussage als solche und fragt
aktiv nach: **„Hast du das verifiziert oder übernommen?"** Das gilt insbesondere für
Versionen, Dateipfade, Feature-Stände und Roadmap-Positionen.

### R3 — Repo-Zugriff ohne Token

Öffentliche Repos werden über `codeload.github.com/{owner}/{repo}/zip/refs/heads/main`
gelesen. Kein PAT nötig. **Klartext-Credentials im Chat sind unzulässig** — auch nicht
mit anschließendem Widerruf.

*Hinweis:* `api.github.com` ist von geteilten IPs regelmäßig rate-limited. Der
Archiv-Weg ist der zuverlässige.

### R4 — Codestand-Zuordnung über SHA, nicht über Konstanten

Alles, was einem Codestand zugeordnet werden muss (insbesondere Track-Record-Artefakte),
trägt `GITHUB_SHA`. Handgepflegte Versionskonstanten sind **Dokumentation**, keine
Herkunftsangabe. Zweimal gedriftet (30.06. und 07.08.2026) — das Muster ist belegt.

### R5 — Behauptung vs. Prüfung in Claudes Antworten

Aussagen über den Repo-Stand werden nur getroffen, wenn sie im selben Zug geprüft
wurden. Sonst ausdrücklich als Vermutung kennzeichnen.

*Anlass:* Claude schloss aus der fehlenden Zeichenfolge `5.36` im Code, die Version
habe „nie existiert" — die Commit-Historie belegte das Gegenteil. Zweiter Fall:
Verortung von Änderung „1c" auf einem Aggregat-Block, wo sie inhaltlich falsch gewesen
wäre. Beide Male korrigierte erst der Blick ins Repo.

---

## 5. To-do für die nächste Session

1. `tr:snap:2026-08-13` auf gültigen `aggSha` prüfen (nicht `"local"`)
2. `docs/TRACK_RECORD_SPEC.md` (v1.2): Feld `aggSha` dokumentieren + Fußnote
   *„Snapshots vom 07.08.2026 bis 12.08.2026 tragen `aggVersion: 5.30.0`, stammen
   tatsächlich aus den Ständen 5.31.0–5.36.0. Zur Unterscheidung ab 12.08.2026
   `aggSha` verwenden."*
3. Fund 1 (`window.KoPrompts`-Kollision) klären und beheben
4. **Trade-Doktor Block A** — offen: `KoPrompts.get()`-Aufrufstelle im Frontend prüfen.
   Zwischenstand: Erweiterungspunkt ist `ko-prompts.js` (**nicht** ko-strategies.js);
   `buildPrompt(strat, ctx)` ist vom Screening entkoppelt (`ctx.marktkontext` ist ein
   opaker String), daher kein Eingriff in die Scoring-Suite nötig. Scope-Vorschlag:
   Ticker muss im Scan-Universum liegen — kein On-Demand-Enrichment.

---

## 6. Backlog-Zugänge

- CI-Guard: Konstante gegen höchsten Changelog-Eintrag prüfen, Build bricht bei Drift
- Versionsangaben in allen ko-modules vereinheitlichen (10 Module ohne Version)
- `dividend`/`value`: Kommentar oder Code korrigieren
- Lokaler Repo-Klon als unabhängige Kontrollinstanz (kein Sprint, aber überlegenswert)

---

## 7. Nicht bearbeitet (bewusst)

- **Beta-Recruiting / Trade-Doktor-Ausbau** — Phase 1, nach Go/No-Go. Reputationsaufbau
  in Foren läuft über Axels eigenes Fachwissen (Steuerrecht US-Optionen, Post-mortems,
  Methodenfragen) und braucht UIQ nicht. Kein Systemoutput in öffentlichen Threads;
  UIQ bleibt in der Ansprache unerwähnt.
- **Voller Repo-Hygiene-Audit** — bewusst auf den Integritätscheck (Track-Record-Bezug)
  eingegrenzt.
