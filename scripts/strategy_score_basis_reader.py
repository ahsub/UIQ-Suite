#!/usr/bin/env python3
"""
strategy_score_basis_reader.py — Referenz-Leser für strategy_score_basis_manifest.json
Version 1.0.0 (29.09.2026, Claude + Axel). ENTWURF, nicht eingespielt. Nur Python-Standardbibliothek.

resolve_basis(entry, strategy, manifest) -> "RANKING_SCORE" | "UNAVAILABLE" | "LEGACY_COMPOSITE" | ... | "UNCLASSIFIED"
Verändert niemals den Eintrag. Regeln: siehe reading_rule im Manifest.

Selbsttest:  python3 strategy_score_basis_reader.py [pfad/zum/manifest.json]
"""
import json, os, sys

def load_manifest(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def resolve_basis(entry, strategy, manifest):
    basis_field = manifest["basis_field"]
    if entry.get(basis_field):                       # Regel 1
        return entry[basis_field]
    date = entry.get("date")
    if not date:                                     # ohne Datum keine Zuordnung
        return "UNCLASSIFIED"
    for r in manifest["ranges"]:                     # Regel 2: erster Treffer
        if strategy in r["strategies"] and r["from"] <= date and (r["to"] is None or date <= r["to"]):
            return r["basis"]
    return "UNCLASSIFIED"                            # Regel 3

def _selftest(manifest):
    OPT = ["csp_wheel", "weekly_income", "collar", "cc", "atmna"]
    EQ = ["ko", "momentum", "value"]
    ok = lambda c, m: (c or (_ for _ in ()).throw(AssertionError(m)))
    for s in OPT:
        ok(resolve_basis({"date": "2026-09-16"}, s, manifest) == "LEGACY_COMPOSITE", f"{s}: Von-Datum inklusive")
        ok(resolve_basis({"date": "2026-09-28"}, s, manifest) == "LEGACY_COMPOSITE", f"{s}: Altbestand ohne Feld")
        ok(resolve_basis({"date": "2026-09-15"}, s, manifest) == "UNCLASSIFIED", f"{s}: vor dem Zeitraum")
        ok(resolve_basis({"date": "2026-10-05", "strategy_score_basis": "RANKING_SCORE"}, s, manifest) == "RANKING_SCORE", f"{s}: Feld gewinnt")
        ok(resolve_basis({"date": "2026-10-05", "strategy_score_basis": "UNAVAILABLE"}, s, manifest) == "UNAVAILABLE", f"{s}: UNAVAILABLE bleibt")
        ok(resolve_basis({}, s, manifest) == "UNCLASSIFIED", f"{s}: ohne Datum")
    for s in EQ:
        ok(resolve_basis({"date": "2026-09-20"}, s, manifest) == "UNCLASSIFIED", f"{s}: Equity nicht klassifiziert")
        ok(resolve_basis({"date": "2026-10-05", "strategy_score_basis": "RANKING_SCORE"}, s, manifest) == "RANKING_SCORE", f"{s}: Feld gewinnt")
    e = {"date": "2026-09-20", "strategy_score": 59}
    before = json.dumps(e, sort_keys=True); resolve_basis(e, "atmna", manifest)
    ok(json.dumps(e, sort_keys=True) == before, "Eintrag wurde verändert")
    for v in manifest["basis_values"]:
        ok(v in manifest["basis_values"], v)
    used = {r["basis"] for r in manifest["ranges"]}
    ok(used <= set(manifest["basis_values"]), "Range nutzt unbekannte Basis")
    ok("RECONSTRUCTED_RANKING" not in used, "RECONSTRUCTED_RANKING darf (noch) in keiner Range stehen")
    print("Selbsttest OK")

if __name__ == "__main__":
    p = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "strategy_score_basis_manifest.json")
    _selftest(load_manifest(p))
