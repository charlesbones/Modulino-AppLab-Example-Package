const ui = new WebUI();

const statusEl = document.getElementById("status");

const el = id => document.getElementById(id);
const speedA = el("speedA"), speedB = el("speedB");
const invertA = el("invertA"), invertB = el("invertB");

// ── Mode toggle ──────────────────────────────────────────────────
document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    ui.send_message("set_mode", { stepper: btn.dataset.stepper === "1" });
  });
});

function applyMode(stepper) {
  el("mode-dc").classList.toggle("active", !stepper);
  el("mode-stepper").classList.toggle("active", stepper);
  el("panel-dc").classList.toggle("hidden", stepper);
  el("panel-stepper").classList.toggle("hidden", !stepper);
}

// ── DC controls ──────────────────────────────────────────────────
speedA.addEventListener("input", () => el("speedA-val").textContent = speedA.value);
speedB.addEventListener("input", () => el("speedB-val").textContent = speedB.value);

el("btn-apply").addEventListener("click", () => {
  ui.send_message("set_dc", {
    speedA:  parseInt(speedA.value, 10),
    speedB:  parseInt(speedB.value, 10),
    invertA: invertA.checked,
    invertB: invertB.checked,
  });
});

el("btn-stop").addEventListener("click", () => {
  speedA.value = 0; speedB.value = 0;
  el("speedA-val").textContent = "0";
  el("speedB-val").textContent = "0";
  ui.send_message("stop", {});
});

// ── Stepper controls ─────────────────────────────────────────────
el("btn-move").addEventListener("click", () => {
  ui.send_message("move_stepper", {
    steps: parseInt(el("steps").value, 10) || 0,
    rpm:   parseInt(el("rpm").value, 10) || 1,
  });
});

// ── Render on state_update (mode/speed/invert — command-driven only) ─
function applyState(s) {
  applyMode(s.stepperMode);

  // Reflect DC state, but don't fight controls the user is still editing.
  if (document.activeElement !== speedA) { speedA.value = s.speedA; el("speedA-val").textContent = s.speedA; }
  if (document.activeElement !== speedB) { speedB.value = s.speedB; el("speedB-val").textContent = s.speedB; }
  if (document.activeElement !== invertA) invertA.checked = s.invertA;
  if (document.activeElement !== invertB) invertB.checked = s.invertB;
}

// ── Render on telemetry_update (current/busy — arrives ~5x/sec) ──────
function applyTelemetry(t) {
  el("currentA").textContent = Math.round(t.currentA);
  el("currentB").textContent = Math.round(t.currentB);

  const badge = el("busy-badge");
  badge.textContent = t.busy ? "Moving…" : "Idle";
  badge.classList.toggle("active", t.busy);
}

ui.on_connect(() => { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(() => { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", data => { if (data) applyState(data); });
ui.on_message("telemetry_update", data => { if (data) applyTelemetry(data); });
