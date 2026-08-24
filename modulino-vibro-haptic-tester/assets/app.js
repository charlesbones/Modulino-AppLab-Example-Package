const ui = new WebUI();

var statusEl       = document.getElementById("status");
var durationSlider = document.getElementById("duration-slider");
var durationValue  = document.getElementById("duration-value");
var buzzBtn        = document.getElementById("buzz-btn");
var stopBtn        = document.getElementById("stop-btn");
var lastTriggered  = document.getElementById("last-triggered");
var powerBtns      = document.querySelectorAll(".power-btn");
var powerSlider    = document.getElementById("power-slider");
var powerValue     = document.getElementById("power-value");

var POWER_LABELS = {
  25: "Gentle",
  30: "Moderate",
  35: "Medium",
  40: "Intense",
  45: "Powerful",
  50: "Maximum"
};

var selectedPower = 50;

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

// State from server
ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function applyState(state) {
  // Sync duration slider
  durationSlider.value  = state.last_duration_ms;
  durationValue.textContent = state.last_duration_ms + " ms";

  // Sync power buttons
  selectedPower = state.last_power;
  powerBtns.forEach(function (btn) {
    btn.classList.toggle("active", parseInt(btn.dataset.power) === selectedPower);
  });
  powerSlider.value = selectedPower;
  powerValue.textContent = selectedPower;

  // Update last triggered readout
  var label = POWER_LABELS[state.last_power] || state.last_power;
  lastTriggered.textContent = state.last_duration_ms + " ms — " + label;
}

// Duration slider live readout (local only, no emit)
durationSlider.addEventListener("input", function () {
  durationValue.textContent = durationSlider.value + " ms";
});

// Power level selection (buttons)
powerBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    selectedPower = parseInt(btn.dataset.power);
    powerBtns.forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    powerSlider.value = selectedPower;
    powerValue.textContent = selectedPower;
  });
});

// Power level selection (slider)
powerSlider.addEventListener("input", function () {
  selectedPower = parseInt(powerSlider.value);
  powerValue.textContent = selectedPower;
  powerBtns.forEach(function (btn) {
    btn.classList.toggle("active", parseInt(btn.dataset.power) === selectedPower);
  });
});

// Buzz
buzzBtn.addEventListener("click", function () {
  ui.send_message("buzz", {
    duration_ms:  parseInt(durationSlider.value),
    power_level:  selectedPower
  });
});

// Stop
stopBtn.addEventListener("click", function () {
  ui.send_message("stop", {});
});
