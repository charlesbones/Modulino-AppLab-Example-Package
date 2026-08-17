const ui = new WebUI();

var statusEl    = document.getElementById("status");
var gridEl      = document.getElementById("pixel-grid");
var clearBtn    = document.getElementById("clear-btn");
var exportOutput = document.getElementById("export-output");
var copyBtn     = document.getElementById("copy-btn");

var COLS = 12, ROWS = 8;
var cells = []; // cells[y][x]
var currentPixels = new Array(ROWS * COLS).fill(0);

// Build 12×8 pixel grid
for (let y = 0; y < ROWS; y++) {
  cells[y] = [];
  for (let x = 0; x < COLS; x++) {
    let cell = document.createElement("div");
    cell.className = "pixel-cell";
    cell.addEventListener("click", function () {
      ui.send_message("toggle_pixel", { x: x, y: y });
    });
    gridEl.appendChild(cell);
    cells[y][x] = cell;
  }
}

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function applyState(state) {
  currentPixels = state.pixels;

  for (var y = 0; y < ROWS; y++) {
    for (var x = 0; x < COLS; x++) {
      cells[y][x].classList.toggle("lit", state.pixels[y * COLS + x] === 1);
    }
  }

  exportOutput.value = buildExport(state.pixels);
}

// Build a C++ uint8_t[16] byte array from the 96-element pixel list.
// Format: 2 bytes per row, MSB = leftmost column.
//   byte[row*2+0]: cols 0-7   (col 0 = bit 7)
//   byte[row*2+1]: cols 8-11  (col 8 = bit 7, lower nibble unused)
function buildExport(pixels) {
  var lines = ["// Rename MY_ICON before use", "const uint8_t MY_ICON[] = {"];
  for (var y = 0; y < ROWS; y++) {
    var b0 = 0, b1 = 0;
    for (var x = 0; x < 8; x++) {
      if (pixels[y * COLS + x]) b0 |= (1 << (7 - x));
    }
    for (var x = 8; x < COLS; x++) {
      if (pixels[y * COLS + x]) b1 |= (1 << (15 - x));
    }
    var sep = y < ROWS - 1 ? "," : "";
    lines.push("  " + toBin8(b0) + ", " + toBin8(b1) + sep + "  // row " + y);
  }
  lines.push("};");
  return lines.join("\n");
}

function toBin8(n) {
  return "0b" + ("00000000" + (n >>> 0).toString(2)).slice(-8);
}

// Clear canvas
clearBtn.addEventListener("click", function () {
  ui.send_message("clear", {});
});

// Copy export to clipboard
copyBtn.addEventListener("click", function () {
  navigator.clipboard.writeText(exportOutput.value).then(function () {
    var orig = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(function () { copyBtn.textContent = orig; }, 1500);
  });
});
