# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json, time
from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

_last_state = None

def _call_mcu():
    global _last_state
    try:
        state = json.loads(Bridge.call("get_light"))
        _last_state = state
        return state
    except Exception as exc:
        print(f"[bridge] get_light error: {exc}")
        return None

def _broadcast(state, room=None):
    if state and "error" not in state:
        ui.send_message("state_update", state, room=room)

def on_connect(sid):
    _broadcast(_last_state if _last_state else _call_mcu(), room=sid)

ui.on_connect(on_connect)

def loop():
    _broadcast(_call_mcu())
    time.sleep(0.5)

App.run(user_loop=loop)
