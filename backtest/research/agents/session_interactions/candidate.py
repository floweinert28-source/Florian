"""Einzel-Kandidat: laeuft eine Kombo mit Parametern, schreibt Trade-CSV und volle Metriken.

Aufruf: python3 candidate.py INSTR TYPE ENTRY SL CONFIRM A S1 B S2END_MIN [buf_frac] [swing_bars] [out_csv]
  z.B. python3 candidate.py NQ cont close swing 30 OPEN.H AM ON.H 960 0.1 10 cand_x.csv
"""
import csv
import sys

sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/session_interactions")
import scan_trades as st  # noqa: E402
from sessions import COST_PTS, USD_PER_PT, build_tdays, is_train, max_drawdown  # noqa: E402


def run(instr, ttype, entry_mode, sl_mode, confirm, A, S1, B, s2_end, buf=0.1, swing=10, prepared=None):
    st.BUF_FRAC = buf
    st.SWING_BARS = swing
    if prepared is None:
        prepared = st.prepare(build_tdays(instr))
    a_sess, a_side = A.split(".")
    b_sess, b_side = B.split(".")
    trades = []
    for rec in prepared:
        tr = st.simulate_day(rec, ttype, entry_mode, sl_mode, confirm, a_sess, a_side, b_sess, b_side, S1, s2_end)
        if tr is not None:
            tr["pnl"] = (tr["pts"] - COST_PTS[instr]) * USD_PER_PT[instr]
            trades.append(tr)
    return trades


def metrics(trades, instr):
    out = {}
    for label, sel in (("train", [t for t in trades if is_train(t["day"])]),
                       ("test", [t for t in trades if not is_train(t["day"])]),
                       ("total", trades)):
        n = len(sel)
        if n == 0:
            out[label] = None
            continue
        wins = sum(1 for t in sel if t["result"] == "TP")
        dec = sum(1 for t in sel if t["result"] in ("TP", "SL"))
        net = sum(t["pnl"] for t in sel)
        mu = net / n
        sd = (sum((t["pnl"] - mu) ** 2 for t in sel) / (n - 1)) ** 0.5 if n > 1 else 0
        out[label] = {"n": n, "net": round(net), "wr": round(wins / dec * 100, 1) if dec else 0,
                      "wr_all": round(wins / n * 100, 1), "rr": round(sum(t["rr"] for t in sel) / n, 2),
                      "per_trade": round(mu), "t": round(mu / (sd / n ** 0.5), 2) if sd > 0 else 0,
                      "time_exits": sum(1 for t in sel if t["result"] == "TIME"),
                      "mdd": round(max_drawdown(sel))}
    years = {}
    for t in trades:
        y = t["day"].year
        n, net = years.get(y, (0, 0.0))
        years[y] = (n + 1, net + t["pnl"])
    out["years"] = {y: (n, round(net)) for y, (n, net) in sorted(years.items())}
    days = sorted({t["day"] for t in trades})
    if days:
        weeks = (days[-1] - days[0]).days / 7
        out["trades_per_week"] = round(len(trades) / weeks, 2)
    return out


def write_csv(trades, path):
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd"])
        for t in trades:
            w.writerow([t["day"].isoformat(), t["dir"], f"{t['entry_t']//60:02d}:{t['entry_t']%60:02d}",
                        round(t["entry"], 2), round(t["sl"], 2), round(t["tp"], 2), t["result"], round(t["pnl"], 2)])


if __name__ == "__main__":
    instr, ttype, entry_mode, sl_mode = sys.argv[1:5]
    confirm = int(sys.argv[5])
    A, S1, B = sys.argv[6:9]
    s2_end = int(sys.argv[9])
    buf = float(sys.argv[10]) if len(sys.argv) > 10 else 0.1
    swing = int(sys.argv[11]) if len(sys.argv) > 11 else 10
    out_csv = sys.argv[12] if len(sys.argv) > 12 else None
    trades = run(instr, ttype, entry_mode, sl_mode, confirm, A, S1, B, s2_end, buf, swing)
    m = metrics(trades, instr)
    print(f"{instr} {ttype} {entry_mode} {sl_mode} confirm={confirm} {A} in {S1} -> {B} bis {s2_end//60:02d}:{s2_end%60:02d} buf={buf} swing={swing}")
    for k in ("train", "test", "total"):
        print(f"  {k:>5}: {m[k]}")
    print(f"  years: {m['years']}  trades/week: {m.get('trades_per_week')}")
    if out_csv:
        write_csv(trades, out_csv)
        print("  ->", out_csv)
