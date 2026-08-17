const ui = new WebUI();

var statusEl = document.getElementById('status');

ui.on_connect(function () { statusEl.className = 'status connected';    statusEl.textContent = '● Connected'; });
ui.on_disconnect(function () { statusEl.className = 'status disconnected'; statusEl.textContent = '● Disconnected'; });

// ── Note definitions ──────────────────────────────────────
// key: keyboard shortcut (lowercase), null = mouse only
var NOTES = [
  // Octave 4
  { name: 'C4',  freq: 262, key: 'a', type: 'white' },
  { name: 'C#4', freq: 277, key: 'w', type: 'black' },
  { name: 'D4',  freq: 294, key: 's', type: 'white' },
  { name: 'D#4', freq: 311, key: 'e', type: 'black' },
  { name: 'E4',  freq: 330, key: 'd', type: 'white' },
  { name: 'F4',  freq: 349, key: 'f', type: 'white' },
  { name: 'F#4', freq: 370, key: 't', type: 'black' },
  { name: 'G4',  freq: 392, key: 'g', type: 'white' },
  { name: 'G#4', freq: 415, key: 'y', type: 'black' },
  { name: 'A4',  freq: 440, key: 'h', type: 'white' },
  { name: 'A#4', freq: 466, key: 'u', type: 'black' },
  { name: 'B4',  freq: 494, key: 'j', type: 'white' },
  // Octave 5
  { name: 'C5',  freq: 523, key: 'k', type: 'white' },
  { name: 'C#5', freq: 554, key: 'o', type: 'black' },
  { name: 'D5',  freq: 587, key: 'l', type: 'white' },
  { name: 'D#5', freq: 622, key: 'p', type: 'black' },
  { name: 'E5',  freq: 659, key: ';', type: 'white' },
  { name: 'F5',  freq: 698, key: null, type: 'white' },
  { name: 'F#5', freq: 740, key: null, type: 'black' },
  { name: 'G5',  freq: 784, key: null, type: 'white' },
  { name: 'G#5', freq: 831, key: null, type: 'black' },
  { name: 'A5',  freq: 880, key: null, type: 'white' },
  { name: 'A#5', freq: 932, key: null, type: 'black' },
  { name: 'B5',  freq: 988, key: null, type: 'white' },
];

// Build a shortcut → note lookup
var keyMap = {};
NOTES.forEach(function (note) {
  if (note.key) keyMap[note.key] = note;
});

// ── Build piano DOM ────────────────────────────────────────
var WHITE_KEY_W = 48; // must match --white-key-w in CSS
var BLACK_KEY_W = 30; // must match --black-key-w in CSS

var pianoEl = document.getElementById('piano');
var keyElements = {}; // name → DOM element

var whiteCount = 0;

NOTES.forEach(function (note) {
  var el = document.createElement('div');
  el.dataset.freq = note.freq;
  el.dataset.name = note.name;

  var labelHtml = '<span class="note-label">' + note.name + '</span>';
  var shortcutHtml = note.key
    ? '<span class="key-shortcut">' + note.key.toUpperCase() + '</span>'
    : '';

  if (note.type === 'white') {
    el.className = 'white-key';
    el.innerHTML = labelHtml + shortcutHtml;
    pianoEl.appendChild(el);
    whiteCount++;
  } else {
    el.className = 'black-key';
    el.innerHTML = labelHtml + shortcutHtml;
    // Position: centered on the boundary between the two surrounding white keys
    var leftPx = whiteCount * WHITE_KEY_W - BLACK_KEY_W / 2;
    el.style.left = leftPx + 'px';
    pianoEl.appendChild(el);
  }

  keyElements[note.name] = el;
});

// ── Note playback ──────────────────────────────────────────
var HIGHLIGHT_MS = 300; // matches buzzer duration in sketch
var highlightTimers = {};

function playNote(note) {
  ui.send_message('play_note', { frequency: note.freq });

  // Visual highlight
  var el = keyElements[note.name];
  if (!el) return;

  el.classList.add('active');

  clearTimeout(highlightTimers[note.name]);
  highlightTimers[note.name] = setTimeout(function () {
    el.classList.remove('active');
  }, HIGHLIGHT_MS);
}

// ── Mouse / touch events ───────────────────────────────────
pianoEl.addEventListener('mousedown', function (e) {
  var el = e.target.closest('[data-freq]');
  if (!el) return;
  var note = NOTES.find(function (n) { return n.name === el.dataset.name; });
  if (note) playNote(note);
});

// ── Keyboard events ────────────────────────────────────────
var pressedKeys = {};

document.addEventListener('keydown', function (e) {
  if (e.repeat) return; // prevent key-repeat spam
  var key = e.key === ';' ? ';' : e.key.toLowerCase();
  if (pressedKeys[key]) return;
  var note = keyMap[key];
  if (!note) return;
  pressedKeys[key] = true;
  playNote(note);
});

document.addEventListener('keyup', function (e) {
  var key = e.key === ';' ? ';' : e.key.toLowerCase();
  delete pressedKeys[key];
});
