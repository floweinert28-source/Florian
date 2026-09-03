import random, sys
sys.path.insert(0, ".")
from lucid_flex_mc import summarize
from lucid_mc2 import sim, fixed
random.seed(23); N = 20000; fee = 136.0
print("### Sensitivitaet: 1 Trade/Tag, feste Groesse, Flex (EOD) vs Daily-Regeln; Gebuehr 136$ ###")
for model, breach in (("flex", "eod"), ("daily", "intraday")):
    for risk in (1500, 1900):
        for rr in (0.75, 1.0, 1.25, 1.5):
            for p in (0.45, 0.47, 0.50, 0.53):
                summarize(f"{model:5s} risk {risk} RR1:{rr} p={p}", [sim(fixed(1, risk, rr=rr, p=p), fee, model, breach) for _ in range(N)], fee)
print("\n### 2 Trades/Tag je 950$ (gleiches Tagesrisiko wie 1x1900) ###")
for p in (0.47, 0.50, 0.53):
    summarize(f"flex 2x950 RR1:1 p={p}", [sim(fixed(2, 950, p=p), fee, "flex", "eod") for _ in range(N)], fee)
