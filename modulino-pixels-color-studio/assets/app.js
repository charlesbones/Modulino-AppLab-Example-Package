const ui = new WebUI();

// ── DOM references ────────────────────────────────────────────────────────────
const statusEl         = document.getElementById("status");
const brightnessSlider = document.getElementById("brightness-slider");
const brightnessValue  = document.getElementById("brightness-value");
const fillColorInput   = document.getElementById("fill-color");
const fillBtn          = document.getElementById("fill-btn");
const ledsGrid         = document.getElementById("leds-grid");
const cardHueWheel     = document.getElementById("card-hue-wheel");
const cardSweep        = document.getElementById("card-sweep");
const btnHueWheel      = document.getElementById("btn-hue-wheel");
const btnSweep         = document.getElementById("btn-sweep");

// ── Per-LED elements ──────────────────────────────────────────────────────────
const ledCircles = [];
const ledPickers = [];
let   pixelTimer = null;
let   brightnessTimer = null;

for (let i = 0; i < 8; i++) {
  const card   = document.createElement("div");
  const label  = document.createElement("div");
  const circle = document.createElement("div");
  const picker = document.createElement("input");

  card.className   = "led-card";
  label.className  = "led-label";
  circle.className = "led-circle";
  picker.type      = "color";
  picker.className = "led-picker";

  label.textContent = "LED " + i;
  picker.value      = "#000000";

  picker.addEventListener("input", () => {
    clearTimeout(pixelTimer);
    pixelTimer = setTimeout(() => {
      const { r, g, b } = hexToRgb(picker.value);
      ui.send_message("set_pixel", { index: i, r, g, b, brightness: parseInt(brightnessSlider.value, 10) });
    }, 120);
  });

  card.appendChild(label);
  card.appendChild(circle);
  card.appendChild(picker);
  ledsGrid.appendChild(card);

  ledCircles.push(circle);
  ledPickers.push(picker);
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

// ── Apply confirmed state ─────────────────────────────────────────────────────
function applyState(state) {
  brightnessSlider.value      = state.brightness;
  brightnessValue.textContent = state.brightness;

  for (let i = 0; i < 8; i++) {
    const { r, g, b } = state.pixels[i];
    const hex = rgbToHex(r, g, b);
    ledCircles[i].style.backgroundColor = hex;
    ledCircles[i].style.boxShadow = (r || g || b) ? "0 0 14px " + hex + "99" : "none";
    ledPickers[i].value = hex;
  }

  const anim        = state.animation;
  const isAnimating = anim !== "none";

  fillBtn.disabled = isAnimating;
  ledPickers.forEach(p => p.disabled = isAnimating);

  cardHueWheel.classList.toggle("active", anim === "hue_wheel");
  cardSweep.classList.toggle("active",    anim === "sweep");

  btnHueWheel.textContent = anim === "hue_wheel" ? "Stop" : "Start";
  btnHueWheel.classList.toggle("stop",            anim === "hue_wheel");

  btnSweep.textContent = anim === "sweep" ? "Stop" : "Start";
  btnSweep.classList.toggle("stop",        anim === "sweep");
}

// ── Event listeners ───────────────────────────────────────────────────────────
brightnessSlider.addEventListener("input", () => {
  const val = parseInt(brightnessSlider.value, 10);
  brightnessValue.textContent = val;
  clearTimeout(brightnessTimer);
  brightnessTimer = setTimeout(() => ui.send_message("set_brightness", { brightness: val }), 150);
});

fillBtn.addEventListener("click", () => {
  const { r, g, b } = hexToRgb(fillColorInput.value);
  ui.send_message("set_all", { r, g, b, brightness: parseInt(brightnessSlider.value, 10) });
});

btnHueWheel.addEventListener("click", () =>
  btnHueWheel.classList.contains("stop")
    ? ui.send_message("stop_animation",  {})
    : ui.send_message("start_hue_wheel", {})
);

btnSweep.addEventListener("click", () =>
  btnSweep.classList.contains("stop")
    ? ui.send_message("stop_animation", {})
    : ui.send_message("start_sweep",    {})
);

// ── Socket events ─────────────────────────────────────────────────────────────
ui.on_connect(() => { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(() => { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", data => { if (data?.pixels) applyState(data); });

