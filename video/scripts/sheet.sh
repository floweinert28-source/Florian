#!/usr/bin/env bash
# Tiles stills into a 2-column contact sheet: scripts/sheet.sh out.png a.png b.png ...
set -e
out=$1; shift
n=$#; inputs=(); layout=""
for i in $(seq 0 $((n-1))); do
  inputs+=(-i "${@:$((i+1)):1}")
  col=$((i%2)); row=$((i/2))
  x=$([ $col -eq 0 ] && echo 0 || echo w0); y=0
  for r in $(seq 1 $row); do y="${y}+h0"; done
  layout="${layout}${x}_${y}|"
done
if [ $n -eq 1 ]; then cp "$1" "$out"; exit 0; fi
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "xstack=inputs=$n:layout=${layout%|}:fill=white" "$out"
