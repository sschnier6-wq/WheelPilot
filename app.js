const STORE_KEY = "wheelpilot.v1";

const state = {
  market: null,
  view: "dash",
  step: 1,
  scanSide: "P",
  data: loadData()
};

function defaultData() {
  return {
    buyingPower: 25000,
    watchlist: ["AAPL", "MSFT", "KO", "JPM", "SPY"],
    cycles: [],
    snapshots: []
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultData();
    return Object.assign(defaultData(), JSON.parse(raw));
  } catch {
    return defaultData();
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.data));
  renderAll();
}

function uid() {
  return "c" + Math.random().toString(36).slice(2, 9);
}

function activeCycle() {
  return state.data.cycles.find((c) => c.status === "open") || null;
}

function ensureCycle() {
  let c = activeCycle();
  if (!c) {
    c = {
      id: uid(),
      status: "open",
      stage: "find-put",
      ticker: "",
      recPut: null,
      actPut: null,
      putOutcome: null,
      shares: 0,
      costBasis: 0,
      recCall: null,
      actCall: null,
      callOutcome: null,
      realized: 0,
      created: new Date().toISOString()
    };
    state.data.cycles.push(c);
  }
  return c;
}

function num(id) {
  const v = document.getElementById(id)?.value;
  if (v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function between(val, min, max) {
  if (min != null && val < min) return false;
  if (max != null && val > max) return false;
  return true;
}

function filteredContracts(side) {
  const m = state.market;
  const watch = new Set(state.data.watchlist.map((t) => t.toUpperCase()));
  const ticker = (document.getElementById("f-ticker")?.value || "").trim().toUpperCase();
  const hideEtf = document.getElementById("f-hide-etf")?.checked;
  const illiquid = document.getElementById("f-illiquid")?.checked;
  const watchOnly = document.getElementById("f-watch-only")?.checked;
  return m.contracts.filter((c) => {
    if (c.right !== side) return false;
    if (ticker && !c.ticker.includes(ticker)) return false;
    if (hideEtf && c.etf) return false;
    if (watchOnly && !watch.has(c.ticker)) return false;
    if (illiquid && (c.volume < 50 || c.oi < 100 || c.spreadPct > 8)) return false;
    if (!between(c.dte, num("f-dte-min"), num("f-dte-max"))) return false;
    if (!between(c.delta, num("f-delta-min"), num("f-delta-max"))) return false;
    if (!between(c.ann, num("f-ann-min"), num("f-ann-max"))) return false;
    if (!between(c.roc, num("f-roc-min"), num("f-roc-max"))) return false;
    if (!between(c.iv, num("f-iv-min"), num("f-iv-max"))) return false;
    if (num("f-spread") != null && c.spreadPct > num("f-spread")) return false;
    if (!between(c.volume, num("f-vol-min"), num("f-vol-max"))) return false;
    if (!between(c.oi, num("f-oi-min"), num("f-oi-max"))) return false;
    if (!between(c.otmPct, num("f-otm-min"), num("f-otm-max"))) return false;
    if (!between(c.earnIn, num("f-earn-min"), num("f-earn-max"))) return false;
    if (!between(c.cap, num("f-cap-min"), num("f-cap-max"))) return false;
    if (c.pe && !between(c.pe, num("f-pe-min"), num("f-pe-max"))) return false;
    if (!between(c.beta, num("f-beta-min"), num("f-beta-max"))) return false;
    if (!between(c.short, num("f-short-min"), num("f-short-max"))) return false;
    if (!between(c.tsRating, num("f-rate-min"), num("f-rate-max"))) return false;
    return true;
  }).sort((a, b) => b.optScore - a.optScore);
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  ["dash", "scan", "wheel", "journal", "watch", "settings"].forEach((v) => {
    document.getElementById("view-" + v).classList.toggle("hidden", v !== view);
  });
  renderAll();
}

function setStep(step) {
  state.step = Number(step);
  document.querySelectorAll("#wheel-tabs .tab").forEach((b) => b.classList.toggle("active", Number(b.dataset.step) === state.step));
  for (let i = 1; i <= 6; i++) {
    document.getElementById("step-" + i).classList.toggle("hidden", i !== state.step);
  }
  renderWheel();
}

function contractLine(c) {
  if (!c) return "None yet";
  return `${c.ticker} ${c.right || (c.type === "Call" ? "C" : "P")} ${c.strike} ${c.exp || c.expLabel} @ ${money(c.premium ?? c.bid)}`;
}

function renderStatus() {
  const c = activeCycle();
  const el = document.getElementById("wheel-status");
  if (!c) {
    el.innerHTML = "No open cycle. Pick a recommended put in tab 1 to start.";
    return;
  }
  el.innerHTML = `<strong>${c.ticker || "New cycle"}</strong> · stage ${c.stage}
    · rec put: ${contractLine(c.recPut)}
    · actual put: ${contractLine(c.actPut)}
    · rec call: ${contractLine(c.recCall)}
    · actual call: ${contractLine(c.actCall)}`;
}

function pickPut(contract) {
  const cyc = ensureCycle();
  cyc.ticker = contract.ticker;
  cyc.recPut = contract;
  cyc.stage = "log-put";
  save();
  setView("wheel");
  setStep(2);
}

function pickCall(contract) {
  const cyc = activeCycle();
  if (!cyc || cyc.putOutcome !== "assigned") return;
  cyc.recCall = contract;
  cyc.stage = "log-call";
  save();
  setStep(5);
}

function formToActual(form, right) {
  const fd = new FormData(form);
  const strike = Number(fd.get("strike"));
  const premium = Number(fd.get("premium"));
  const qty = Number(fd.get("qty") || 1);
  const exp = fd.get("exp");
  const dte = Math.max(0, Math.round((new Date(exp) - new Date()) / 86400000));
  return {
    ticker: String(fd.get("ticker")).toUpperCase(),
    right,
    type: right === "P" ? "Put" : "Call",
    strike,
    exp,
    premium,
    delta: fd.get("delta") ? Number(fd.get("delta")) : null,
    qty,
    filled: fd.get("filled") || iso(new Date()),
    notes: fd.get("notes") || "",
    dte,
    credit: +(premium * 100 * qty).toFixed(2)
  };
}

function renderCompare(el, rec, act, labelRec, labelAct) {
  el.innerHTML = `
    <div class="col">
      <h3>${labelRec}</h3>
      ${rec ? kvBlock(rec, true) : "<div class='empty'>No recommendation yet. Go back one tab.</div>"}
    </div>
    <div class="col">
      <h3>${labelAct}</h3>
      ${act ? kvBlock(act, false) : "<div class='empty'>Save the fill you got at the broker.</div>"}
    </div>`;
}

function kvBlock(c, isRec) {
  const prem = c.premium ?? c.bid;
  return `<div class="kv">
    <span>Ticker</span><span class="ticker">${c.ticker}</span>
    <span>Type</span><span>${c.type || c.right}</span>
    <span>Strike</span><span>${c.strike}</span>
    <span>Expiration</span><span>${c.exp || c.expLabel}</span>
    <span>DTE</span><span>${c.dte ?? "—"}</span>
    <span>Delta</span><span>${c.delta ?? "—"}</span>
    <span>Premium / sh</span><span>${prem != null ? money(prem) : "—"}</span>
    <span>Source</span><span class="badge ${isRec ? "rec" : "act"}">${isRec ? "Recommended" : "Actual fill"}</span>
  </div>`;
}

function fillForm(form, c) {
  if (!c) return;
  form.ticker.value = c.ticker || "";
  form.strike.value = c.strike || "";
  form.exp.value = (c.exp || "").slice(0, 10);
  form.premium.value = c.premium ?? c.bid ?? "";
  form.delta.value = c.delta ?? "";
  form.qty.value = c.qty || 1;
  form.filled.value = iso(new Date());
}

function renderCspPicks() {
  const focus = (document.getElementById("pick-ticker")?.value || "").trim().toUpperCase();
  let rows = filteredContracts("P");
  if (focus) rows = rows.filter((r) => r.ticker === focus);
  rows = rows.slice(0, 25);
  document.getElementById("csp-picks").innerHTML = rows.map((c) => `
    <tr>
      <td><button class="btn" data-pick-put="${c.id}">Use</button></td>
      <td class="ticker">${c.ticker}<div class="sub">${c.name}</div></td>
      <td>${money(c.spot)}</td>
      <td>${c.strike}</td>
      <td>${c.dte}d</td>
      <td>${c.delta}</td>
      <td>${money(c.bid)}</td>
      <td>${c.ann}%</td>
      <td>${money0(c.collateral)}</td>
    </tr>`).join("") || `<tr><td colspan="9" class="empty">No puts match. Loosen filters on Scanner.</td></tr>`;
  document.querySelectorAll("[data-pick-put]").forEach((b) => {
    b.onclick = () => {
      const c = state.market.contracts.find((x) => x.id === b.dataset.pickPut);
      if (c) pickPut(c);
    };
  });
}

function renderLivePut() {
  const cyc = activeCycle();
  const el = document.getElementById("live-put");
  if (!cyc || !cyc.actPut) {
    el.innerHTML = "<div class='empty'>Log an actual put first.</div>";
    return;
  }
  const p = cyc.actPut;
  const target = p.credit * 0.5;
  el.innerHTML = `
    <div class="compare">
      <div class="col">${kvBlock(cyc.recPut, true)}</div>
      <div class="col">${kvBlock(p, false)}</div>
    </div>
    <p class="hint">Credit collected: <strong>${money(p.credit)}</strong> · 50% profit target to close: <strong>${money(target)}</strong></p>
    <div class="btn-row">
      <button class="btn good" id="put-expire">Expired worthless</button>
      <button class="btn ghost" id="put-close">Closed early</button>
      <button class="btn" id="put-assign">Assigned — I own the shares</button>
    </div>`;
  document.getElementById("put-expire").onclick = () => settlePut("expired", p.credit);
  document.getElementById("put-close").onclick = () => {
    const buyback = Number(prompt("Buy-to-close price per share?", String((p.premium * 0.5).toFixed(2))));
    if (!Number.isFinite(buyback)) return;
    const pnl = (p.premium - buyback) * 100 * (p.qty || 1);
    settlePut("closed", pnl);
  };
  document.getElementById("put-assign").onclick = () => {
    const qty = p.qty || 1;
    cyc.putOutcome = "assigned";
    cyc.shares = 100 * qty;
    cyc.costBasis = +(p.strike - p.premium).toFixed(2);
    cyc.realized += p.credit;
    cyc.stage = "find-call";
    pushSnap(p.credit);
    save();
    setStep(4);
  };
}

function settlePut(outcome, pnl) {
  const cyc = activeCycle();
  cyc.putOutcome = outcome;
  cyc.realized += pnl;
  cyc.status = "closed";
  cyc.stage = "done";
  pushSnap(pnl);
  save();
  alert("Cycle closed without shares. Start again from Find Put.");
  setStep(1);
}

function renderCcPicks() {
  const wrap = document.getElementById("cc-picks-wrap");
  const cyc = activeCycle();
  if (!cyc || cyc.putOutcome !== "assigned") {
    wrap.innerHTML = "<div class='empty'>Assignment is required before selling a covered call.</div>";
    return;
  }
  const rows = state.market.contracts
    .filter((c) => c.right === "C" && c.ticker === cyc.ticker && c.strike >= cyc.costBasis * 0.98 && c.dte >= 21 && c.dte <= 60)
    .sort((a, b) => b.optScore - a.optScore)
    .slice(0, 15);
  wrap.innerHTML = `
    <p>Assigned <strong>${cyc.shares}</strong> ${cyc.ticker} · adjusted cost basis <strong>${money(cyc.costBasis)}</strong></p>
    <div style="overflow:auto">
      <table>
        <thead><tr><th></th><th>Strike</th><th>DTE</th><th>Δ</th><th>Bid</th><th>Ann %</th><th>OTM %</th></tr></thead>
        <tbody>
          ${rows.map((c) => `<tr>
            <td><button class="btn" data-pick-call="${c.id}">Use</button></td>
            <td>${c.strike}</td><td>${c.dte}d</td><td>${c.delta}</td>
            <td>${money(c.bid)}</td><td>${c.ann}%</td><td>${c.otmPct}%</td>
          </tr>`).join("") || "<tr><td colspan='7' class='empty'>No calls in range. Try another ticker or log manually.</td></tr>"}
        </tbody>
      </table>
    </div>`;
  wrap.querySelectorAll("[data-pick-call]").forEach((b) => {
    b.onclick = () => {
      const c = state.market.contracts.find((x) => x.id === b.dataset.pickCall);
      if (c) pickCall(c);
    };
  });
}

function renderLiveCall() {
  const cyc = activeCycle();
  const el = document.getElementById("live-call");
  if (!cyc || !cyc.actCall) {
    el.innerHTML = "<div class='empty'>Log an actual covered call first.</div>";
    return;
  }
  const p = cyc.actCall;
  el.innerHTML = `
    <div class="compare">
      <div class="col">${kvBlock(cyc.recCall, true)}</div>
      <div class="col">${kvBlock(p, false)}</div>
    </div>
    <p class="hint">Shares ${cyc.shares} ${cyc.ticker} · basis ${money(cyc.costBasis)} · extra credit ${money(p.credit)}</p>
    <div class="btn-row">
      <button class="btn good" id="cc-expire">Call expired — sell another</button>
      <button class="btn ghost" id="cc-close">Closed early</button>
      <button class="btn" id="cc-away">Called away</button>
    </div>`;
  document.getElementById("cc-expire").onclick = () => {
    cyc.realized += p.credit;
    cyc.costBasis = +(cyc.costBasis - p.premium).toFixed(2);
    cyc.actCall = null;
    cyc.recCall = null;
    cyc.callOutcome = "expired";
    cyc.stage = "find-call";
    pushSnap(p.credit);
    save();
    setStep(4);
  };
  document.getElementById("cc-close").onclick = () => {
    const buyback = Number(prompt("Buy-to-close price per share?", String((p.premium * 0.5).toFixed(2))));
    if (!Number.isFinite(buyback)) return;
    const pnl = (p.premium - buyback) * 100 * (p.qty || 1);
    cyc.realized += pnl;
    cyc.actCall = null;
    cyc.recCall = null;
    cyc.callOutcome = "closed";
    cyc.stage = "find-call";
    pushSnap(pnl);
    save();
    setStep(4);
  };
  document.getElementById("cc-away").onclick = () => {
    const exit = p.strike;
    const stockPnl = (exit - cyc.costBasis) * cyc.shares;
    const total = stockPnl + p.credit;
    cyc.realized += total;
    cyc.callOutcome = "called-away";
    cyc.status = "closed";
    cyc.stage = "done";
    pushSnap(total);
    save();
    alert("Called away. Cycle realized " + money(total) + ". Start a new put.");
    setStep(1);
  };
}

function pushSnap(delta) {
  const last = state.data.snapshots[state.data.snapshots.length - 1];
  const value = (last ? last.value : 0) + delta;
  state.data.snapshots.push({ date: iso(new Date()), value: +value.toFixed(2) });
}

function renderScan() {
  const rows = filteredContracts(state.scanSide).slice(0, 40);
  document.getElementById("scan-count").textContent = `(${rows.length} shown)`;
  document.getElementById("scan-body").innerHTML = rows.map((c) => `
    <tr data-pick="${c.id}" style="cursor:pointer">
      <td class="ticker">${c.ticker}</td>
      <td>${c.strike} <span class="badge ${c.right === "P" ? "put" : "call"}">${c.right}</span></td>
      <td>${c.dte}d</td>
      <td>${c.delta}</td>
      <td>${money(c.bid)}</td>
      <td>${c.ann}%</td>
      <td>${c.optScore}</td>
    </tr>`).join("") || `<tr><td colspan="7" class="empty">No matches</td></tr>`;
  document.querySelectorAll("#scan-body tr[data-pick]").forEach((tr) => {
    tr.onclick = () => {
      const c = state.market.contracts.find((x) => x.id === tr.dataset.pick);
      if (!c) return;
      if (c.right === "P") pickPut(c);
      else {
        const cyc = activeCycle();
        if (cyc && cyc.putOutcome === "assigned" && cyc.ticker === c.ticker) pickCall(c);
        else {
          alert("Covered calls are chosen after a put assignment on that ticker. Use Wheel tab 4.");
        }
      }
    };
  });
}

function renderJournal() {
  const body = document.getElementById("journal-body");
  const rows = [];
  state.data.cycles.slice().reverse().forEach((c, i) => {
    const n = state.data.cycles.length - i;
    if (c.recPut || c.actPut) {
      rows.push(`<tr>
        <td>#${n}</td>
        <td>CSP</td>
        <td><span class="badge put">Put</span></td>
        <td>${c.ticker}</td>
        <td>${(c.actPut || c.recPut)?.strike ?? ""}</td>
        <td>${(c.actPut || c.recPut)?.exp ?? ""}</td>
        <td>${c.recPut ? money(c.recPut.premium ?? c.recPut.bid) : "—"}</td>
        <td>${c.actPut ? money(c.actPut.premium) : "—"}</td>
        <td><span class="badge ${c.putOutcome ? "done" : "open"}">${c.putOutcome || "open"}</span></td>
      </tr>`);
    }
    if (c.recCall || c.actCall) {
      rows.push(`<tr>
        <td>#${n}</td>
        <td>CC</td>
        <td><span class="badge call">Call</span></td>
        <td>${c.ticker}</td>
        <td>${(c.actCall || c.recCall)?.strike ?? ""}</td>
        <td>${(c.actCall || c.recCall)?.exp ?? ""}</td>
        <td>${c.recCall ? money(c.recCall.premium ?? c.recCall.bid) : "—"}</td>
        <td>${c.actCall ? money(c.actCall.premium) : "—"}</td>
        <td><span class="badge ${c.callOutcome ? "done" : "open"}">${c.callOutcome || "open"}</span></td>
      </tr>`);
    }
  });
  body.innerHTML = rows.join("") || `<tr><td colspan="9" class="empty">No cycles yet</td></tr>`;
}

function renderWatch() {
  const box = document.getElementById("watch-list");
  box.innerHTML = state.data.watchlist.map((t) =>
    `<span class="pill" style="margin:4px">${t} <button class="btn ghost" data-del="${t}" style="padding:2px 8px;margin-left:6px">×</button></span>`
  ).join("") || "<div class='empty'>Empty watchlist</div>";
  box.querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = () => {
      state.data.watchlist = state.data.watchlist.filter((x) => x !== b.dataset.del);
      save();
    };
  });
}

