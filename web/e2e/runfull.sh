#!/bin/bash
# Voller Testlauf in 3 parallelen Teilen gegen einen Arbeitsbaum (Repo oder Worktree). Coach-Suiten (feste Ports) laufen gemeinsam in Teil 1.
# Aufruf: runfull.sh [baum]   Ausgabe: je Suite eine Zeile, am Ende SUMME und ALLDONE
SP=/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad
TREE=$(cd "${1:-/home/user/Florian}" && pwd) || exit 2
ALL=$(grep -oE '^ALL="[^"]*' "$TREE/web/e2e/runall.sh" | sed 's/^ALL="//')
S1="coachtest coachlang coachlang2"; S2=""; S3=""; i=0
for s in $ALL; do case " coachtest coachlang coachlang2 " in *" $s "*) continue;; esac; case $((i % 3)) in 0) S1="$S1 $s";; 1) S2="$S2 $s";; 2) S3="$S3 $s";; esac; i=$((i+1)); done
B=$(basename "$TREE"); T0=$(date +%s)
RUNNAME="$B-1" bash "$TREE/web/e2e/runtree.sh" "$TREE" $S1 > "$SP/runs/full-$B-1.out" 2>&1 &
RUNNAME="$B-2" bash "$TREE/web/e2e/runtree.sh" "$TREE" $S2 > "$SP/runs/full-$B-2.out" 2>&1 &
RUNNAME="$B-3" bash "$TREE/web/e2e/runtree.sh" "$TREE" $S3 > "$SP/runs/full-$B-3.out" 2>&1 &
wait
cat "$SP/runs/full-$B-1.out" "$SP/runs/full-$B-2.out" "$SP/runs/full-$B-3.out" | grep -vE '^(Baum:|ALLDONE)'
echo "SUMME: $(cat "$SP"/runs/full-$B-[123].out | grep -cE '^[a-z0-9]+( \(en\))?: ') Suiten, nicht voll grün: $(cat "$SP"/runs/full-$B-[123].out | grep -E '^[a-z0-9]+( \(en\))?: ' | awk '{n=($2=="(en):")?$3:$2; split(n,a,"/"); if (a[1]!=a[2] || $0 ~ /crash=[1-9]/ || $0 ~ /ERRORS/) print $1}' | tr '\n' ' ') · Dauer $(( ($(date +%s) - T0) / 60 )) min"
echo ALLDONE
