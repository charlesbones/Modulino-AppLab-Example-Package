const ui = new WebUI();

var statusEl         = document.getElementById("status");
var distancePrimary  = document.getElementById("distance-primary");
var distanceSecondary = document.getElementById("distance-secondary");
var barFill          = document.getElementById("bar-fill");

var MAX_RANGE_MM = 1300;

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

// State from server
ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function applyState(state) {
  if (!state.in_range) {
    distancePrimary.textContent   = "Out of range";
    distanceSecondary.textContent = "—";
    barFill.style.width = "0%";
    return;
  }

  var mm = state.distance_mm;
  var cm = (mm / 10).toFixed(1);

  distancePrimary.textContent   = mm + " mm";
  distanceSecondary.textContent = cm + " cm";

  // Bar grows as object gets closer: 0 mm → 100%, 1300 mm → 0%
  var pct = Math.max(0, Math.min(100, (1 - mm / MAX_RANGE_MM) * 100));
  barFill.style.width = pct.toFixed(1) + "%";
}
