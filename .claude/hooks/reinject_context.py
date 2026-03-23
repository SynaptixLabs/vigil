#!/usr/bin/env python3
from __future__ import annotations

import os
import subprocess
from pathlib import Path


def find_root() -> Path:
    env_root = os.environ.get("CLAUDE_PROJECT_DIR")
    if env_root:
        return Path(env_root)
    p = Path.cwd()
    for candidate in [p, *p.parents]:
        if (candidate / ".claude").exists() or (candidate / ".git").exists():
            return candidate
    return p


def safe_git(cmd: list[str], cwd: Path) -> str:
    try:
        out = subprocess.check_output(cmd, cwd=str(cwd), stderr=subprocess.DEVNULL, text=True)
        return out.strip()
    except Exception:
        return "unknown"


def read_state(path: Path) -> str:
    if not path.exists():
        return "No shared cockpit state file found yet. Run /sync-state before the next long milestone."
    text = path.read_text(encoding="utf-8", errors="ignore").strip()
    lines = text.splitlines()
    capped = lines[:120]
    return "\n".join(capped)


def main() -> None:
    root = find_root()
    state_path = root / ".claude" / "state" / "session-state.md"
    branch = safe_git(["git", "branch", "--show-current"], root)
    sha = safe_git(["git", "rev-parse", "--short", "HEAD"], root)
    status = safe_git(["git", "status", "--short"], root)
    status_summary = status.splitlines()[:12]

    print("[Claude cockpit reinjection — Vigil]")
    print("Use the shared state below as the primary continuation context after compaction.")
    print("If it looks stale, refresh it with /sync-state before continuing major work.")
    print("")
    print(f"Git branch: {branch}")
    print(f"Git SHA: {sha}")
    if status_summary:
        print("Recent git status:")
        for line in status_summary:
            print(f"- {line}")
    print("")
    print(read_state(state_path))
    print("")
    print("Preserve: modified files, blockers, next actions, server health, extension load status, and dashboard state.")


if __name__ == "__main__":
    main()