function metrics() {
  const cycles = state.data.cycles;
  const putsDone = cycles.filter((c) => c.putOutcome);
  const assigned = putsDone.filter((c) => c.putOutcome === "assigned");
  const callsDone = cycles.filter((c) => c.callOutcome);
  const away = callsDone.filter((c) => c.callOutcome === "called-away");
  const dtes = cycles.flatMap((c) => [c.actPut?.dte, c.actCall?.dte]).filter((x) => x != null);
  const avgDte = dtes.length ? Math.round(dtes.reduce((a, b) => a + b, 0) / dtes.length) : 0;
  const realized = cycles.reduce((a, c) => a + (c.realized || 0), 0);
  const first = state.data.snapshots[0];
  const last = state.data.snapshots[state.data.snapshots.length - 1];
  let days = 30;
  if (first && last) {
    days = Math.max(1, Math.round((new Date(last.date) - new Date(first.date)) / 86400000) || 1);
  }
  const ppd = realized / days;
  const ann = state.data.buyingPower ? (ppd * 365 / state.data.buyingPower) * 100 : 0;
  return {
    assign: putsDone.length ? (assigned.length / putsDone.length) * 100 : 0,
    callaway: callsDone.length ? (away.length / callsDone.length) * 100 : 0,
    avgDte,
    ppd,
    ann,
    realized
  };
}

