# 📳 Modulino Vibro – Haptic Tester

Trigger vibration pulses at any power level and duration straight from the browser, and watch the live readout update the moment the motor fires.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Vibro** — vibration motor with six selectable power levels, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): exposes three Bridge RPC methods — `buzz` (fires the motor at a given power and duration), `stop_buzz` (cuts the motor immediately), and `get_state` (returns the last-used settings). All calls return a JSON state object; no `delay()` is ever used.
2. **Python app** (`python/main.py`): maintains a shared state dict, forwards browser events to the MCU via Bridge RPC, and broadcasts the returned state to every connected browser over Socket.IO.
3. **Browser UI** (`assets/`): renders a power selector, a duration slider, and Buzz / Stop buttons. All display updates happen inside `applyState()` in response to `state_update` events — the UI never updates optimistically.

---

## Features

### Six power levels
Choose from Gentle, Moderate, Medium, Intense, Powerful, or Maximum using the highlighted button grid. The active selection is kept in sync with the server state so every browser tab shows the same choice.

### Adjustable duration
A slider (50 ms – 2000 ms, 50 ms steps) lets you dial in exactly how long the motor runs. The numeric readout updates live as you drag.

### Instant stop
The **Stop** button calls `vibro.off()` on the MCU immediately, cutting the motor before its duration expires.

### Last-triggered readout
A small summary line shows the duration and power label of the most recent buzz, updated on every `state_update` so all connected browsers stay in sync.

---

## Project structure

```
modulino-vibro-haptic-tester/
├── app.yaml
├── assets/
│   ├── index.html        # Layout: power grid, duration slider, action buttons, last-triggered
│   ├── style.css        # Dark-theme design tokens and component styles
│   ├── app.js            # Socket.IO client, applyState(), button/slider event wiring
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Bridge RPC handlers: buzz, stop_buzz, get_state
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Bridge bridge: forwards buzz/stop events, broadcasts state
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
