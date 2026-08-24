# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

# Modulino Motors — Motor Control
#
# Forwards browser commands to the sketch's RPCs and broadcasts the returned
# state to every connected browser over Socket.IO. The sketch also streams
# live current/busy telemetry, which is merged into the same state.

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {
    "stepperMode": False,
    "speedA": 0, "speedB": 0,
    "invertA": False, "invertB": False,
    "busy": False,
    "currentA": 0, "currentB": 0,
}


def _broadcast(room=None):
    ui.send_message("state_update", state, room=room)


def _call_mcu(method, *args):
    """Call a sketch RPC that returns full JSON state, then broadcast it."""
    try:
        new_state = json.loads(Bridge.call(method, *args))
        state.update(new_state)
        _broadcast()
    except Exception as exc:
        print(f"[bridge] {method} error: {exc}")


# ── MCU → Python: live telemetry ─────────────────────────────────
# Sent on its own channel (not "state_update") so it never clobbers a
# speed/invert control the browser hasn't applied yet.
def on_telemetry(current_a, current_b, busy):
    state["currentA"] = current_a
    state["currentB"] = current_b
    state["busy"] = bool(busy)
    ui.send_message("telemetry_update", {
        "currentA": current_a, "currentB": current_b, "busy": bool(busy),
    })


Bridge.provide("telemetry", on_telemetry)


# ── Browser → Python ─────────────────────────────────────────────
def on_connect(sid):
    _call_mcu("get_state")
    _broadcast(room=sid)


def on_set_dc(sid, data):
    _call_mcu("set_dc",
              int(data.get("speedA", 0)),  1 if data.get("invertA") else 0,
              int(data.get("speedB", 0)),  1 if data.get("invertB") else 0)


def on_stop(sid, data):
    _call_mcu("stop")


def on_move_stepper(sid, data):
    _call_mcu("move_stepper", int(data.get("steps", 0)), int(data.get("rpm", 60)))


def on_set_mode(sid, data):
    _call_mcu("set_mode", 1 if data.get("stepper") else 0)


ui.on_connect(on_connect)
ui.on_message("set_dc",       on_set_dc)
ui.on_message("stop",         on_stop)
ui.on_message("move_stepper", on_move_stepper)
ui.on_message("set_mode",     on_set_mode)

App.run()