function capital() {
  const open = state.data.cycles.filter((c) => c.status === "open");
  let collat = 0;
  let shares = 0;
  open.forEach((c) => {
    if (c.actPut && !c.putOutcome) collat += c.actPut.strike * 100 * (c.actPut.qty || 1);
    if (c.putOutcome === "assigned") shares += c.costBasis * (c.shares || 0);
  });
  return { collat, shares, free: state.data.buyingPower - collat, openN: open.length };
}

function renderDash() {
  const m = metrics();
  const cap = capital();
  document.getElementById("m-assign").textContent = m.assign.toFixed(1) + "%";
  document.getElementById("m-callaway").textContent = m.callaway.toFixed(1) + "%";
  document.getElementById("m-dte").textContent = m.avgDte ? m.avgDte + "d" : "—";
  document.getElementById("m-ppd").textContent = money(m.ppd);
  document.getElementById("m-ann").textContent = m.ann.toFixed(1) + "%";
  document.getElementById("buying-power").value = state.data.buyingPower;
  document.getElementById("bp-pill").textContent = "Buying power " + money0(state.data.buyingPower);
  document.getElementById("open-coll").textContent = money0(cap.collat);
  document.getElementById("share-cost").textContent = money0(cap.shares);
  document.getElementById("free-cash").textContent = money0(cap.free);
  document.getElementById("open-n").textContent = String(cap.openN);
  document.getElementById("asof").textContent = "Demo tape " + new Date().toLocaleDateString();
  drawChart();
}

