# 🔌 Modulino Latch Relay – Smart Switch

Control a Modulino Latch Relay from the browser and watch its state update instantly. Note: The relay holds its position even after power is removed.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Latch Relay** — bistable relay that holds its last position without continuous power, connected via Qwiic / I²C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): exposes three Bridge RPC methods — `relay_on` (energises the SET coil and reads back the new status), `relay_off` (energises the RESET coil and reads back), and `get_state` (queries current status). `loop()` is empty — all actions are RPC-driven.
2. **Python app** (`python/main.py`): maintains a shared state dict, forwards `relay_on` and `relay_off` Socket.IO messages from the browser to the MCU via Bridge RPC, and broadcasts the returned status to every connected browser.
3. **Browser UI** (`assets/`): renders a large status badge and two control buttons. The relevant button is disabled when the relay is already in that state. All display changes happen inside `applyState()` on `state_update` events only.

---

## Features

### Clear status badge
A large badge shows "● ON" in green, "○ OFF" in red, or "? UNKNOWN" in muted colour (the state before the first command after power-on). The badge and border colour update together for an unambiguous at-a-glance read.

### Smart button disabling
The **Turn ON** button is disabled while the relay is ON; **Turn OFF** is disabled while it is OFF. This prevents redundant coil pulses and makes the current state obvious.

### Latching behaviour explained
An informational note reminds users that the relay holds its state mechanically — no power is needed to maintain the position once set.

---

## Project structure

```
modulino-latch-relay-smart-switch/
├── app.yaml
├── assets/
│   ├── index.html        # Status badge, Turn ON / Turn OFF buttons, info note
│   ├── style.css        # Dark-theme design tokens and badge state colours
│   ├── app.js            # Socket.IO client, applyState(), button wiring
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # relay_on, relay_off, get_state RPC handlers
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Forwards relay_on/relay_off events; on-connect snapshot; state broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
