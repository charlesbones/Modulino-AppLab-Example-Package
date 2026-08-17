const ui = new WebUI();

var statusEl  = document.getElementById("status");
var badge     = document.getElementById("relay-badge");
var btnOn     = document.getElementById("btn-on");
var btnOff    = document.getElementById("btn-off");

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

// State from server
ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function applyState(state) {
  var s = state.status;

  if (s === 1) {
    badge.textContent = "● ON";
    badge.className   = "relay-badge on";
  } else if (s === 0) {
    badge.textContent = "○ OFF";
    badge.className   = "relay-badge off";
  } else {
    badge.textContent = "? UNKNOWN";
    badge.className   = "relay-badge";
  }

  btnOn.disabled  = (s === 1);
  btnOff.disabled = (s === 0);
}

btnOn.addEventListener("click",  function () { ui.send_message("relay_on",  {}); });
btnOff.addEventListener("click", function () { ui.send_message("relay_off", {}); });
