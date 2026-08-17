# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {"temperature": 0.0, "humidity": 0.0}

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

def on_sensor_reading(temperature: float, humidity: float):
    state["temperature"] = round(temperature, 1)
    state["humidity"]    = round(humidity, 1)
    ui.send_message("state_update", state)

ui.on_connect(on_connect)
Bridge.provide("sensor_reading", on_sensor_reading)

App.run()
