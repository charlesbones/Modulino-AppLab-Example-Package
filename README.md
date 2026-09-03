# Modulino AppLab Example Package

A collection of ready-to-run [Arduino App Lab](https://docs.arduino.cc/software/app-lab/) apps demonstrating every [Modulino Qwiic module](https://store.arduino.cc/collections/modulino), each one paired with a live browser UI, backed by the UNO Q's Linux (Python) + MCU (sketch) Bridge architecture.

Open any example in App Lab, plug in the matching Modulino node, hit **Run**, and control or monitor the hardware straight from your browser, no extra wiring beyond the Qwiic cable, no extra code to write.

---

## Hardware required

- [Arduino UNO Q](https://www.arduino.cc/product-uno-q): runs the Python app and the sketch side-by-side and connects them over the Router Bridge
- **Modulino modules**: connected via Qwiic / I²C cable

---

## Getting started

1. Clone the repo inside the ArduinoApss folder or download the latest release and import one by one each example.
2. Wire the Modulino module you want to try to the UNO Q via the Qwiic cable.
3. Start the app, this uploads the sketch and launches the Python app.
4. Open the app's web UI in your browser and interact with the module.

Only one app runs on the board at a time, so starting a new example stops whatever was running before.

---

## Examples

| | Example | Modulino | What it does |
|---|---|---|---|
| 🔘 | [modulino-buttons-interactive-panel](modulino-buttons-interactive-panel) | Buttons | Live press / release / double-tap counters for 3 buttons, plus independent control of each onboard LED |
| 🎹 | [modulino-buzzer-virtual-piano](modulino-buzzer-virtual-piano) | Buzzer | A 2-octave virtual piano, playable by click or computer keyboard, that sounds real tones on the buzzer |
| 📇 | [modulino-change-address](modulino-change-address) | any | Scan the I²C bus and reconfigure node addresses — use this first if you're running two of the same module |
| 📏 | [modulino-distance-proximity-meter](modulino-distance-proximity-meter) | Distance | Live Time-of-Flight readings with a proximity bar that fills as objects get closer |
| 🔀 | [modulino-hub-multi-channel](modulino-hub-multi-channel) | Hub | Sweeps all 8 I²C-multiplexer channels and maps which node sits on each — even nodes that share an address |
| 🕹️ | [modulino-joystick-live-monitor](modulino-joystick-live-monitor) | Joystick | Real-time X/Y crosshair pad and click-button event counters |
| 🎛️ | [modulino-knob-live-gauge](modulino-knob-live-gauge) | Knob | Rotary encoder driving a live SVG gauge, plus press / release / double-tap counters |
| 🔌 | [modulino-latch-relay-smart-switch](modulino-latch-relay-smart-switch) | Latch Relay | Switch a bistable relay on/off and track its state, which persists without power |
| 🖼️ | [modulino-led-matrix-pixel-canvas](modulino-led-matrix-pixel-canvas) | LED Matrix | Click-to-draw 12×8 pixel canvas that exports the frame as a ready-to-paste C++ byte array |
| 📺 | [modulino-led-matrix-text-gallery](modulino-led-matrix-text-gallery) | LED Matrix | Scroll typed text across the matrix, or pick from 14 icons and 26 looping animations |
| 💡 | [modulino-light-color-sensing](modulino-light-color-sensing) | Light | Live lux, ambient, IR and RGB dashboard with a color swatch and detected color name |
| ⚙️ | [modulino-motors-control](modulino-motors-control) | Motors | Drive two DC motors or a stepper, with live current-sense telemetry |
| 🏃 | [modulino-movement-motion-monitor](modulino-movement-motion-monitor) | Movement | Live 6-axis accelerometer + gyroscope dashboard with bidirectional bars |
| 🎨 | [modulino-pixels-color-studio](modulino-pixels-color-studio) | Pixels | Per-LED color pickers, brightness, and two on-board animations (hue wheel, sweep) for the 8 RGB LEDs |
| 🌡️ | [modulino-thermo-climate-monitor](modulino-thermo-climate-monitor) | Thermo | Live temperature and humidity dashboard, pushed every 2 seconds |
| 📳 | [modulino-vibro-haptic-tester](modulino-vibro-haptic-tester) | Vibro | Fire vibration pulses at 6 power levels and any duration, with instant stop |

Each example's own README has the full details: Bridge RPC/notify names, UI behaviour, and project layout.

---

## How the examples are built

Every app follows the same three-piece chain:

1. **Arduino sketch** (`sketch/sketch.ino`) — talks to the Modulino module over I²C and exposes its actions as Bridge RPC methods (e.g. `set_dc`, `relay_on`) or streams readings with `Bridge.notify(...)`. No `delay()` is used, so the board stays responsive.
2. **Python app** (`python/main.py`) — the bridge between hardware and browser. It calls into the sketch, keeps a shared state dict, and broadcasts updates to every connected browser over Socket.IO.
3. **Browser UI** (`assets/`) — plain HTML/CSS/JS. It renders whatever state the Python app broadcasts and never updates optimistically, so every open tab always reflects the board's real state.

This pattern keeps sensor/actuator logic on the MCU (real-time, no polling races) and UI/networking logic on the Linux side, connected by a thin, explicit Bridge contract.

