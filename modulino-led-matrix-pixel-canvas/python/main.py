# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {"pixels": [0] * 96}

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

def on_toggle_pixel(sid, data):
    _broadcast(_call_mcu("toggle_pixel", data["x"], data["y"]))

def on_clear(sid, data):
    _broadcast(_call_mcu("clear_canvas"))

ui.on_connect(on_connect)
ui.on_message("toggle_pixel", on_toggle_pixel)
ui.on_message("clear",        on_clear)

App.run()
