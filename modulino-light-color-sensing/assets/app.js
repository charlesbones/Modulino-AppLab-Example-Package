const ui = new WebUI();

var statusEl   = document.getElementById("status");
var swatchEl   = document.getElementById("color-swatch");
var colorNameEl = document.getElementById("color-name");
var colorHexEl  = document.getElementById("color-hex");

var barR = document.getElementById("bar-r");
var barG = document.getElementById("bar-g");
var barB = document.getElementById("bar-b");
var valR = document.getElementById("val-r");
var valG = document.getElementById("val-g");
var valB = document.getElementById("val-b");

var valLux = document.getElementById("val-lux");
var valRaw = document.getElementById("val-raw");
var valIR  = document.getElementById("val-ir");

ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected"; });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function toHex(n) {
  return ("0" + Math.max(0, Math.min(255, n)).toString(16)).slice(-2);
}

function applyState(s) {
  var r = s.r || 0;
  var g = s.g || 0;
  var b = s.b || 0;
  var hex = "#" + toHex(r) + toHex(g) + toHex(b);

  swatchEl.style.backgroundColor = hex;
  colorHexEl.textContent = hex.toUpperCase();
  colorNameEl.textContent = s.color_name || "—";

  barR.style.width = ((r / 255) * 100).toFixed(1) + "%";
  barG.style.width = ((g / 255) * 100).toFixed(1) + "%";
  barB.style.width = ((b / 255) * 100).toFixed(1) + "%";
  valR.textContent = r;
  valG.textContent = g;
  valB.textContent = b;

  valLux.textContent = s.lux != null ? s.lux : "—";
  valRaw.textContent = s.raw_lux != null ? s.raw_lux : "—";
  valIR.textContent  = s.ir != null ? s.ir : "—";
}
