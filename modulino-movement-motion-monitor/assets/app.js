const ui = new WebUI();

var statusEl     = document.getElementById("status");
var lastUpdatedEl = document.getElementById("last-updated");

// Accelerometer elements
var valAx = document.getElementById("val-ax");
var valAy = document.getElementById("val-ay");
var valAz = document.getElementById("val-az");
var barAx = document.getElementById("bar-ax");
var barAy = document.getElementById("bar-ay");
var barAz = document.getElementById("bar-az");

// Gyroscope elements
var valGx = document.getElementById("val-gx");
var valGy = document.getElementById("val-gy");
var valGz = document.getElementById("val-gz");
var barGx = document.getElementById("bar-gx");
var barGy = document.getElementById("bar-gy");
var barGz = document.getElementById("bar-gz");

// Accelerometer full-scale: ±4 g (LSM6DSOX default)
var ACCEL_MAX = 4;
// Gyroscope full-scale: ±2000 dps (LSM6DSOX default)
var GYRO_MAX  = 2000;

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

// Map a signed value to a bidirectional bar:
//   positive → bar grows rightward from centre (left: 50%, width fills right half)
//   negative → bar grows leftward from centre (right: 50%, width fills left half)
function setBar(el, value, maxVal) {
  var pct = Math.min(Math.abs(value) / maxVal * 50, 50);
  if (value >= 0) {
    el.style.left  = "50%";
    el.style.right = "";
    el.style.width = pct.toFixed(1) + "%";
  } else {
    el.style.right = "50%";
    el.style.left  = "";
    el.style.width = pct.toFixed(1) + "%";
  }
}

function applyState(state) {
  // Accelerometer
  valAx.textContent = parseFloat(state.ax).toFixed(2);
  valAy.textContent = parseFloat(state.ay).toFixed(2);
  valAz.textContent = parseFloat(state.az).toFixed(2);
  setBar(barAx, state.ax, ACCEL_MAX);
  setBar(barAy, state.ay, ACCEL_MAX);
  setBar(barAz, state.az, ACCEL_MAX);

  // Gyroscope
  valGx.textContent = parseFloat(state.gx).toFixed(2);
  valGy.textContent = parseFloat(state.gy).toFixed(2);
  valGz.textContent = parseFloat(state.gz).toFixed(2);
  setBar(barGx, state.gx, GYRO_MAX);
  setBar(barGy, state.gy, GYRO_MAX);
  setBar(barGz, state.gz, GYRO_MAX);

  lastUpdatedEl.textContent = new Date().toLocaleTimeString();
}
