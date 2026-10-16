#!/bin/bash
# Alle Regressions-Suiten plus sampletest: je Suite PASS/FAIL-Zählung, FAIL-Zeilen und Fehlerstatus
cd "${RUNDIR:-/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad}"
export NODE_PATH=$(npm root -g)
# LOGDIR: eigener Ordner für Protokolle (parallele Läufe), SUITES: nur diese Suiten (Leerzeichen-getrennt), WEBROOT: Arbeitskopie (siehe webroot.js)
L=${LOGDIR:-.}; mkdir -p "$L"
ALL="sampletest simpletest dashtest rptest blindtest settest sixtest shadowtest replaytest proptest friedhoftest voicetest certtest nbsel motiontest settest2 dptest calmtest imgtest figtest figdel undotest mentortest langtest lazytest filtertest gaptest rangetest switchtest scrolltest sidebartest navdottest usercardtest loadtest tiptest anchortest recapmig fwtest coachtest coachlang coachlang2 coupontest affiliatetest tradeformtest colorpickertest scrollareatest notechecktest calmnavtest mobiletest scorestatetest streaktest glidetest tlfittest chartanimtest newstest headtest leaktest statdaystest backuptest fielderrtest w21test"
for s in ${SUITES:-$ALL}; do
  timeout 600 node -r ./de-default.js $s.js > "$L/run_$s.log" 2>&1
  pass=$(grep -c '^PASS' "$L/run_$s.log"); fail=$(grep -c '^FAIL' "$L/run_$s.log"); total=$((pass + fail))
  err=$(grep -E '^(no errors|ERRORS)' "$L/run_$s.log" | head -1)
  crash=$(grep -c '^CRASH' "$L/run_$s.log")
  echo "$s: $pass/$total PASS · $err · crash=$crash"
  grep '^FAIL' "$L/run_$s.log" | cut -c1-200
done
if [ -z "$SUITES" ] || [[ " $SUITES " == *" scrolltest "* ]]; then
# Scroll-Test zusätzlich auf Englisch (ohne Vorlauf = neue Standardwerte): Übersetzung darf keine Scrollstände verschieben
timeout 600 node -r ./webroot.js scrolltest.js > "$L/run_scrolltest_en.log" 2>&1
echo "scrolltest (en): $(grep -c '^PASS' "$L/run_scrolltest_en.log")/$(( $(grep -c '^PASS' "$L/run_scrolltest_en.log") + $(grep -c '^FAIL' "$L/run_scrolltest_en.log") )) PASS · crash=$(grep -c '^CRASH' "$L/run_scrolltest_en.log")"
grep '^FAIL' "$L/run_scrolltest_en.log" | cut -c1-200
fi
echo ALLDONE
