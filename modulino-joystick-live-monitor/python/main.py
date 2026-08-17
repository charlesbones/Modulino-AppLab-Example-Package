# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {
    "x": 0,
    "y": 0,
    "counters": {
        "press":      0,
        "release":    0,
        "double_tap": 0,
    },
}

def _broadcast(room=None):
    ui.send_message("state_update", state, room=room)

def _call_mcu(method, *args):
    try:
        return json.loads(Bridge.call(method, *args))
    except Exception as exc:
        print(f"[bridge] {method} error: {exc}")
        return None

def on_connect(sid):
    snap = _call_mcu("get_state")
    if snap:
        state["x"] = snap.get("x", 0)
        state["y"] = snap.get("y", 0)
    _broadcast(room=sid)

def on_joystick_event(x: int, y: int):
    state["x"] = x
    state["y"] = y
    _broadcast()

def on_button_event(event_type: str):
    if event_type in state["counters"]:
        state["counters"][event_type] += 1
        _broadcast()

ui.on_connect(on_connect)
Bridge.provide("joystick_event", on_joystick_event)
Bridge.provide("button_event", on_button_event)

App.run()
