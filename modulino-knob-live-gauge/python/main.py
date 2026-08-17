# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

# Modulino Knob — Live Gauge
#
# Receives the encoder value and push-button events from the sketch via
# Bridge, keeps a shared state dict, and broadcasts it to every connected
# browser over Socket.IO. The browser can send "reset" to zero the encoder.

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

# ── Shared state ─────────────────────────────────────────────────
# value    : current encoder value (0–100)
# pressed  : whether the push-button is currently held
# counters : running totals per Button2 event type
state = {
    "value":    0,
    "pressed":  False,
    "counters": {"press": 0, "release": 0, "double_tap": 0},
}


def _broadcast(room=None):
    ui.send_message("state_update", state, room=room)


# ── MCU → Python ─────────────────────────────────────────────────
def on_knob_update(value: int):
    state["value"] = value
    _broadcast()


def on_button_event(event_type: str):
    if event_type in state["counters"]:
        state["counters"][event_type] += 1
    if event_type == "press":
        state["pressed"] = True
    elif event_type == "release":
        state["pressed"] = False
    _broadcast()


Bridge.provide("knob_update",  on_knob_update)
Bridge.provide("button_event", on_button_event)


# ── Browser → Python ─────────────────────────────────────────────
def on_connect(sid):
    _broadcast(room=sid)


def on_reset(sid, data):
    Bridge.call("reset_knob")


ui.on_connect(on_connect)
ui.on_message("reset", on_reset)

App.run()