function drawChart() {
  const canvas = document.getElementById("growth");
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0c1926";
  ctx.fillRect(0, 0, w, h);
  const pts = state.data.snapshots.length ? state.data.snapshots : [{ date: iso(new Date()), value: 0 }];
  const vals = pts.map((p) => p.value);
  const min = Math.min(0, ...vals);
  const max = Math.max(1000, ...vals);
  const x = (i) => 40 + (i / Math.max(pts.length - 1, 1)) * (w - 60);
  const y = (v) => h - 30 - ((v - min) / (max - min || 1)) * (h - 50);
  ctx.strokeStyle = "#1d3248";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const yy = 20 + i * ((h - 50) / 4);
    ctx.beginPath(); ctx.moveTo(40, yy); ctx.lineTo(w - 10, yy); ctx.stroke();
    ctx.fillStyle = "#8aa0b8";
    ctx.font = "11px sans-serif";
    const label = Math.round(max - i * (max - min) / 4);
    ctx.fillText("$" + label.toLocaleString(), 4, yy + 4);
  }
  ctx.strokeStyle = "#3d9fff";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(x(i), y(p.value)) : ctx.moveTo(x(i), y(p.value)));
  ctx.stroke();
  const last = pts[pts.length - 1];
  ctx.fillStyle = "#3d9fff";
  ctx.beginPath();
  ctx.arc(x(pts.length - 1), y(last.value), 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8f1fa";
  ctx.font = "12px sans-serif";
  ctx.fillText(money0(last.value), x(pts.length - 1) - 30, y(last.value) - 10);
}

