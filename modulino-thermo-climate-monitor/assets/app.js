const ui = new WebUI();

var statusEl     = document.getElementById("status");
var temperatureEl = document.getElementById("temperature");
var humidityEl    = document.getElementById("humidity");
var lastUpdatedEl = document.getElementById("last-updated");

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

// State from server
ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function applyState(state) {
  temperatureEl.textContent = parseFloat(state.temperature).toFixed(1);
  humidityEl.textContent    = parseFloat(state.humidity).toFixed(1);
  lastUpdatedEl.textContent = new Date().toLocaleTimeString();
}
