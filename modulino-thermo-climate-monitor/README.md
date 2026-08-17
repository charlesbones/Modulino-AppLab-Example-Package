# 🌡️ Modulino Thermo – Climate Monitor

Live temperature and humidity readings stream from the sensor to the browser automatically every two seconds, no page refresh needed.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Thermo** — HS300x temperature and humidity sensor, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): reads the sensor every 2 seconds using `millis()` and pushes the values to Python via `Bridge.notify("sensor_reading", …)`. Also exposes a `get_state` RPC so connecting clients can get an immediate reading.
2. **Python app** (`python/main.py`): receives `sensor_reading` events from the MCU via `Bridge.provide`, updates the shared state dict, and broadcasts `state_update` to all connected browsers over Socket.IO.
3. **Browser UI** (`assets/`): connects via Socket.IO and renders the latest values inside `applyState()` on every `state_update` event — no polling, no optimistic updates.

---

## Features

### Live sensor readings
Temperature (°C) and humidity (%RH) update automatically every two seconds as the MCU pushes fresh data. The large numeric display makes values easy to read at a glance.

### Instant on-connect snapshot
When a new browser tab opens, Python immediately calls `get_state` on the MCU and sends the current reading to that client only, so there is no blank screen while waiting for the next push cycle.

### Last-updated timestamp
A small timestamp below the cards shows exactly when the most recent reading arrived, using the browser's local time.

---

## Project structure

```
modulino-thermo-climate-monitor/
├── app.yaml
├── assets/
│   ├── index.html        # Two reading cards (temperature + humidity) and timestamp
│   ├── style.css        # Dark-theme design tokens, two-column card grid
│   ├── app.js            # Socket.IO client and applyState()
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Sensor reads every 2 s via millis(); Bridge.notify push; get_state RPC
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Bridge.provide handler; on-connect snapshot; state broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
