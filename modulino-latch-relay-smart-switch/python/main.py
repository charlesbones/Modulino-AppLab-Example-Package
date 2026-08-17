# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {"status": -1}

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

def on_relay_on(sid, data):
    _broadcast(_call_mcu("relay_on"))

def on_relay_off(sid, data):
    _broadcast(_call_mcu("relay_off"))

ui.on_connect(on_connect)
ui.on_message("relay_on",  on_relay_on)
ui.on_message("relay_off", on_relay_off)

App.run()
