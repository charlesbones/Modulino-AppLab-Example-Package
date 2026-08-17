const ui = new WebUI();

const statusEl = document.getElementById("status");

// Track previous counters so we can flash a value when it changes.
const prev = { press: 0, release: 0, double_tap: 0 };
const EVENT_IDS = { press: "press", release: "release", double_tap: "dtap" };

// ── SVG arc gauge ────────────────────────────────────────────────
const CX = 100, CY = 100, R = 80;
const START_DEG = 220, END_DEG = -40, TOTAL_DEG = START_DEG - END_DEG;

function degToRad(d) { return d * Math.PI / 180; }

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = degToRad(startDeg), e = degToRad(endDeg);
  const x1 = cx + r * Math.cos(s), y1 = cy - r * Math.sin(s);
  const x2 = cx + r * Math.cos(e), y2 = cy - r * Math.sin(e);
  const large = (startDeg - endDeg) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

document.getElementById("arc-bg").setAttribute("d", arcPath(CX, CY, R, START_DEG, END_DEG));

function setGauge(value) {
  const clamped = Math.max(0, Math.min(100, value));
  const currentDeg = START_DEG - (clamped / 100) * TOTAL_DEG;
  const fg = document.getElementById("arc-fg");
  if (clamped > 0) {
    fg.setAttribute("d", arcPath(CX, CY, R, START_DEG, currentDeg));
    fg.style.display = "";
  } else {
    fg.style.display = "none";
  }
  document.getElementById("gauge-value").textContent = clamped;
}

function flash(el) {
  el.classList.remove("flash");
  void el.offsetWidth; // force reflow to retrigger the transition
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 400);
}

// ── Single source of truth: render on every state_update ─────────
function applyState(state) {
  setGauge(state.value);

  for (const [key, prefix] of Object.entries(EVENT_IDS)) {
    const val = state.counters[key];
    if (val !== prev[key]) {
      const el = document.getElementById(prefix);
      el.textContent = val;
      flash(el);
      prev[key] = val;
    }
  }
}

document.getElementById("btn-reset").addEventListener("click", () => {
  ui.send_message("reset", {});
});

ui.on_connect(() => { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(() => { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", data => { if (data) applyState(data); });