function renderWheel() {
  renderStatus();
  if (state.step === 1) renderCspPicks();
  if (state.step === 2) {
    const c = activeCycle();
    renderCompare(document.getElementById("put-compare"), c?.recPut, c?.actPut, "Recommended put", "Actual put sold");
  }
  if (state.step === 3) renderLivePut();
  if (state.step === 4) renderCcPicks();
  if (state.step === 5) {
    const c = activeCycle();
    renderCompare(document.getElementById("call-compare"), c?.recCall, c?.actCall, "Recommended call", "Actual call sold");
  }
  if (state.step === 6) renderLiveCall();
}

function renderAll() {
  renderDash();
  renderScan();
  renderWheel();
  renderJournal();
  renderWatch();
}

function loadSample() {
  const sample = defaultData();
  sample.buyingPower = 40000;
  sample.snapshots = [
    { date: "2026-06-17", value: 2400 },
    { date: "2026-07-16", value: 16800 },
    { date: "2026-07-24", value: 22100 },
    { date: "2026-08-20", value: 41378 },
    { date: "2026-09-01", value: 43820 }
  ];
  sample.cycles = [
    { id: "s1", status: "closed", stage: "done", ticker: "KO", recPut: { ticker:"KO", type:"Put", right:"P", strike:66, exp:"2026-07-18", dte:32, delta:0.22, premium:0.85 }, actPut: { ticker:"KO", type:"Put", right:"P", strike:66, exp:"2026-07-18", dte:30, delta:0.21, premium:0.92, qty:2, credit:184 }, putOutcome: "expired", realized: 184, created: "2026-06-18" },
    { id: "s2", status: "closed", stage: "done", ticker: "JPM", recPut: { ticker:"JPM", type:"Put", right:"P", strike:240, exp:"2026-08-15", dte:40, delta:0.28, premium:3.10 }, actPut: { ticker:"JPM", type:"Put", right:"P", strike:240, exp:"2026-08-15", dte:38, delta:0.30, premium:3.40, qty:1, credit:340 }, putOutcome: "assigned", recCall: { ticker:"JPM", type:"Call", right:"C", strike:250, exp:"2026-09-19", dte:35, delta:0.32, premium:4.20 }, actCall: { ticker:"JPM", type:"Call", right:"C", strike:247.5, exp:"2026-09-19", dte:33, delta:0.35, premium:4.55, qty:1, credit:455 }, callOutcome: "expired", shares: 100, costBasis: 236.6, realized: 795, created: "2026-07-08" }
  ];
  state.data = sample;
  save();
}

