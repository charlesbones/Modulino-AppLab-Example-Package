# SPDX-FileCopyrightText: Copyright (C) Arduino s.r.l. and/or its affiliated companies
#
# SPDX-License-Identifier: MPL-2.0

# Modulino — Address Changer
#
# Bridges the I²C-scanning sketch to a Web UI over Socket.IO.
# The sketch pushes scan results and change outcomes via Bridge; this app
# keeps the current device list and broadcasts it to every connected browser.
#
# Browser → Python messages:
#   rescan          {}                        — re-scan the I²C bus
#   change_address  {cur_addr, new_addr}      — new_addr 0 resets to default;
#                                               cur_addr 0 broadcasts to all
# Python → Browser messages:
#   devices_update  {devices: [...]}          — full device list after a scan
#   change_result   {success, cur_addr, ...}  — outcome of a change request

import threading

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI()

_lock = threading.Lock()
devices = {}  # addr(int) -> device dict


def _make_device(addr, name, pinstrap, default_addr, configurable):
    configurable = bool(configurable)
    modified = configurable and pinstrap >= 0 and (addr != default_addr)
    return {
        "addr":           addr,
        "addrHex":        f"0x{addr:02X}",
        "name":           name,
        "pinstrap":       pinstrap,
        "pinstrapHex":    f"0x{pinstrap:02X}" if pinstrap >= 0 else "-",
        "defaultAddr":    default_addr,
        "defaultAddrHex": f"0x{default_addr:02X}",
        "configurable":   configurable,
        "modified":       modified,
    }


def _device_list():
    with _lock:
        return sorted(devices.values(), key=lambda d: (not d["configurable"], d["addr"]))


# ── MCU → Python (Bridge notifications from the sketch) ──────────────────────
def on_scan_start():
    with _lock:
        devices.clear()


def on_device_found(addr, name, pinstrap, default_addr, configurable):
    with _lock:
        devices[addr] = _make_device(addr, name, pinstrap, default_addr, configurable)


def on_scan_complete():
    ui.send_message("devices_update", {"devices": _device_list()})


def on_change_result(success, cur_addr, new_addr, message):
    ui.send_message("change_result", {
        "success":  bool(success),
        "cur_addr": cur_addr,
        "new_addr": new_addr,
        "message":  message,
    })


Bridge.provide("scan_start",    on_scan_start)
Bridge.provide("device_found",  on_device_found)
Bridge.provide("scan_complete", on_scan_complete)
Bridge.provide("change_result", on_change_result)


# ── Browser → Python ────────────────────────────────────────────────────────
def on_connect(sid):
    ui.send_message("devices_update", {"devices": _device_list()}, room=sid)


def on_rescan(sid, data):
    Bridge.notify("rescan")


def on_change_address(sid, data):
    cur = int(data.get("cur_addr", 0))
    new = int(data.get("new_addr", 0))
    Bridge.notify("change_address", cur, new)


ui.on_connect(on_connect)
ui.on_message("rescan",         on_rescan)
ui.on_message("change_address", on_change_address)

App.run()
