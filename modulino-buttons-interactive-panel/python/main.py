# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

# Modulino Buttons — Interactive Panel
#
# Runs on the UNO Q Linux side (MPU).
# Receives button events pushed by the sketch via Bridge.notify() and
# broadcasts real-time state updates to all connected browsers over Socket.IO.
# The browser sends "toggle_led" to control each button's onboard LED.

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

# ── Web UI setup ──────────────────────────────────────────────────────────────
ui = WebUI()

# ── Shared state ──────────────────────────────────────────────────────────────
# counters : per-event-type press counts for each button (A=0, B=1, C=2)
# leds     : current on/off state of each onboard LED
state = {
    "counters": {
        "press":      [0, 0, 0],
        "release":    [0, 0, 0],
        "double_tap": [0, 0, 0],
    },
    "leds": [False, False, False],
}

def _broadcast(room=None):
    """Push the current state to browsers. room=sid targets a single client."""
    ui.send_message("state_update", state, room=room)

# ── MCU → Python: receive button events from the sketch ──────────────────────
def on_button_event(index: int, event_type: str):
    """Called by the sketch on press, release, or double-tap."""
    if 0 <= index <= 2 and event_type in state["counters"]:
        state["counters"][event_type][index] += 1
        _broadcast()

Bridge.provide("button_event", on_button_event)

# ── Connection handler ────────────────────────────────────────────────────────
def on_connect(sid):
    """Send current state immediately when a browser connects."""
    _broadcast(room=sid)

# ── Browser → Python: toggle one LED ─────────────────────────────────────────
def on_toggle_led(sid, data):
    """Flip the LED at the given index and apply it to the hardware."""
    idx = int(data.get("index", -1))
    if 0 <= idx <= 2:
        state["leds"][idx] = not state["leds"][idx]
        Bridge.call("set_led", idx, 1 if state["leds"][idx] else 0)
        _broadcast()

# ── Register handlers ─────────────────────────────────────────────────────────
ui.on_connect(on_connect)
ui.on_message("toggle_led", on_toggle_led)

App.run()
