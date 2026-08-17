# ⚙️ Modulino Motors – Motor Control

Drive the **Modulino Motors** dual H-bridge straight from the browser — run two DC motors independently, or move a stepper a set number of steps at a target RPM — while watching live current-sense telemetry.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Motors** — MAX22211 dual H-bridge driver, connected via Qwiic / I²C cable
- **5–24 V motor power supply** — the Qwiic cable powers only the logic; the motor rail is separate
- **Motors** — one or two brushed DC motors, or one bipolar stepper

> ⚠️ The two DC channels and the stepper share the same H-bridge, so only one mode is active at a time. Always provide external motor power before driving anything.

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): wraps the `ModulinoMotors` API in Bridge RPCs — `set_dc`, `stop`, `move_stepper`, `set_mode`, and `get_state`. Each returns the full JSON state. `loop()` streams live current-sense and busy telemetry via `Bridge.notify("telemetry", …)`.
2. **Python app** (`python/main.py`): forwards browser messages to the RPCs, merges in the streamed telemetry, and broadcasts `state_update` to all connected browsers over Socket.IO.
3. **Browser UI** (`assets/`): a DC panel (two speed sliders + reverse toggles) and a stepper panel (steps + RPM), switched by a mode toggle. Everything renders inside `applyState()` on each `state_update`.

---

## Features

### DC mode
Two independent channels, each with a 0–100 % speed slider and a **Reverse** toggle. **Apply** pushes both channels at once; **Stop** cuts them immediately.

### Stepper mode
Enter a step count (negative to reverse) and a target RPM, then **Move**. A badge shows whether the driver is still moving, driven by the live `busy()` telemetry.

### Live current telemetry
Each DC card shows its sensed current in mA, updated ~5 times a second from the sketch — handy for spotting a stalled or overloaded motor.

---

## Project structure

```
modulino-motors-control/
├── app.yaml
├── assets/
│   ├── index.html        # Mode toggle, DC panel, stepper panel
│   ├── style.css         # Dark-theme design tokens, motor cards, sliders
│   ├── app.js            # WebUI client, mode switching, applyState()
│   └── libs/             # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # ModulinoMotors RPCs + current-sense telemetry
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Forwards commands, merges telemetry, broadcasts state
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```
