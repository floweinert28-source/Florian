#!/bin/bash
# Testlauf gegen einen Arbeitsbaum (Repo oder git-Worktree): Suiten aus <baum>/web/e2e, App aus <baum>/web.
# Aufruf: runtree.sh <baum> [suite …]   (ohne Suiten: alle aus runall.sh; Coach-Suiten nur, wenn ausdrücklich genannt
# oder der Baum das Repo selbst ist, weil sie feste Ports und eine gemeinsame Datenbank nutzen)
SP=/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad
TREE=$(cd "${1:-/home/user/Florian}" && pwd) || exit 2; shift
RUN="$SP/runs/${RUNNAME:-$(basename "$TREE")}"; rm -rf "$RUN"; mkdir -p "$RUN/logs"
cp "$TREE"/web/e2e/*.js "$TREE"/web/e2e/runall.sh "$RUN"/ && cp -r "$TREE"/web/e2e/i18n "$RUN"/ 2>/dev/null; cp "$TREE"/web/e2e/*.png "$RUN"/ 2>/dev/null  # Testbilder (imgtest, figtest, figdel)
ln -s "$SP/fonts-local" "$RUN/fonts-local"; cp "$SP/sample-dev.html" "$SP/smtpsink.py" "$RUN"/
SUITES="$*"
if [ -z "$SUITES" ] && [ "$TREE" != "/home/user/Florian" ]; then
  SUITES=$(grep -oE '^ALL="[^"]*' "$RUN/runall.sh" | sed 's/^ALL="//' | tr ' ' '\n' | grep -vE '^(coachtest|coachlang|coachlang2)$' | tr '\n' ' ')
fi
echo "Baum: $TREE · Protokolle: $RUN/logs"
RUNDIR="$RUN" LOGDIR="$RUN/logs" WEBROOT="$TREE/web" SUITES="$SUITES" bash "$RUN/runall.sh"
