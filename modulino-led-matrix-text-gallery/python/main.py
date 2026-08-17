# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

import json

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

state = {"mode": 0, "selected": -1, "text": ""}

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

def on_show_item(sid, data):
    _broadcast(_call_mcu("show_item", data["index"]))

def on_scroll_text(sid, data):
    text = data.get("text", "")[:64]
    if not text:
        return
    # Pack 8 ASCII chars per call (4 per int arg) to reduce Bridge round-trips.
    # Fewer calls means the total transfer stays well within the 10 s RPC timeout
    # even for the maximum 64-char input (8 calls + 1 trigger = 9 total).
    for chunk_start in range(0, len(text), 8):
        pos = chunk_start // 8
        chunk = (text[chunk_start : chunk_start + 8]).ljust(8, "\x00")
        v1 = sum((ord(chunk[i]) & 0x7F) << (8 * i) for i in range(4))
        v2 = sum((ord(chunk[4 + i]) & 0x7F) << (8 * i) for i in range(4))
        _call_mcu("text_op", pos, v1, v2)
    _broadcast(_call_mcu("text_op", -1, len(text), 0))

def on_stop(sid, data):
    _broadcast(_call_mcu("stop"))

ui.on_connect(on_connect)
ui.on_message("show_item",    on_show_item)
ui.on_message("scroll_text",  on_scroll_text)
ui.on_message("stop",         on_stop)

App.run()
