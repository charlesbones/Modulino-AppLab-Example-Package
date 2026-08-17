# 💡 Modulino Light – Color Sensing

A live sensor dashboard for the **Modulino Light** module: illuminance, raw ambient, infrared, and RGB channels — with a live color swatch and a human-readable color name — all refreshed automatically in the browser.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Light** — LTR-381RGB-01 ambient light and color sensor, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): exposes a `get_light` RPC that reads every channel (lux, raw ambient, IR, and R/G/B) plus an approximate color name, and returns them as a JSON object.
2. **Python app** (`python/main.py`): calls `get_light` on the MCU every 500 ms and broadcasts `state_update` to all connected browsers. On connect it immediately sends the latest reading so a new tab is never blank.
3. **Browser UI** (`assets/`): renders every channel inside `applyState()` on each `state_update` — no polling in the browser.

---

## Features

### All sensor channels
Illuminance (calibrated lux), raw ambient count, infrared count, and raw R/G/B values (0–255) with bar graphs, refreshed every 500 ms.

### Live color swatch and name
A color block is built from the live RGB reading, alongside a human-readable label (e.g. `VIVID RED`, `DARK BLUE`).

### Color-detection tips
The LTR-381RGB-01 is a **passive sensor** — it has no onboard emitter, so it measures reflected light and lighting conditions affect accuracy:

- **Block direct ambient light** reaching the sensor to avoid interference.
- **Use a stable, consistent light source** aimed at the target object.
- Varying ambient light shifts RGB readings and reduces color classification accuracy.
- Lux and IR readings work correctly under normal ambient lighting with no special setup.

---

## Project structure

```
modulino-light-color-sensing/
├── app.yaml
├── assets/
│   ├── index.html        # Dashboard: light readings, RGB channels, detected color
│   ├── style.css         # Dark-theme design tokens
│   ├── app.js            # WebUI client, updates DOM on state_update
│   └── libs/             # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Reads all channels; exposes get_light RPC
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Polls get_light every 500 ms; broadcasts state_update
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
