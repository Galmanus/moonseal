"""Export the demo site's COMM windows as absolute epoch intervals, so the
Java ground-verifier can check whether a command's issued_at falls inside an
open direct-to-Earth window. Writes java-spike/command_windows.csv."""
import os, sys
from datetime import datetime, timezone
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from horizons import analyze_real  # noqa

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "java-spike", "command_windows.csv")
LAT, LON = -89.45, 0.0
START, STOP, STEP = "2026-02-01", "2026-03-03", "60 min"

epoch0 = int(datetime(2026, 2, 1, tzinfo=timezone.utc).timestamp())
r = analyze_real(LAT, LON, START, STOP, STEP)
lines = []
for w in r["comm_windows"]:
    s = epoch0 + int(w.start_h * 3600)
    e = epoch0 + int(w.end_h * 3600)
    lines.append(f"{s},{e}")
with open(OUT, "w") as f:
    f.write("\n".join(lines) + "\n")
print(f"epoch0 (2026-02-01 UTC) = {epoch0}")
print(f"{len(lines)} janelas de comunicacao escritas em {OUT}:")
for ln in lines:
    s, e = ln.split(",")
    print(f"   {datetime.fromtimestamp(int(s),timezone.utc)} -> {datetime.fromtimestamp(int(e),timezone.utc)}  UTC")
