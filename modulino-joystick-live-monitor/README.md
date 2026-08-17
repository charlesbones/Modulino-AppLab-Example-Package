# 🕹️ Modulino Joystick – Live Monitor

Real-time joystick X/Y position and rich click-button event tracking — press, release, and double-tap — streamed from the hardware to the browser.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Joystick** — analog joystick with click button, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): uses the **Button2** library to track click-button events (press, release, double-tap) and pushes them via `Bridge.notify("button_event", type)`. Button2's state function calls `joystick.update()` to keep the hardware state fresh; the loop then compares X/Y against last-known values and fires `Bridge.notify("joystick_event", x, y)` only when the axis actually moves. A `get_state` RPC provides an on-connect snapshot.
2. **Python app** (`python/main.py`): receives both `joystick_event` (axis) and `button_event` (click type) via `Bridge.provide`, maintains a shared state dict with `x`, `y`, and per-event-type counters, and broadcasts `state_update` to all browsers over Socket.IO.
3. **Browser UI** (`assets/`): draws a live crosshair pad canvas for the axes and shows incrementing counters for each click event type. All display updates happen inside `applyState()` on `state_update` — no polling, no optimistic updates.

---

## Features

### Live crosshair pad
A 200×200 canvas with centre crosshair lines displays a coloured dot that tracks the joystick position in real time. The dot maps −128 → +128 to the canvas edges, with the centre (0, 0) anchored at the middle. The Y axis is oriented so positive values move the dot upward.

### Click-button event counters
Three colour-coded rows — **Press**, **Release**, and **Double tap** — each show a running count of how many times that event has fired. Each counter flashes briefly when it increments, making rapid interactions easy to spot.

### Change-driven updates
The sketch only fires axis notifications when the X or Y value actually changes, keeping bridge traffic low. Click-button events are fully debounced by Button2 before reaching Python.

---

## Project structure

```
modulino-joystick-live-monitor/
├── app.yaml
├── assets/
│   ├── index.html        # Canvas crosshair pad, X/Y readout, event-counter rows
│   ├── style.css        # Dark-theme tokens, pad, event-row and flash styles
│   ├── app.js            # Canvas drawing, counter flash, applyState(), Socket.IO client
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Button2 click events; axis change detection; get_state RPC
│   └── sketch.yaml       # Platform and library versions (includes Button2)
└── python/
    ├── main.py           # joystick_event + button_event handlers; state broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