function bind() {
  document.querySelectorAll(".nav-btn").forEach((b) => b.onclick = () => setView(b.dataset.view));
  document.querySelectorAll("#wheel-tabs .tab").forEach((b) => b.onclick = () => setStep(b.dataset.step));
  document.querySelectorAll(".scan-side").forEach((b) => {
    b.onclick = () => {
      state.scanSide = b.dataset.side;
      document.querySelectorAll(".scan-side").forEach((x) => x.classList.toggle("active", x === b));
      renderScan();
    };
  });
  document.getElementById("run-scan").onclick = renderScan;
  document.getElementById("reset-scan").onclick = () => {
    document.querySelectorAll("#filter-form input[type=number], #filter-form input[type=text]").forEach((i) => {
      if (!["f-dte-min","f-dte-max","f-delta-min","f-delta-max","f-ann-min","f-vol-min","f-oi-min","f-earn-min"].includes(i.id)) i.value = "";
    });
    document.getElementById("f-dte-min").value = 21;
    document.getElementById("f-dte-max").value = 45;
    document.getElementById("f-delta-min").value = 0.15;
    document.getElementById("f-delta-max").value = 0.35;
    document.getElementById("f-ann-min").value = 12;
    document.getElementById("f-vol-min").value = 100;
    document.getElementById("f-oi-min").value = 200;
    document.getElementById("f-earn-min").value = 14;
    renderScan();
  };
  document.getElementById("save-bp").onclick = () => {
    state.data.buyingPower = Number(document.getElementById("buying-power").value || 0);
    save();
  };
  document.getElementById("focus-ticker").onclick = renderCspPicks;
  document.getElementById("put-actual").onsubmit = (e) => {
    e.preventDefault();
    const cyc = ensureCycle();
    cyc.actPut = formToActual(e.target, "P");
    cyc.ticker = cyc.actPut.ticker;
    cyc.stage = "put-live";
    save();
    setStep(3);
  };
  document.getElementById("call-actual").onsubmit = (e) => {
    e.preventDefault();
    const cyc = activeCycle();
    if (!cyc || cyc.putOutcome !== "assigned") {
      alert("Assign the put before logging a covered call.");
      return;
    }
    cyc.actCall = formToActual(e.target, "C");
    cyc.stage = "call-live";
    save();
    setStep(6);
  };
  document.getElementById("copy-rec-put").onclick = () => fillForm(document.getElementById("put-actual"), activeCycle()?.recPut);
  document.getElementById("copy-rec-call").onclick = () => fillForm(document.getElementById("call-actual"), activeCycle()?.recCall);
  document.getElementById("watch-add").onclick = () => {
    const t = document.getElementById("watch-input").value.trim().toUpperCase();
    if (!t) return;
    if (!state.data.watchlist.includes(t)) state.data.watchlist.push(t);
    document.getElementById("watch-input").value = "";
    save();
  };
  document.getElementById("export-json").onclick = () => {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wheelpilot-journal.json";
    a.click();
  };
  document.getElementById("wipe").onclick = () => {
    if (confirm("Erase all local cycles and metrics?")) {
      state.data = defaultData();
      save();
    }
  };
  document.getElementById("load-sample").onclick = loadSample;
}

function init() {
  state.market = buildMarket();
  bind();
  setView("dash");
}

init();
