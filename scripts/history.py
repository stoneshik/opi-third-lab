#!/usr/bin/env python3
import subprocess
import sys
import shutil
import os
from pathlib import Path

REPO_URL = os.environ.get("SVN_REPO_URL")
WORKDIR = Path(".history-wc")
ANT_TARGET = "compile"
DIFF_FILE = "history.diff"


def run_command(cmd, cwd=None, check=False):
    return subprocess.run(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=check
    )


def svn_head():
    r = run_command(["svn", "info", REPO_URL, "--show-item", "revision"], check=True)
    return int(r.stdout.strip())


def clean_workdir():
    if WORKDIR.exists():
        shutil.rmtree(WORKDIR)


def svn_checkout(rev):
    clean_workdir()
    run_command(
        ["svn", "checkout", "-r", str(rev), REPO_URL, str(WORKDIR)],
        check=True
    )


def ant_compile():
    r = run_command(["ant", ANT_TARGET], cwd=WORKDIR)
    return r.returncode == 0


def svn_diff(rev):
    r = run_command(["svn", "diff", "-c", str(rev), REPO_URL], check=True)
    with open(DIFF_FILE, "w") as f:
        f.write(r.stdout)


def main():
    head = svn_head()
    print(f"HEAD revision: {head}")
    last_working = None
    for rev in range(head, 0, -1):
        print(f"\n=== Trying revision {rev} ===")
        try:
            svn_checkout(rev)
        except subprocess.CalledProcessError:
            print(f"SVN checkout failed at revision {rev}")
            continue
        if ant_compile():
            print(f"Build succeeded at revision {rev}")
            last_working = rev
            break
        else:
            print(f"Build failed at revision {rev}")
    if last_working is None:
        print("ERROR: No working revision found")
        sys.exit(1)
    bad_rev = last_working + 1
    if bad_rev <= head:
        print(f"Generating diff for revision {bad_rev}")
        svn_diff(bad_rev)
        print(f"Diff written to {DIFF_FILE}")
    sys.exit(0)


if __name__ == "__main__":
    main()
