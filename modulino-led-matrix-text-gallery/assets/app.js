const ui = new WebUI();

var statusEl   = document.getElementById("status");
var textInput  = document.getElementById("text-input");
var scrollBtn  = document.getElementById("scroll-btn");
var stopBtn    = document.getElementById("stop-btn");
var iconsGrid  = document.getElementById("icons-grid");
var animsGrid  = document.getElementById("animations-grid");

var ICONS = [
  "Bluetooth", "Bootloader", "Chip", "Cloud WiFi",
  "Danger", "😐 Neutral", "😊 Happy", "😢 Sad",
  "❤️ Heart", "♡ Small Heart", "👍 Like", "🎵 Music",
  "Resistor", "UNO"
];

var ANIMATIONS = [
  "Startup", "Tetris Intro", "ATmega", "Blink H", "Blink V",
  "Compass", "Waveform", "Battery", "Bounce", "Bug",
  "Check ✓", "Cloud", "Download", "DVD", "Heartbeat",
  "Heartbeat 2", "Infinity", "Clock", "Loading", "Lock",
  "Notification", "Open Source", "Coin", "Tetris", "WiFi", "Hourglass"
];

// Index 40 is reserved for scroll-text mode (no button)
var galleryBtns = [];

// Build icon buttons
ICONS.forEach(function (name, i) {
  var btn = document.createElement("button");
  btn.className = "gallery-btn";
  btn.textContent = name;
  btn.addEventListener("click", function () {
    ui.send_message("show_item", { index: i });
  });
  iconsGrid.appendChild(btn);
  galleryBtns[i] = btn;
});

// Build animation buttons
ANIMATIONS.forEach(function (name, i) {
  var btn = document.createElement("button");
  btn.className = "gallery-btn";
  btn.textContent = "▶ " + name;
  btn.addEventListener("click", function () {
    ui.send_message("show_item", { index: ICONS.length + i });
  });
  animsGrid.appendChild(btn);
  galleryBtns[ICONS.length + i] = btn;
});

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function applyState(state) {
  // Restore the text input value if scroll text is active
  if (state.selected === 40 && state.text) {
    textInput.value = state.text;
  }

  // Highlight the active gallery button (selected 0–39); clear all others
  galleryBtns.forEach(function (btn, i) {
    btn.classList.toggle("active", i === state.selected);
  });
}

// Scroll text
scrollBtn.addEventListener("click", function () {
  var text = textInput.value.trim();
  if (!text) return;
  ui.send_message("scroll_text", { text: text });
});

// Allow Enter key to trigger scroll
textInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") scrollBtn.click();
});

// Stop
stopBtn.addEventListener("click", function () {
  ui.send_message("stop", {});
});
