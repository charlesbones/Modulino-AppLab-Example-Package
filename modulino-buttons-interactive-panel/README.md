# 🔘 Modulino Buttons – Interactive Panel

Watch physical button presses appear live in the browser and control each onboard LED independently from the UI.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Buttons** — 3 tactile buttons with onboard LEDs, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): reads all three buttons using the Button2 library and pushes press, release, and double-tap events to Python over the Bridge. It also exposes a `set_led` command so Python can turn each onboard LED on or off.
2. **Python app** (`python/main.py`): receives button events from the sketch, keeps running counters per event type, and broadcasts the full state to all connected browsers over Socket.IO. It also handles `toggle_led` messages from the browser and calls `set_led` on the sketch.
3. **Browser UI** (`assets/`): connects via Socket.IO and re-renders on every `state_update` — no polling. Emits `toggle_led` when a user clicks a Toggle button.

---

## Features

### Live button event counters
Each of the 3 buttons (A, B, C) has its own card showing separate counters for **press**, **release**, and **double-tap** events. Counts flash yellow when they increment. The card border lights up blue while a button is physically held down.

### Independent LED control
Click **Toggle** under any LED label in the browser to switch that specific onboard orange LED on or off without affecting the other two. The UI reflects the confirmed board state after each toggle.

---

## Project structure

```
modulino-buttons-interactive-panel/
├── app.yaml              # App Lab configuration
├── assets/
│   ├── index.html        # Page layout — button cards and LED controls
│   ├── style.css        # Dark-theme styling with CSS design tokens
│   ├── app.js            # Socket.IO client and state-driven DOM updates
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Button2 event detection, Bridge.notify, set_led RPC
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Python bridge — event counting, Socket.IO broadcast, LED toggle
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
