const ui = new WebUI();

var statusEl   = document.getElementById("status");
var valX       = document.getElementById("val-x");
var valY       = document.getElementById("val-y");
var canvas     = document.getElementById("pad");
var ctx        = canvas.getContext("2d");

var W      = canvas.width;
var H      = canvas.height;
var HALF_W = W / 2;
var HALF_H = H / 2;
var AXIS_MAX = 128;

var prevCounts = { press: 0, release: 0, double_tap: 0 };
var countEls = {
  press:      document.getElementById("count-press"),
  release:    document.getElementById("count-release"),
  double_tap: document.getElementById("count-dtap"),
};

// Connection status
ui.on_connect(function () { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(function () { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });

ui.on_message("state_update", function (data) {
  if (data) applyState(data);
});

function flash(el) {
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
  setTimeout(function () { el.classList.remove("flash"); }, 400);
}

function drawPad(x, y) {
  var dotX = HALF_W + (x / AXIS_MAX) * HALF_W;
  var dotY = HALF_H - (y / AXIS_MAX) * HALF_H;

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(46, 50, 68, 0.8)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(HALF_W, 0); ctx.lineTo(HALF_W, H);
  ctx.moveTo(0, HALF_H); ctx.lineTo(W, HALF_H);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#4fa3e0";
  ctx.fill();
}

function applyState(state) {
  valX.textContent = state.x;
  valY.textContent = state.y;
  drawPad(state.x, state.y);

  var c = state.counters;
  for (var key in countEls) {
    var val = c[key];
    if (val !== prevCounts[key]) {
      countEls[key].textContent = val;
      flash(countEls[key]);
      prevCounts[key] = val;
    }
  }
}

// Draw initial centred dot
drawPad(0, 0);
