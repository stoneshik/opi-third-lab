#!/usr/bin/env python3
import subprocess
import sys
import fnmatch
import os

allowed = os.environ.get("DIFF_ALLOWED_FILES", "")
allowed_globs = [a.strip() for a in allowed.split(",") if a.strip()]

result = subprocess.run(
    ["git", "diff", "--name-only"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

files = [f.strip() for f in result.stdout.splitlines() if f.strip()]

if not files:
    print("No changes detected")
    sys.exit(0)

for f in files:
    if not any(fnmatch.fnmatch(f, g) for g in allowed_globs):
        print(f"Forbidden change detected: {f}")
        sys.exit(1)

print("All changes allowed")
sys.exit(0)
