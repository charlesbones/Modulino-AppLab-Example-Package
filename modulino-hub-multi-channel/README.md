# 🔀 Modulino Hub – Multi-Channel Dashboard

The **Modulino Hub** is an 8-channel I²C multiplexer. It lets you connect several nodes that would otherwise collide on the same default address by isolating each one on its own channel. This app enables each channel in turn, scans for nodes, and shows an 8-channel map in the browser.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Hub** — TCA9548A 8-channel I²C multiplexer, connected via Qwiic / I²C cable
- **One or more Modulino nodes** — plugged into any of the Hub's 8 channels

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): uses `ModulinoHub` to `select()` each channel in turn, scans the Modulino I²C bus for devices, identifies each node (fixed address or pinstrap register), then `clear()`s the channel. Results are pushed per channel via `Bridge.notify("device_found", channel, addr, name)`. A `rescan` RPC repeats the sweep.
2. **Python app** (`python/main.py`): collects the per-channel results into an 8-channel map and broadcasts `channels_update` to every browser over Socket.IO.
3. **Browser UI** (`assets/`): renders a card per channel showing the nodes found on it, and re-renders whenever a `channels_update` arrives — no polling.

---

## Features

### 8-channel map
One card per channel (0–7) lists every node found on that channel with its type and address. Populated channels are highlighted.

### Same-address, no conflict
Because each channel is an isolated bus, two nodes of the same type — which share one default I²C address — can be read independently as long as they are on different channels. This is exactly what the Hub is for.

### One-click rescan
Re-sweep all eight channels at any time after plugging or unplugging nodes.

---

## About the Modulino Extender

The **Modulino Extender** is a companion module that carries the I²C bus over a differential link for up to ~30 m. Unlike the Hub, it is **electrically transparent**: there is no channel selection and no dedicated library class — a node reached through an Extender behaves exactly as if it were plugged in directly. Because of that, it needs no special code, and any of the other examples in this folder work unchanged over an Extender link. There is intentionally no separate Extender sketch.

---

## Project structure

```
modulino-hub-multi-channel/
├── app.yaml
├── assets/
│   ├── index.html        # Controls + 8-channel grid
│   ├── style.css         # Dark-theme design tokens, channel cards
│   ├── app.js            # WebUI client, renders channels_update
│   └── libs/             # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # ModulinoHub channel select/scan; rescan RPC
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Collects channel map, broadcasts channels_update
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
