# 📺 Modulino LED Matrix – Text & Gallery

Type any text in the browser and watch it scroll across the Modulino LED matrix, or pick from 14 static icons and 26 looping animations at the click of a button.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino LED Matrix** — 12×8 white LED dot-matrix display, connected via Qwiic / I²C cable (uses Wire1)

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): exposes four Bridge RPC methods — `text_op`, `show_item`, `stop`, and `get_state`. Scroll text is driven frame-by-frame in `loop()` using `matrix.text()` + `matrix.endDraw()` at a fixed interval with `millis()`. Icons use `matrix.setFrame()`; animations use `matrix.setSequence()` + `matrix.nextFrame()`. Uses `#include "Modulino_LED_Matrix.h"` and does **not** call `Modulino.begin()`.
2. **Python app** (`python/main.py`): forwards browser events to the MCU via Bridge RPC and broadcasts the returned state (mode, selected index, text string) to every connected browser over Socket.IO.
3. **Browser UI** (`assets/`): provides a text input with a Scroll button, a Stop button, and two gallery sections. All state changes happen inside `applyState()` on `state_update` events; the active gallery item is highlighted and the text field is restored from state on reconnect.

### Adding a custom icon from Pixel Canvas
Design an icon in the **Modulino LED Matrix – Pixel Canvas** project, then follow these steps to add it to this gallery.

**Step 1 — Get the icon data from Pixel Canvas**

Open the Pixel Canvas app, draw your design, then click **Copy** to copy the exported array from the textarea below the canvas. It looks like this:

```cpp
// Rename MY_ICON before use
const uint8_t MY_ICON[] = {
  0b00000000, 0b00000000,  // row 0
  0b01111110, 0b00000000,  // row 1
  // ...
};
```

The format is 16 bytes — 2 per row, MSB = leftmost column (cols 0–7 in byte 0, cols 8–11 in the upper nibble of byte 1).

**Step 2 — Add the array and a helper to `sketch/sketch.ino`**

Paste the array near the top of the file, before `showIcon()`. Rename it to something descriptive:

```cpp
const uint8_t MY_ICON[] = {
  0b00000000, 0b00000000,  // row 0
  0b01111110, 0b00000000,  // row 1
  // ...
};
```

Add this helper function once, also before `showIcon()`. It reads the row-major export and renders it to the matrix:

```cpp
void showUInt8Icon(const uint8_t* p) {
  for (int y = 0; y < 8; y++) {
    for (int x = 0; x < 8; x++)
      matrix.set(x, y, (p[y*2]   >> (7-x)) & 1 ? 255 : 0, 0, 0);
    for (int x = 8; x < 12; x++)
      matrix.set(x, y, (p[y*2+1] >> (15-x)) & 1 ? 255 : 0, 0, 0);
  }
  matrix.endDraw();
}
```

**Step 3 — Add a case to `showIcon()`**

```cpp
case 14: showUInt8Icon(MY_ICON); break;
```

**Step 4 — Increment `NUM_ICONS`** at the top of `sketch.ino`:

```cpp
const int NUM_ICONS = 15;   // was 14
```

**Step 5 — Add the button label in `assets/app.js`**

Find the `ICONS` array and append your label. The array must have exactly `NUM_ICONS` entries:

```js
var ICONS = [
  "Bluetooth", "Bootloader", "Chip", "Cloud WiFi", "Danger",
  "Emoji Basic", "Emoji Happy", "Emoji Sad", "Heart Big", "Heart Small",
  "Like", "Music Note", "Resistor", "UNO",
  "My Icon"   // ← new entry
];
```

The new button appears automatically in the Icons gallery on next page load.

---

## Features

### Scroll text
Type up to 64 characters into the text field and press **Scroll** (or hit Enter). The text scrolls left continuously across the matrix until you press **Stop**.

### Icons gallery
Fourteen static icons from the built-in library — Bluetooth, Chip, Emoji faces, Hearts, UNO, and more. Clicking any icon button sends it to the matrix instantly via `matrix.setFrame()`.

### Animations gallery
Twenty-six looping animations — Tetris, Heartbeat, Bouncing Ball, Hourglass, and more. The MCU loads each sequence with `matrix.setSequence()` and `loop()` advances one frame at a time using the per-frame duration embedded in the animation data.

### Stop
The **Stop** button clears the matrix and returns to idle, deselecting any active gallery item.

---

## Project structure

```
modulino-led-matrix-text-gallery/
├── app.yaml
├── assets/
│   ├── index.html        # Text input, Scroll/Stop buttons, Icons gallery, Animations gallery
│   ├── style.css        # Dark-theme tokens, text input row, gallery pill buttons
│   ├── app.js            # Gallery built dynamically; Enter key triggers scroll; applyState() syncs UI
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # text_op, show_item, stop, get_state RPCs; non-blocking scroll loop
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Forwards scroll_text/show_item/stop; 8-chars-per-call packing; broadcast
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```

---