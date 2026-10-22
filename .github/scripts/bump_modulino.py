"""Pin Arduino_Modulino and its dependencies to their latest versions in every sketch.yaml.

Reads the official Arduino library index, rewrites the pins in place, adds any
dependency the new Modulino release introduced, and prints `version=<x.y.z>`
to $GITHUB_OUTPUT (or stdout) for the release workflow.
"""

import gzip
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

INDEX_URL = "https://downloads.arduino.cc/libraries/library_index.json.gz"
LINE = re.compile(r"^(\s*- (?:dependency: )?)(.+?) \(([^)]*)\)\s*$")


def _key(version):
    return tuple(int(p) for p in version.split("."))


def latest_versions(index):
    best = {}
    for lib in index["libraries"]:
        if not re.fullmatch(r"\d+(\.\d+)*", lib["version"]):  # skip pre-releases
            continue
        cur = best.get(lib["name"])
        if cur is None or _key(lib["version"]) > _key(cur["version"]):
            best[lib["name"]] = lib
    return best


def pins_for_modulino(best):
    modulino = best["Arduino_Modulino"]
    pins = {"Arduino_Modulino": modulino["version"]}
    for dep in modulino.get("dependencies", []):
        pins[dep["name"]] = best[dep["name"]]["version"]
    return pins


def rewrite(text, pins):
    out, seen = [], set()
    for line in text.splitlines(keepends=True):
        m = LINE.match(line)
        if m and m.group(2) in pins:
            name = m.group(2)
            seen.add(name)
            line = f"{m.group(1)}{name} ({pins[name]})\n"
            if name == "Arduino_Modulino":
                modulino_at = len(out)
        out.append(line)
    if "Arduino_Modulino" not in seen:
        return text
    indent = re.match(r"\s*", out[modulino_at]).group(0)
    missing = [f"{indent}- dependency: {n} ({v})\n" for n, v in pins.items() if n not in seen]
    out[modulino_at + 1:modulino_at + 1] = missing
    return "".join(out)


def main():
    with urllib.request.urlopen(INDEX_URL) as resp:
        index = json.loads(gzip.decompress(resp.read()))
    pins = pins_for_modulino(latest_versions(index))
    for path in sorted(Path(".").glob("*/sketch/sketch.yaml")):
        old = path.read_text()
        new = rewrite(old, pins)
        if new != old:
            path.write_text(new)
            print(f"updated {path}", file=sys.stderr)
    with open(os.environ.get("GITHUB_OUTPUT", "/dev/stdout"), "a") as fh:
        fh.write(f"version={pins['Arduino_Modulino']}\n")


if __name__ == "__main__":
    main()
