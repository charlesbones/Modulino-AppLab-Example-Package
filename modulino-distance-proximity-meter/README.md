# 📏 Modulino Distance – Proximity Meter

Live Time-of-Flight distance readings stream from the sensor to the browser the moment each measurement is ready, with a visual proximity bar that grows as an object gets closer.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Distance** — VL53L4CD Time-of-Flight sensor, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): polls `distance.available()` every `loop()` iteration; when a fresh measurement is ready it pushes the result to Python via `Bridge.notify("distance_reading", …)`. Also exposes a `get_state` RPC so connecting clients get an immediate reading without waiting for the next push.
2. **Python app** (`python/main.py`): receives `distance_reading` events from the MCU via `Bridge.provide`, updates the shared state dict, and broadcasts `state_update` to all connected browsers over Socket.IO.
3. **Browser UI** (`assets/`): renders the latest values inside `applyState()` on every `state_update` event — no polling, no optimistic updates.

---

## Features

### Live distance readout
The primary display shows the current distance in millimetres (or "Out of range" when the sensor returns NaN). A secondary label shows the same value converted to centimetres for convenience.

### Visual proximity bar
A horizontal bar fills from left to right as an object moves closer — empty at 1300 mm, full at 0 mm — giving an at-a-glance sense of proximity without reading numbers.

### Instant on-connect snapshot
When a new browser tab opens, Python immediately calls `get_state` on the MCU and sends the current reading to that client only, so there is no blank screen while waiting for the next push.

---

## Project structure

```
modulino-distance-proximity-meter/
├── app.yaml
├── assets/
│   ├── index.html        # Primary mm readout, cm secondary label, proximity bar
│   ├── style.css        # Dark-theme design tokens and bar styles
│   ├── app.js            # Socket.IO client and applyState()
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # distance.available() polling; Bridge.notify push; get_state RPC
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Bridge.provide handler; on-connect snapshot; state broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
