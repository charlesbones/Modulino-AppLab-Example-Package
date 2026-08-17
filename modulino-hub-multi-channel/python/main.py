# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

# Modulino Hub — Multi-Channel Dashboard
#
# Collects the per-channel scan results pushed by the sketch and broadcasts
# an 8-channel map to every connected browser over Socket.IO.
#
# Browser → Python:  rescan {}          — re-scan all hub channels
# Python → Browser:  channels_update {channels: [[{addr, addrHex, name}, ...], ...]}

import threading

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

NUM_CHANNELS = 8
_lock = threading.Lock()
channels = [[] for _ in range(NUM_CHANNELS)]


def _snapshot():
    with _lock:
        return [list(ch) for ch in channels]


# ── MCU → Python (Bridge notifications from the sketch) ──────────────────────
def on_scan_start():
    with _lock:
        for ch in channels:
            ch.clear()


def on_device_found(channel: int, addr: int, name: str):
    if 0 <= channel < NUM_CHANNELS:
        with _lock:
            channels[channel].append({
                "addr":    addr,
                "addrHex": f"0x{addr:02X}",
                "name":    name,
            })


def on_scan_complete():
    ui.send_message("channels_update", {"channels": _snapshot()})


Bridge.provide("scan_start",    on_scan_start)
Bridge.provide("device_found",  on_device_found)
Bridge.provide("scan_complete", on_scan_complete)


# ── Browser → Python ────────────────────────────────────────────────────────
def on_connect(sid):
    ui.send_message("channels_update", {"channels": _snapshot()}, room=sid)


def on_rescan(sid, data):
    Bridge.notify("rescan")


ui.on_connect(on_connect)
ui.on_message("rescan", on_rescan)

App.run()
