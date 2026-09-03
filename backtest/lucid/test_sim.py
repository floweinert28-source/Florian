"""Unit-Tests fuer den Lucid-Kontosimulator. Aufruf: python test_sim.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sim import Config, Account

PASS = FAIL = 0


def check(name, cond, detail=""):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"  OK   {name}")
    else:
        FAIL += 1
        print(f"  FAIL {name}  {detail}")


# ------------------------------------------------- 1. MLL-Trailing und Lock
def test_trailing():
    print("\n1. MLL trailt bis 52.100 $ und lockt dann bei 50.100 $")
    a = Account(Config("flex"))
    check("Start-Breach-Level 48.000", a.breach_level == 48_000)

    a.close_day(+500)                       # 50.500
    check("nach +500 -> Breach 48.500", a.breach_level == 48_500,
          f"ist {a.breach_level}")

    a.close_day(-300)                       # 50.200, Hoch bleibt 50.500
    check("Breach folgt nur dem Hoch, nicht dem Ruecksetzer",
          a.breach_level == 48_500, f"ist {a.breach_level}")

    a.close_day(+1_800)                     # 52.000 -> noch nicht ueber 52.100
    check("bei 52.000 noch nicht gelockt", not a.locked)
    check("Breach 50.000", a.breach_level == 50_000, f"ist {a.breach_level}")

    a.close_day(+100)                       # 52.100 -> exakt Initial Trail Balance
    check("bei exakt 52.100 lockt es", a.locked)
    check("Breach-Level 50.100", a.breach_level == 50_100, f"ist {a.breach_level}")

    a.close_day(+5_000)                     # 57.100
    check("Breach-Level bleibt fuer immer 50.100", a.breach_level == 50_100,
          f"ist {a.breach_level}")


# ------------------------------------ 2. Intraday breacht nicht, EOD schon
def test_intraday():
    print("\n2. Intraday-Dip breacht nicht, EOD-Close darunter schon")
    a = Account(Config("flex"))
    a.close_day(-1_000, intraday_low=47_500)   # tief unter 48.000, Close 49.000
    check("Intraday 47.500 unter Breach 48.000 -> lebt", not a.dead)
    check("Kontostand 49.000", a.balance == 49_000)

    a.close_day(-1_100)                        # Close 47.900 <= 48.000
    check("EOD-Close 47.900 unter Breach -> tot", a.dead)

    b = Account(Config("flex", intraday_breach=True))
    b.close_day(-1_000, intraday_low=47_500)
    check("mit intraday_breach=True -> tot", b.dead)

    c = Account(Config("flex"))
    c.close_day(-2_000)                        # exakt auf 48.000
    check("Close exakt auf dem Breach-Level -> tot", c.dead)


# --------------------------------------------- 3. Flex Scaling-Tier
def test_scaling():
    print("\n3. Flex Scaling-Tier wechselt bei 1.000 $ / 2.000 $, in beide Richtungen")
    a = Account(Config("flex"))
    check("Start 2 Minis", a.tier_minis() == 2, f"ist {a.tier_minis()}")

    a.close_day(+999)
    check("Profit 999 -> weiter 2 Minis", a.tier_minis() == 2, f"ist {a.tier_minis()}")
    a.close_day(+1)                             # Profit 1.000
    check("Profit 1.000 -> 3 Minis", a.tier_minis() == 3, f"ist {a.tier_minis()}")
    a.close_day(+999)                           # 1.999
    check("Profit 1.999 -> weiter 3 Minis", a.tier_minis() == 3, f"ist {a.tier_minis()}")
    a.close_day(+1)                             # 2.000
    check("Profit 2.000 -> 4 Minis", a.tier_minis() == 4, f"ist {a.tier_minis()}")

    drops_before = a.tier_drops
    a.close_day(-1_100)                         # Profit 900 -> zurueck auf 2
    check("Drawdown senkt die Tier wieder auf 2", a.tier_minis() == 2,
          f"ist {a.tier_minis()}")
    check("Tier-Ruecksetzer wird gezaehlt", a.tier_drops == drops_before + 1)

    d = Account(Config("direct"))
    d.close_day(+50)
    check("Direct hat kein Scaling, immer 4 Minis", d.tier_minis() == 4)


# ------------------------------------------- 4. Flex Payout-Mechanik
def test_flex_payout():
    print("\n4. Flex: 5x150-Zaehler, 50 % gedeckelt 2.000 $, MLL-Reset")
    a = Account(Config("flex"))
    for _ in range(4):
        a.close_day(+200)
    ok, amt, why = a.payout_ready()
    check("4 Gewinntage reichen nicht", not ok and "4 Gewinntage" in why, why)

    a.close_day(+149)                            # unter 150 -> zaehlt nicht
    ok, amt, why = a.payout_ready()
    check("Tag mit 149 $ zaehlt nicht", not ok, why)

    a.close_day(+150)                            # exakt 150 zaehlt
    ok, amt, why = a.payout_ready()
    check("Tag mit exakt 150 $ zaehlt", ok, why)
    # Profit = 4*200 + 149 + 150 = 1.099 -> 50 % = 549,50, unter Cap
    check("Payout = 50 % des Profits", abs(amt - 549.50) < 0.01, f"ist {amt}")

    # Auf 4.000 $ Profit hochfahren -> Cap greift
    b = Account(Config("flex"))
    for _ in range(5):
        b.close_day(+800)                        # Profit 4.000
    ok, amt, why = b.payout_ready()
    check("bei 4.000 $ Profit greift der Cap von 2.000 $", ok and amt == 2_000,
          f"{amt} ({why})")

    bal_before = b.balance
    b.take_payout()
    check("Payout zieht 2.000 $ ab", b.balance == bal_before - 2_000,
          f"ist {b.balance}")
    check("Breach-Level springt auf 50.100", b.breach_level == 50_100,
          f"ist {b.breach_level}")
    check("Zaehler ist zurueckgesetzt", b.cycle_days == [])
    check("Tier faellt mit dem Profit", b.tier_minis() == 4, f"ist {b.tier_minis()}")
    check("Netto an den Trader = 90 %", abs(b.net_to_trader() - 1_800) < 0.01,
          f"ist {b.net_to_trader()}")

    # Nach Payout: Zaehler laeuft neu
    ok, amt, why = b.payout_ready()
    check("direkt nach Payout kein zweiter moeglich", not ok, why)


# ---------------------------------------- 5. Direct: Goals, Consistency, DLL
def test_direct():
    print("\n5. Direct: Profit Goals, 20 % Consistency, DLL-Sperre, LucidScale")
    a = Account(Config("direct"))
    for _ in range(5):
        a.close_day(+500)                        # 2.500, Goal 1 ist 3.000
    ok, amt, why = a.payout_ready()
    check("2.500 $ verfehlt das erste Goal von 3.000 $",
          not ok and "3000" in why.replace(" ", ""), why)

    a.close_day(+500)                            # 3.000, 6 Tage a 500
    ok, amt, why = a.payout_ready()
    # bester Tag 500 <= 20 % von 3.000 = 600 -> erfuellt
    check("6 gleiche Tage erfuellen die 20 %", ok, why)
    check("Payout 1 gedeckelt bei 2.000 $", amt == 2_000, f"ist {amt}")

    # Consistency-Verletzung
    b = Account(Config("direct"))
    b.close_day(+2_000)                          # ein grosser Tag
    b.close_day(+1_000)
    ok, amt, why = b.payout_ready()
    check("bester Tag 2.000 von 3.000 verletzt die 20 %",
          not ok and "Consistency" in why, why)

    # Genau an der Grenze: 5 Tage a 600 = 3.000, bester = 600 = exakt 20 %
    c = Account(Config("direct"))
    for _ in range(5):
        c.close_day(+600)
    ok, amt, why = c.payout_ready()
    check("exakt 20 % ist noch erlaubt", ok, why)

    # Zweiter Payout hat Goal 2.500
    c.take_payout()
    check("nach Payout Breach-Level 50.100", c.breach_level == 50_100)
    for _ in range(5):
        c.close_day(+480)                        # 2.400 < 2.500
    ok, amt, why = c.payout_ready()
    check("zweites Goal ist 2.500 $", not ok and "2500" in why.replace(" ", ""), why)
    c.close_day(+120)                            # 2.520, bester Tag 480 <= 504
    ok, amt, why = c.payout_ready()
    check("Goal 2 erreicht", ok, why)

    # Caps 4 und 5 sind 2.500
    d = Account(Config("direct"))
    d.payouts = [2_000.0, 2_000.0, 2_000.0]
    for _ in range(6):
        d.close_day(+500)                        # 3.000, bester 500 <= 600
    ok, amt, why = d.payout_ready()
    check("Payout 4 darf 2.500 $", ok and amt == 2_500, f"{amt} ({why})")

    # DLL-Sperre
    e = Account(Config("direct"))
    r = e.close_day(-3_000)                       # weit unter dem DLL von 1.200
    check("DLL stoppt den Tagesverlust bei 1.200 $", r.pnl == -1_200, f"ist {r.pnl}")
    check("DLL-Treffer wird markiert", r.dll_hit)
    check("Konto lebt (Soft Breach)", not e.dead)
    check("Kontostand 48.800", e.balance == 48_800, f"ist {e.balance}")

    # LucidScale ersetzt den Fixed DLL oberhalb der Initial Trail Balance
    f = Account(Config("direct"))
    check("unter 52.100 gilt der Fixed DLL", f.current_dll() == 1_200)
    f.close_day(+2_100)                           # 52.100
    check("ab 52.100 gilt LucidScale: 60 % von 2.100 = 1.260",
          abs(f.current_dll() - 1_260) < 0.01, f"ist {f.current_dll()}")
    f.close_day(+1_000)                           # 53.100 -> 60 % von 3.100 = 1.860
    check("LucidScale steigt mit dem Hoch",
          abs(f.current_dll() - 1_860) < 0.01, f"ist {f.current_dll()}")
    f.close_day(-500)                             # Hoch bleibt 53.100
    check("LucidScale sinkt nie",
          abs(f.current_dll() - 1_860) < 0.01, f"ist {f.current_dll()}")


# --------------------------------------- 6. Steady State nach dem Payout
def test_steady_state():
    print("\n6. Steady State: Puffer nach dem Payout")
    a = Account(Config("flex"))
    for _ in range(5):
        a.close_day(+800)                         # 54.000
    a.take_payout()                               # -2.000 -> 52.000
    check("Kontostand nach Payout 52.000", a.balance == 52_000, f"ist {a.balance}")
    check("Breach-Level 50.100", a.breach_level == 50_100)
    puffer = a.balance - a.breach_level
    check("Puffer 1.900 $", abs(puffer - 1_900) < 0.01, f"ist {puffer}")
    check("noetiger Neuverdienst fuer den naechsten vollen Payout: 2.000 $",
          abs((54_000 - a.balance) - 2_000) < 0.01)


# -------------------------------------------- 7. Max Payouts und Tod
def test_limits():
    print("\n7. Payout-Limit und Breach-Verhalten")
    a = Account(Config("flex"))
    a.payouts = [2_000.0] * 5
    ok, amt, why = a.payout_ready()
    check("nach 5 Payouts ist Schluss", not ok and "5 Payouts" in why, why)

    b = Account(Config("flex"))
    b.close_day(-2_500)
    check("gebreachtes Konto ist tot", b.dead)
    try:
        b.close_day(+100)
        check("weiterhandeln nach Breach wirft", False)
    except RuntimeError:
        check("weiterhandeln nach Breach wirft", True)
    ok, amt, why = b.payout_ready()
    check("gebreachtes Konto zahlt nicht aus", not ok and why == "gebreacht", why)


if __name__ == "__main__":
    for fn in (test_trailing, test_intraday, test_scaling, test_flex_payout,
               test_direct, test_steady_state, test_limits):
        fn()
    print(f"\n{'='*60}\n{PASS} bestanden, {FAIL} fehlgeschlagen")
    sys.exit(1 if FAIL else 0)
