# 🖼️ Modulino LED Matrix – Pixel Canvas

Click cells in the browser to draw any pixel pattern on the Modulino LED matrix, then copy the generated C++ byte array straight into your own Arduino sketch.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino LED Matrix** — 12×8 white LED dot-matrix display, connected via Qwiic / I²C cable (uses Wire1)

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): maintains a `bool pixels[8][12]` mirror of the canvas. Exposes three Bridge RPC methods — `toggle_pixel`, `clear_canvas`, and `get_state`. Every change is immediately pushed to the hardware via `matrix.set()` / `matrix.endDraw()`. Uses `#include "Modulino_LED_Matrix.h"` and does **not** call `Modulino.begin()`.
2. **Python app** (`python/main.py`): forwards `toggle_pixel` and `clear` events from the browser to the MCU via Bridge RPC and broadcasts the returned 96-element pixel array to every connected browser over Socket.IO.
3. **Browser UI** (`assets/`): renders a live 12×8 click grid. On every `state_update`, `applyState()` refreshes the grid and recomputes the C++ export in a read-only textarea below the canvas.

### LED Matrix include and `Modulino.begin()`
Modulino LED Matrix projects use `#include "Modulino_LED_Matrix.h"` (not `Arduino_Modulino.h`) and must **not** call `Modulino.begin()`. The class initialises Wire1 internally inside `matrix.begin()`.

---

## Features

### Pixel drawing
Click any of the 96 cells to toggle that pixel on or off on the hardware in real time. Lit cells use the accent colour; the canvas state stays in sync across all browser tabs.

### Export as C++ array
Below the canvas, a read-only textarea always shows the current pixel pattern as a `const uint8_t MY_ICON[16]` byte array — two bytes per row, MSB = leftmost column (cols 0–7 in byte 0, cols 8–11 in the upper nibble of byte 1). Click **Copy** to put it on the clipboard, then follow the integration steps in the **Modulino LED Matrix – Text & Gallery** README to add it to that project's icon gallery.

### One-click clear
The **Clear** button zeroes the canvas on both the browser and the hardware simultaneously, and the export textarea updates immediately.

## Using your icon in the Text & Gallery project
Copy the exported `const uint8_t MY_ICON[16]` array and paste it into `modulino-led-matrix-text-gallery/sketch/sketch.ino`. The export format (row-major, 2 bytes per row) is different from the column-major `uint32_t[3]` format used by `matrix.setFrame()`, so a small rendering helper is needed — the full step-by-step instructions, including the `showUInt8Icon` helper function, are in the **Adding a custom icon from Pixel Canvas** section of that project's README.

---

## Project structure

```
modulino-led-matrix-pixel-canvas/
├── app.yaml
├── assets/
│   ├── index.html        # Canvas grid, Clear button, Export textarea, Copy button
│   ├── style.css        # Dark-theme tokens, CSS grid, export textarea styles
│   ├── app.js            # Grid built dynamically; buildExport() computes byte array; applyState() syncs all UI
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # toggle_pixel, clear_canvas, get_state RPCs; redrawCanvas()
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Forwards toggle_pixel/clear; on-connect snapshot; broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```

---


