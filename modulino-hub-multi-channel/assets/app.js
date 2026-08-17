const ui = new WebUI();

const statusEl = document.getElementById("status");
const rescanBtn = document.getElementById("rescanBtn");
const summaryEl = document.getElementById("summary");

// ── Render the 8-channel grid ────────────────────────────────────
function renderChannels(channels) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  let total = 0;

  channels.forEach((nodes, ch) => {
    total += nodes.length;

    const card = document.createElement("div");
    card.className = "channel" + (nodes.length ? " populated" : "");

    const nodesHtml = nodes.length
      ? nodes.map(n => `
          <div class="node">
            <span class="node-name">${n.name}</span>
            <span class="node-addr">${n.addrHex}</span>
          </div>`).join("")
      : `<div class="channel-empty">empty</div>`;

    card.innerHTML = `
      <div class="channel-head">
        <span class="channel-name">Channel ${ch}</span>
        <span class="channel-count">${nodes.length}</span>
      </div>
      ${nodesHtml}`;

    grid.appendChild(card);
  });

  summaryEl.textContent = `${total} node${total !== 1 ? "s" : ""} across ${channels.length} channels`;
  rescanBtn.disabled = false;
}

rescanBtn.addEventListener("click", () => {
  rescanBtn.disabled = true;
  summaryEl.textContent = "Scanning all channels…";
  ui.send_message("rescan", {});
});

// ── Python → Browser ─────────────────────────────────────────────
ui.on_message("channels_update", data => {
  if (data && data.channels) renderChannels(data.channels);
});

ui.on_connect(() => { statusEl.className = "status connected";    statusEl.textContent = "● Connected";    });
ui.on_disconnect(() => { statusEl.className = "status disconnected"; statusEl.textContent = "● Disconnected"; });
