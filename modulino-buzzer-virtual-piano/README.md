# 🎹 Modulino Buzzer – Virtual Piano

A 2-octave virtual piano that plays real tones through the **Arduino Modulino Buzzer**.
Open a browser, click the keys (or use your computer keyboard), and hear each note played by the piezo buzzer on your board.

---

## Hardware required

- **Arduino UNO Q** — runs the sketch and the Python app side-by-side
- **Modulino Buzzer** — piezo buzzer connected via the Qwiic / I2C cable

---

## How it works

Three pieces talk to each other in a chain:

1. **Arduino sketch** (`sketch/sketch.ino`): initialises the buzzer and exposes a `play_note` command the Python app can call by name, passing a frequency in Hz.
2. **Python app** (`python/main.py`): receives `play_note` messages from the browser and forwards them to the sketch over the Bridge RPC.
3. **Browser UI** (`assets/`): renders a piano keyboard. When a key is pressed it emits the note's frequency to the Python app and briefly highlights the key.

---

## Features

### 2-octave piano (C4 – B5)
24 keys (14 white, 10 black) rendered in the browser. Click or tap any key to play it.

### Computer keyboard support
Play notes without touching the mouse:

| Keys | Notes |
|---|---|
| `A S D F G H J` | White keys — C4 D4 E4 F4 G4 A4 B4 |
| `W E . T Y U` | Black keys — C#4 D#4 · F#4 G#4 A#4 |
| `K L ;` | White keys — C5 D5 E5 |
| `O P` | Black keys — C#5 D#5 |

Remaining octave-5 keys (F5 – B5) are available via click/tap.

### Visual feedback
Each key highlights in blue for 300 ms, matching the buzzer playback duration.

---

## Project structure

```
modulino-buzzer-virtual-piano/
├── app.yaml              # App Lab configuration
├── assets/
│   ├── index.html        # Page layout and piano markup
│   ├── style.css        # Dark-theme styling and key layout
│   ├── app.js            # Piano rendering, keyboard/mouse input, Socket.IO
│   └── libs/          # socket.io.min.js + arduino.js
├── sketch/
│   ├── sketch.ino        # Arduino code: buzzer initialisation and play_note RPC
│   └── sketch.yaml       # Platform and library versions
└── python/
    ├── main.py           # Python bridge between browser and Arduino
    └── requirements.txt  # Dependencies (pre-installed by App Lab)
```


