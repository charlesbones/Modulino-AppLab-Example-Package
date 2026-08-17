# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {"last_duration_ms": 500, "last_power": 50}

POWER_LABELS = {
    25: "Gentle",
    30: "Moderate",
    35: "Medium",
    40: "Intense",
    45: "Powerful",
    50: "Maximum",
}

def _call_mcu(method, *args):
    try:
        return json.loads(Bridge.call(method, *args))
    except Exception as exc:
        print(f"[bridge] {method} error: {exc}")
        return None

def _broadcast(new_state, room=None):
    if new_state and "error" not in new_state:
        state.update(new_state)
        ui.send_message("state_update", state, room=room)

def on_connect(sid):
    _broadcast(_call_mcu("get_state"), room=sid)

def on_buzz(sid, data):
    result = _call_mcu("buzz", data["duration_ms"], data["power_level"])
    _broadcast(result)

def on_stop(sid, data):
    result = _call_mcu("stop_buzz")
    _broadcast(result)

ui.on_connect(on_connect)
ui.on_message("buzz", on_buzz)
ui.on_message("stop", on_stop)

App.run()
