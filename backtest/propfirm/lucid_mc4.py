import random, sys
sys.path.insert(0, ".")
from lucid_flex_mc import summarize
from lucid_mc2 import sim, fixed
random.seed(31); N = 30000
# Fair-Value-Paare: EV = p*RR - (1-p) = 0  ->  p = 1/(1+RR); "neg" = p - 0.03
pairs = [(0.75, 1/1.75), (1.0, 0.5), (1.25, 1/2.25), (1.5, 0.4), (2.0, 1/3)]
for fee, label in ((136.0, "Flex 136$"), (81.6, "Flex 81.60$ (Code)"), (160.0, "Daily ~160$")):
    model, breach = ("daily", "intraday") if "Daily" in label else ("flex", "eod")
    print(f"\n### {label} | 1 Trade/Tag, Risiko 1.850$ (Konsistenz-Marge) ###")
    for rr, p in pairs:
        for edge, pp in (("fair", p), ("-3pp", p - 0.03), ("+3pp", p + 0.03)):
            summarize(f"RR1:{rr} p={pp:.3f} ({edge})", [sim(fixed(1, 1850, rr=rr, p=pp), fee, model, breach) for _ in range(N)], fee)
