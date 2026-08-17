# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

def _call_mcu(method, *args):
    try:
        return json.loads(Bridge.call(method, *args))
    except Exception as exc:
        print(f"[bridge] {method} error: {exc}")
        return None

def on_play_note(sid, data):
    frequency = int(data.get("frequency", 440))
    _call_mcu("play_note", frequency)

ui.on_message("play_note", on_play_note)

App.run()
