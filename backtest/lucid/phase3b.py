"""Phase 3b: Multiple-Testing-Korrektur (Deflated Sharpe Ratio).

Bailey/Lopez de Prado (2014): Bei N unabhaengigen Versuchen ist der erwartete
Maximal-Sharpe unter der Nullhypothese
    E[max SR] = sqrt(V) * ((1-g) z(1-1/N) + g z(1-1/(N e)))
mit V = Varianz der Sharpes ueber die Versuche und g = Euler-Mascheroni.
Die DSR ist die Wahrscheinlichkeit, dass der beobachtete Sharpe diesen
Erwartungswert echt uebertrifft.

Ehrliche Versuchszahlen dieses Projekts:
  42       nur Phase 3
  ~640     Phase 3 + die VWAP- und Gap-Gitter, aus denen die Hypothesen kamen
  ~2.900   zusaetzlich die Verlierer-Jagd (worst_hunt, 5 Instrumente)
  ~380.000 die gesamte Suche dieser Sitzung
"""
import sys, os, math, pickle
from statistics import variance, mean

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from phase3 import deflated_sharpe

grids = pickle.load(open(os.path.join(HERE, "phase3_grids.pkl"), "rb"))
sharpes_tr = [g[3]["sharpe"] for g in grids if g[3]]
sharpes_va = [g[4]["sharpe"] for g in grids if g[4]]

print(f"Phase-3-Gitter: {len(grids)} Zellen, "
      f"{len(sharpes_tr)} mit auswertbarem Train\n")
print(f"Sharpe Train:      Mittel {mean(sharpes_tr):+.2f}  "
      f"SD {math.sqrt(variance(sharpes_tr)):.2f}  "
      f"Max {max(sharpes_tr):+.2f}")
print(f"Sharpe Validation: Mittel {mean(sharpes_va):+.2f}  "
      f"SD {math.sqrt(variance(sharpes_va)):.2f}  "
      f"Max {max(sharpes_va):+.2f}\n")

# Kandidaten: in BEIDEN Perioden positiv
surv = [g for g in grids if g[3] and g[4] and g[3]["sharpe"] > 0 and g[4]["sharpe"] > 0]
print(f"In Train UND Validation positiv: {len(surv)} von {len(grids)}")
for instr, h, par, st, sv in sorted(surv, key=lambda x: -min(x[3]["sharpe"], x[4]["sharpe"])):
    print(f"  {instr.upper()} {h} {par:18s} Train SR {st['sharpe']:+.2f} (N={st['n']}) "
          f"Val SR {sv['sharpe']:+.2f} (N={sv['n']})")

if not surv:
    print("\nKein Kandidat ueberlebt Train und Validation. Ende der Suche.")
    sys.exit(0)

best = max(surv, key=lambda x: min(x[3]["sharpe"], x[4]["sharpe"]))
instr, h, par, st, sv = best
print(f"\nBester Kandidat: {instr.upper()} {h} {par}")

# Gemeinsame Auswertung Train+Validation als beobachteter Sharpe
sr = min(st["sharpe"], sv["sharpe"])
n_obs = st["days"] + sv["days"]
V = variance(sharpes_tr)
print(f"  beobachteter Sharpe (konservativ = min): {sr:+.2f}, "
      f"n_obs = {n_obs} Handelstage")
print(f"  Varianz der Sharpes ueber die Versuche: {V:.3f}\n")

print(f"{'Versuche N':>12} {'E[max SR] unter H0':>20} {'DSR':>10}  Bewertung")
for N in (42, 640, 2_900, 380_000):
    dsr, emax = deflated_sharpe(sr, n_obs, N, V)
    verdict = ("signifikant" if dsr > 0.95 else
               "grenzwertig" if dsr > 0.90 else "nicht signifikant")
    print(f"{N:>12,} {emax:>20.2f} {dsr:>10.3f}  {verdict}")

print("\nLesart: Schon der erwartete Maximal-Sharpe aus reinem Rauschen liegt "
      "bei der\nrealistischen Versuchszahl deutlich ueber dem beobachteten Wert.")
