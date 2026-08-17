'use strict';

const ui = new WebUI();

const statusEl = document.getElementById("status");     // connection badge
let currentDevices = [];
let busy = false;

// ── Activity status bar ──────────────────────────────────────────────────────
function setActivity(msg, type = 'info', spinning = false) {
  document.getElementById('statusBar').className = 'statusbar ' + type;
  document.getElementById('statusMsg').textContent = msg;
  document.getElementById('spinner').style.display = spinning ? 'block' : 'none';
}

function setBusy(on) {
  busy = on;
  document.getElementById('rescanBtn').disabled   = on;
  document.getElementById('resetAllBtn').disabled = on;
  document.querySelectorAll('.btn-change, .btn-reset').forEach(b => b.disabled = on);
}

// ── Hex helpers ──────────────────────────────────────────────────────────────
function parseHex(str) {
  if (!str) return null;
  str = str.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]{1,2}$/.test(str)) return null;
  const n = parseInt(str, 16);
  return (n >= 8 && n <= 0x77) ? n : null;
}

function fmtHex(n) { return '0x' + n.toString(16).toUpperCase().padStart(2, '0'); }

// ── Render ───────────────────────────────────────────────────────────────────
function renderDevices(devs) {
  const container = document.getElementById('deviceList');

  if (!devs || devs.length === 0) {
    container.innerHTML =
      '<div class="empty">No devices found.<br>Check connections and click <strong>Rescan I²C bus</strong>.</div>';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Current</th><th>Node</th><th>Default</th>
        <th>Status</th><th>New address</th><th>Actions</th>
      </tr>
    </thead>`;

  const tbody = document.createElement('tbody');

  for (const dev of devs) {
    const tr = document.createElement('tr');

    if (!dev.configurable) {
      tr.className = 'fixed-row';
      tr.innerHTML = `
        <td><code>${dev.addrHex}</code></td>
        <td>${dev.name}</td>
        <td>—</td>
        <td><span class="badge badge-fixed">Fixed</span></td>
        <td>—</td>
        <td>—</td>`;
    } else {
      const badgeClass = dev.modified ? 'badge-modified' : 'badge-default';
      const badgeText  = dev.modified ? 'Modified ★' : 'At default';
      const defaultInfo = dev.modified
        ? `Default: <code>${dev.defaultAddrHex}</code>`
        : `<code>${dev.defaultAddrHex}</code>`;
      const dupNote = !dev.modified
        ? `<span class="dup-hint" title="Multiple identical nodes share this address and appear as one entry. Disconnect all but one before changing — see the tip above.">ⓘ</span>`
        : '';

      tr.innerHTML = `
        <td><code>${dev.addrHex}</code></td>
        <td><strong>${dev.name}</strong></td>
        <td>${defaultInfo}</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span>${dupNote}</td>
        <td>
          <input id="inp-${dev.addr}" class="addr-input" placeholder="e.g. 0x3E"
                 autocomplete="off" oninput="validateInput(${dev.addr})" />
          <div id="hint-${dev.addr}" class="addr-hint"></div>
        </td>
        <td>
          <div class="addr-controls">
            <button class="btn small btn-change" onclick="handleChange(${dev.addr})">Change</button>
            <button class="btn small btn-reset" onclick="handleReset(${dev.addr})"
                    ${!dev.modified ? 'disabled title="Already at default address"' : ''}>Reset</button>
          </div>
        </td>`;
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

// ── Input validation ─────────────────────────────────────────────────────────
function validateInput(addr) {
  const inp  = document.getElementById(`inp-${addr}`);
  const hint = document.getElementById(`hint-${addr}`);
  const val  = inp.value.trim();

  if (!val) { inp.className = 'addr-input'; hint.textContent = ''; hint.className = 'addr-hint'; return null; }

  const n = parseHex(val);
  if (n === null) {
    inp.className = 'addr-input invalid';
    hint.textContent = 'Must be 0x08–0x77'; hint.className = 'addr-hint err';
    return null;
  }
  if (n === addr) {
    inp.className = 'addr-input invalid';
    hint.textContent = 'Same as current address'; hint.className = 'addr-hint err';
    return null;
  }
  const inUse = currentDevices.find(d => d.addr === n);
  if (inUse) {
    inp.className = 'addr-input inuse';
    hint.textContent = `In use by ${inUse.name}`; hint.className = 'addr-hint warn';
    return n;
  }
  inp.className = 'addr-input valid';
  hint.textContent = fmtHex(n) + ' — valid'; hint.className = 'addr-hint ok';
  return n;
}

// ── Actions (Browser → Python over Socket.IO) ────────────────────────────────
function rescan() {
  if (busy) return;
  setBusy(true);
  setActivity('Scanning I²C bus…', 'info', true);
  ui.send_message('rescan', {});
}

function doChange(curAddr, newAddr) {
  setBusy(true);
  const from = fmtHex(curAddr);
  const to   = newAddr === 0 ? 'default' : fmtHex(newAddr);
  setActivity(`Changing ${curAddr === 0 ? 'all' : from} → ${to}…`, 'info', true);
  ui.send_message('change_address', { cur_addr: curAddr, new_addr: newAddr });
}

function handleChange(addr) {
  const n = validateInput(addr);
  if (n === null) {
    const inp = document.getElementById(`inp-${addr}`);
    if (!inp.value.trim()) {
      inp.className = 'addr-input invalid';
      const hint = document.getElementById(`hint-${addr}`);
      hint.textContent = 'Enter a new address first'; hint.className = 'addr-hint err';
    }
    return;
  }
  const inUse = currentDevices.find(d => d.addr === n);
  if (inUse && !confirm(
    `${fmtHex(n)} is currently in use by ${inUse.name}.\n` +
    `If you proceed, that device may become unreachable.\n\nContinue anyway?`
  )) return;
  doChange(addr, n);
}

function handleReset(addr) {
  const dev = currentDevices.find(d => d.addr === addr);
  const defHex = dev ? dev.defaultAddrHex : '?';
  if (confirm(`Reset device at ${fmtHex(addr)} to its default address (${defHex})?`)) {
    doChange(addr, 0);
  }
}

function resetAll() {
  const count = currentDevices.filter(d => d.configurable).length;
  if (count === 0) { alert('No configurable devices found on the bus.'); return; }
  if (confirm(
    `Reset ALL ${count} configurable device${count !== 1 ? 's' : ''} to their default addresses?\n\n` +
    `This sends a broadcast I²C command.`
  )) {
    doChange(0, 0);
  }
}

document.getElementById('rescanBtn').addEventListener('click', rescan);
document.getElementById('resetAllBtn').addEventListener('click', resetAll);

// ── Python → Browser ─────────────────────────────────────────────────────────
ui.on_message('devices_update', data => {
  currentDevices = data.devices || [];
  renderDevices(currentDevices);
  setBusy(false);
  const n = currentDevices.length;
  setActivity(`Found ${n} device${n !== 1 ? 's' : ''}.`, 'ok');
});

ui.on_message('change_result', data => {
  if (data.success) {
    const to = data.new_addr === 0 ? 'default' : fmtHex(data.new_addr);
    setActivity(`Done — changed to ${to}. Bus rescanned.`, 'ok');
  } else {
    setActivity(`Change failed: ${data.message || 'unknown error'}`, 'err');
    setBusy(false);
  }
});

ui.on_connect(() => {
  statusEl.className = 'status connected';    statusEl.textContent = '● Connected';
});
ui.on_disconnect(() => {
  statusEl.className = 'status disconnected'; statusEl.textContent = '● Disconnected';
  setActivity('Disconnected from board.', 'err');
});
