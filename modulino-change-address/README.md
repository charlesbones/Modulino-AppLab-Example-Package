# 📇 Modulino – Address Changer

Scan the I²C bus, see every connected Modulino node, and reconfigure the address of any configurable one — all from the browser. Handy when two nodes of the same type would otherwise collide on the same default address.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **One or more Modulino nodes** — connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): scans the I²C bus, identifies each node (by fixed address or pinstrap register), and pushes results to Python via `Bridge.notify`. It exposes `change_address` and `rescan` so Python can drive a reconfiguration, then always re-scans so the device list stays current.
2. **Python app** (`python/main.py`): keeps the current device list and broadcasts it to every browser over Socket.IO. It forwards `rescan` and `change_address` messages from the browser to the sketch, and relays each change outcome back.
3. **Browser UI** (`assets/`): renders the device table and updates it whenever a `devices_update` arrives — no polling. Address entry is validated live before anything is sent.

---

## Features

### Live device table
Every device on the bus is listed with its current address, node type, default address, and whether it has been modified. Fixed-address sensors are shown but marked non-configurable.

### Safe address changes
The new-address field validates as you type (range `0x08`–`0x77`, warns if the address is already in use). Changing to an in-use address, or resetting a device, asks for confirmation first.

### Reset to default
Reset one device to its pinstrap default, or broadcast a reset to **all** configurable devices at once.

### Same-address tip
Two identical nodes share one default address and appear as a single entry. The UI explains how to isolate and reconfigure them one at a time.

---

## Project structure

```
modulino-change-address/
├── app.yaml
├── assets/
│   ├── index.html        # Status bar, controls, tip box, device table
│   ├── style.css         # Dark-theme design tokens, table and badge styles
│   ├── app.js            # WebUI client, validation, render on devices_update
│   └── libs/             # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # I²C scan, change_address / rescan RPCs
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Device registry, Socket.IO broadcast, change forwarding
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
