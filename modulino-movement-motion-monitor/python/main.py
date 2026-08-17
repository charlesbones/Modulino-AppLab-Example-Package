# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {"ax": 0.0, "ay": 0.0, "az": 0.0, "gx": 0.0, "gy": 0.0, "gz": 0.0}

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

def on_motion_reading(ax: float, ay: float, az: float,
                      gx: float, gy: float, gz: float):
    state.update({
        "ax": round(ax, 2), "ay": round(ay, 2), "az": round(az, 2),
        "gx": round(gx, 2), "gy": round(gy, 2), "gz": round(gz, 2),
    })
    ui.send_message("state_update", state)

ui.on_connect(on_connect)
Bridge.provide("motion_reading", on_motion_reading)

App.run()
