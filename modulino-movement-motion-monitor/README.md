# 🏃 Modulino Movement – Motion Monitor

Live accelerometer and gyroscope readings stream from the IMU to the browser ten times a second, displayed as bidirectional bars and numeric values for all six axes.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Movement** — LSM6DSOX 6-axis IMU (accelerometer + gyroscope), connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): reads all six axes every 100 ms using `millis()` and pushes them to Python via `Bridge.notify("motion_reading", ax, ay, az, gx, gy, gz)`. Also exposes a `get_state` RPC so connecting clients receive an immediate snapshot without waiting for the next push cycle.
2. **Python app** (`python/main.py`): receives `motion_reading` events from the MCU via `Bridge.provide`, updates the shared state dict, and broadcasts `state_update` to all connected browsers over Socket.IO.
3. **Browser UI** (`assets/`)`: renders the six axis values as bidirectional bars (origin at centre, growing left or right depending on sign) and numeric readouts inside `applyState()` on every `state_update` event.

---

## Features

### Six-axis live readout
Accelerometer X/Y/Z (in g) and gyroscope X/Y/Z (in dps) update ten times per second. Each axis shows a numeric value alongside a bar.

### Bidirectional bars
Each bar is anchored at its centre. Positive values grow rightward; negative values grow leftward. This makes it immediately obvious whether an axis is in a positive or negative state and by how much — without reading a number.

### Instant on-connect snapshot
When a new browser tab opens, Python immediately calls `get_state` on the MCU and sends the current reading to that client only, so there is no blank screen while waiting for the next push cycle.

---

## Project structure

```
modulino-movement-motion-monitor/
├── app.yaml
├── assets/
│   ├── index.html        # Six axis rows (accel + gyro), each with bar and numeric value
│   ├── style.css        # Dark-theme tokens, bidirectional bar layout
│   ├── app.js            # Socket.IO client, setBar() helper, applyState()
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Reads IMU every 100 ms; Bridge.notify push; get_state RPC
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Bridge.provide handler; on-connect snapshot; state broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
