# 🎛️ Modulino Knob – Live Gauge

Turn the **Modulino Knob** and watch a browser gauge follow in real time. The push-button reports rich events — press, release, and double-tap — using the Button2 library, and a double-tap (or the browser Reset button) snaps the gauge back to zero.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Knob** — rotary encoder with push-button, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): reads the encoder (clamped to 0–100) and streams changes via `Bridge.notify("knob_update", value)`. The push-button is handled with the **Button2** library — press, release, and double-tap events are pushed via `Bridge.notify("button_event", type)`, matching the Buttons and Joystick examples. A `reset_knob` RPC zeroes the encoder.
2. **Python app** (`python/main.py`): receives both `knob_update` and `button_event` via `Bridge.provide`, keeps a shared state dict (value, pressed, per-event counters), and broadcasts `state_update` to all connected browsers over Socket.IO. It forwards the browser's `reset` message to the `reset_knob` RPC.
3. **Browser UI** (`assets/`): draws an SVG arc gauge and per-event counters, updating inside `applyState()` on every `state_update` — no polling, no optimistic updates.

---

## Features

### Live SVG gauge
A 0–100 arc gauge follows the encoder in real time. The foreground arc grows as you turn the knob clockwise and disappears at zero.

### Button2 event counters
Three colour-coded rows — **Press**, **Release**, and **Double tap** — show a running count of each event. Each counter flashes when it increments, just like the Buttons and Joystick examples.

### Two ways to reset
Double-tap the knob's push-button, or click **⟳ Reset** in the browser — either action zeroes the encoder on the board and snaps the gauge to zero everywhere.

---

## Project structure

```
modulino-knob-live-gauge/
├── app.yaml
├── assets/
│   ├── index.html        # SVG gauge, button-event counters, Reset button
│   ├── style.css         # Dark-theme design tokens, gauge and event-row styles
│   ├── app.js            # WebUI client, SVG arc drawing, applyState()
│   └── libs/             # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Encoder streaming + Button2 events; reset_knob RPC
│   └── sketch.yaml       # Platform and library versions (includes Button2)
└── python/
    ├── main.py           # knob_update + button_event handlers; state broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
