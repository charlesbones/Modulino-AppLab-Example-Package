# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

# ── Web UI setup ─────────────────────────────────────────────────────────────
# Serve static files from the python/ui/ folder next to this script.
# os.path.abspath(__file__) gives the full path of main.py, and
# os.path.dirname(...) strips the filename to get the folder path.
ui = WebUI()

# ── Bridge helper ─────────────────────────────────────────────────────────────
def _call_mcu(method, *args):
    """Call an RPC method on the MCU and return the parsed state dict."""
    try:
        raw = Bridge.call(method, *args)  # Returns a JSON string from the MCU
        return json.loads(raw)            # Parse it into a Python dict
    except Exception as exc:
        print(f"[bridge] {method} error: {exc}")
        return None

def _broadcast_state(state, room=None):
    """Send a confirmed state update to connected browsers.

    If room is given, send only to that client (used on first connect).
    Otherwise, broadcast to everyone.
    """
    if state and "error" not in state:
        ui.send_message("state_update", state, room=room)

# ── Connection handler ────────────────────────────────────────────────────────
def on_connect(sid):
    """Called when a browser connects. Send the current LED state immediately."""
    state = _call_mcu("get_state")
    _broadcast_state(state, room=sid)

# ── LED control handlers (browser → Python → MCU) ─────────────────────────────
def on_set_pixel(sid, data):
    """Set one LED to the colour and brightness sent by the browser."""
    state = _call_mcu(
        "set_pixel",
        int(data["index"]),
        int(data["r"]),
        int(data["g"]),
        int(data["b"]),
        int(data["brightness"]),
    )
    _broadcast_state(state)

def on_set_all(sid, data):
    """Fill all 8 LEDs with the same colour and brightness."""
    state = _call_mcu(
        "set_all",
        int(data["r"]),
        int(data["g"]),
        int(data["b"]),
        int(data["brightness"]),
    )
    _broadcast_state(state)

def on_set_brightness(sid, data):
    """Change global brightness without touching colours."""
    state = _call_mcu("set_brightness", int(data["brightness"]))
    _broadcast_state(state)

# ── Animation handlers ────────────────────────────────────────────────────────
def on_start_hue_wheel(sid, data):
    """Start the spinning rainbow animation on the MCU."""
    state = _call_mcu("start_hue_wheel")
    _broadcast_state(state)

def on_start_sweep(sid, data):
    """Start the bouncing-dot animation on the MCU, in the chosen colour."""
    state = _call_mcu(
        "start_sweep",
        int(data.get("r", 0)),
        int(data.get("g", 200)),
        int(data.get("b", 255)),
    )
    _broadcast_state(state)

def on_stop_animation(sid, data):
    """Stop whichever animation is running and freeze the LEDs."""
    state = _call_mcu("stop_animation")
    _broadcast_state(state)

# ── Register all handlers ─────────────────────────────────────────────────────
ui.on_connect(on_connect)

ui.on_message("set_pixel",        on_set_pixel)
ui.on_message("set_all",          on_set_all)
ui.on_message("set_brightness",   on_set_brightness)
ui.on_message("start_hue_wheel",  on_start_hue_wheel)
ui.on_message("start_sweep",      on_start_sweep)
ui.on_message("stop_animation",   on_stop_animation)

App.run()
