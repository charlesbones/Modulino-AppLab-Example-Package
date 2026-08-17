# 🎨 Modulino Pixels – Color Studio

A web-based color controller for the **Arduino Modulino Pixels** module (8 RGB LEDs).
Open a browser, pick colors, drag a brightness slider, and watch the LEDs respond in real time.
Two built-in animations run directly on the board and keep going even if you close the browser.

---

## Hardware required

- **Arduino UNO Q**: runs the sketch and the Python app side-by-side
- **Modulino Pixels**: 8 addressable RGB LEDs, connected via the Qwiic / I2C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): controls the LEDs directly and exposes commands that the Python app can call by name.
2. **Python app** (`python/main.py`): sits in the middle. It receives messages from the browser, forwards them to the sketch, then sends the confirmed new state back to the browser.
3. **Browser UI** (`assets/`): a plain HTML/CSS/JS page. It sends user actions to the Python app and updates the display only when the Python app replies with confirmed state.

---

## Features

### Individual LED control
Each of the 8 LEDs has its own color picker. Pick a color and the LED updates as soon as the board confirms the change.

### Fill All
Pick a single color and apply it to all 8 LEDs at once.

### Brightness
A global slider (0–100) controls brightness without changing any colors.

### Animations
- **Hue Wheel** — all 8 LEDs spin through the color wheel together (~20 fps).
- **Sweep** — a single cyan dot bounces back and forth across the strip.

While an animation is running, the individual color pickers are disabled. Click **Stop** to go back to manual control.

---

## Project structure

```
modulino-pixels-color-studio/
├── app.yaml              # App Lab configuration
├── assets/
│   ├── index.html        # Page layout
│   ├── style.css        # Dark-theme styling
│   ├── app.js            # Browser logic: color pickers, brightness, state updates
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Arduino code: LED control, commands, animations
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Python bridge between browser and Arduino
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```

---

## Commands (sketch ↔ Python)

The Python app calls these commands on the sketch. Each one returns the full current state so the browser always stays in sync.

| Command | Arguments | What it does |
|---|---|---|
| `get_state` | — | Returns brightness, colors, and active animation |
| `set_pixel` | `index, r, g, b, brightness` | Sets one LED (index 0–7) to an RGB color |
| `set_all` | `r, g, b, brightness` | Sets all 8 LEDs to the same color |
| `set_brightness` | `brightness` | Changes brightness (0–100) without touching colors |
| `start_hue_wheel` | — | Starts the rainbow animation |
| `start_sweep` | — | Starts the bouncing sweep animation |
| `stop_animation` | — | Stops the animation and freezes the LEDs |

---

## Implementation notes

- **Brightness range** — `ModulinoPixels.set()` takes brightness 0–100, not 0–255.
- **Struct placement** — The Arduino toolchain generates function prototypes automatically. Any struct used as a return type must be declared before all functions, or the build will fail.
- **Animation timing** — Animations use `millis()` in `loop()` instead of `delay()`, so incoming commands are never blocked.
- **Color picker loop** — The per-LED pickers use `let` (not `var`) so each one captures its own index correctly.
