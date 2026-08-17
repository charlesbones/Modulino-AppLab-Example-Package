const ui = new WebUI();

const statusEl = document.getElementById("status");

// Track previous counter values to detect changes for the flash effect
const prev = {
  press:      [0, 0, 0],
  release:    [0, 0, 0],
  double_tap: [0, 0, 0],
};

// Maps state key → DOM id prefix
const EVENT_IDS = { press: "press", release: "release", double_tap: "dtap" };

function flash(el) {
  el.classList.remove("flash");
  void el.offsetWidth; // force reflow so re-adding the class retriggers the transition
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 400);
}

// Single source of truth: only update the DOM here, in response to state_update
function applyState(state) {
  const { counters, leds } = state;

  for (let i = 0; i < 3; i++) {
    for (const [key, prefix] of Object.entries(EVENT_IDS)) {
      const val = counters[key][i];
      const el  = document.getElementById(`${prefix}-${i}`);
      if (val !== prev[key][i]) {
        el.textContent = val;
        flash(el);
        prev[key][i] = val;
      }
    }

    const pressed = counters.press[i] > counters.release[i];
    document.getElementById(`card-${i}`).classList.toggle("pressed", pressed);
    document.getElementById(`led-${i}`).classList.toggle("on", leds[i]);
  }
}

// Emit toggle_led and wait for the server's state_update — no optimistic update
document.querySelectorAll(".led-toggle-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    ui.send_message("toggle_led", { index: parseInt(btn.dataset.index, 10) });
  });
});

ui.on_connect(() => { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(() => { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", data => { if (data) applyState(data); });
