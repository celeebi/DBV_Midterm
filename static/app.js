/**
 * MM6026 Digital Business Valuation Platform
 * Institutional Frontend Controller (Asynchronous React-grade client)
 */

let state = {
  ticker: "ASII.JK",
  company: null,
  growthRates: [6.0, 3.0, 2.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5],
  margins: [14.0, 13.5, 13.5, 14.0, 14.0, 13.9, 13.8, 13.8, 13.8, 13.8],
  notes: [
    "Consensus auto recovery and heavy equipment volume steady",
    "Conservative 3.0% growth due to EV competition and price discounting",
    "Macro consolidation phase; capital discipline and inventory optimization",
    "New EV/hybrid model rollout and mining equipment replacement cycle",
    "Phase 1 maturation; operating margin stabilizes near 14.0%",
    "Transition Fade Year 1: High growth fades toward macroeconomic equilibrium",
    "Transition Fade Year 2: Automotive electrification penetration deepens",
    "Transition Fade Year 3: Margins stabilize at industry steady-state",
    "Transition Fade Year 4: Reinvestment equals steady maintenance replacement",
    "Terminal Year 10: Equilibrium growth (g = 1.5%) reached for Gordon Growth Model"
  ],
  terminalG: 1.5,
  exitMultiple: 4.5,
  waccParams: {
    rf: 6.60,
    beta: 0.85,
    erp: 7.20,
    kd_pre: 5.80,
    wd: 21.5,
    tax_rate: 22.0
  },
  reinvestmentParams: {
    capex_pct: 5.5,
    expansion_capex: 0.0,
    nwc_pct: 8.0,
    has_tax_holiday: false
  },
  compsParams: {
    stat_method: "median",
    filter_outliers: true
  },
  methodWeights: {
    w_dcf: 0.60,
    w_comps: 0.25,
    w_rim: 0.15,
    inc_dcf: true,
    inc_comps: true,
    inc_rim: true
  },
  latestRecalcData: null
};

// =============================================================================
// INITIALIZATION
// =============================================================================
window.addEventListener("DOMContentLoaded", () => {
  loadTicker(state.ticker);
});

async function loadTicker(tickerSymbol) {
  state.ticker = tickerSymbol.trim().toUpperCase();
  document.getElementById("inp-ticker").value = state.ticker;
  document.getElementById("hdr-ticker-badge").innerText = state.ticker;

  try {
    const res = await fetch(`/api/company?ticker=${encodeURIComponent(state.ticker)}`);
    const json = await res.json();
    if (json.status === "success") {
      state.company = json.data;
      document.getElementById("hdr-company-name").innerText = state.company.name;
      
      // Update beta lever if available
      if (state.company.beta) {
        state.waccParams.beta = parseFloat(state.company.beta.toFixed(2));
        const betaInp = document.getElementById("inp-beta");
        if (betaInp) betaInp.value = state.waccParams.beta;
      }

      await triggerRecalculate();
    } else {
      console.error(json.message);
    }
  } catch (err) {
    console.error("Failed to load company:", err);
  }
}

// =============================================================================
// RECALCULATION ENGINE (COMMUNICATES WITH PYTHON BACKEND)
// =============================================================================
let recalcDebounceTimer = null;
function triggerRecalculate() {
  clearTimeout(recalcDebounceTimer);
  recalcDebounceTimer = setTimeout(executeRecalculate, 120);
}

async function executeRecalculate() {
  // Read inputs from DOM into state
  readDOMIntoState();

  const payload = {
    ticker: state.ticker,
    growth_rates: state.growthRates,
    margins: state.margins,
    notes: state.notes,
    terminal_g: state.terminalG,
    exit_multiple: state.exitMultiple,
    wacc_params: state.waccParams,
    capex_pct: state.reinvestmentParams.capex_pct,
    expansion_capex: state.reinvestmentParams.expansion_capex,
    nwc_pct: state.reinvestmentParams.nwc_pct,
    has_tax_holiday: state.reinvestmentParams.has_tax_holiday,
    comps_params: state.compsParams,
    method_weights: state.methodWeights
  };

  try {
    const res = await fetch("/api/recalculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.status === "success") {
      state.latestRecalcData = data;
      renderUI(data);
    }
  } catch (err) {
    console.error("Recalculation error:", err);
  }
}

function readDOMIntoState() {
  // Terminal G & Exit multiple
  const termGEl = document.getElementById("inp-terminal-g");
  if (termGEl) state.terminalG = parseFloat(termGEl.value) || 1.5;

  const exitMEl = document.getElementById("inp-exit-mult");
  if (exitMEl) state.exitMultiple = parseFloat(exitMEl.value) || 4.5;

  // WACC Levers
  const rfEl = document.getElementById("inp-rf");
  if (rfEl) state.waccParams.rf = parseFloat(rfEl.value) || 6.60;

  const betaEl = document.getElementById("inp-beta");
  if (betaEl) state.waccParams.beta = parseFloat(betaEl.value) || 0.85;

  const erpEl = document.getElementById("inp-erp");
  if (erpEl) state.waccParams.erp = parseFloat(erpEl.value) || 7.20;

  const kdEl = document.getElementById("inp-kd");
  if (kdEl) state.waccParams.kd_pre = parseFloat(kdEl.value) || 5.80;

  const wdEl = document.getElementById("inp-wd");
  if (wdEl) state.waccParams.wd = parseFloat(wdEl.value) || 21.5;

  const taxEl = document.getElementById("inp-tax-rate");
  if (taxEl) state.waccParams.tax_rate = parseFloat(taxEl.value) || 22.0;

  // Reinvestment Levers
  const capexEl = document.getElementById("inp-capex-pct");
  if (capexEl) state.reinvestmentParams.capex_pct = parseFloat(capexEl.value) || 5.5;

  const expCapexEl = document.getElementById("inp-expansion-capex");
  if (expCapexEl) state.reinvestmentParams.expansion_capex = parseFloat(expCapexEl.value) || 0.0;

  const nwcEl = document.getElementById("inp-nwc-pct");
  if (nwcEl) state.reinvestmentParams.nwc_pct = parseFloat(nwcEl.value) || 8.0;

  const taxHolEl = document.getElementById("chk-tax-holiday");
  if (taxHolEl) state.reinvestmentParams.has_tax_holiday = taxHolEl.checked;

  // Comps
  const compStatEl = document.getElementById("sel-comps-stat");
  if (compStatEl) state.compsParams.stat_method = compStatEl.value;

  const filterOutEl = document.getElementById("chk-filter-outliers");
  if (filterOutEl) state.compsParams.filter_outliers = filterOutEl.checked;

  // Method weights & includes
  const chkDcf = document.getElementById("chk-use-dcf");
  if (chkDcf) state.methodWeights.inc_dcf = chkDcf.checked;

  const chkComps = document.getElementById("chk-use-comps");
  if (chkComps) state.methodWeights.inc_comps = chkComps.checked;

  const chkRim = document.getElementById("chk-use-rim");
  if (chkRim) state.methodWeights.inc_rim = chkRim.checked;
}

// =============================================================================
// UI RENDERING
// =============================================================================
function renderUI(data) {
  const pMkt = data.company.current_price;
  const pTarget = data.ensemble.composite_target;
  const pDcf = data.dcf.dcf_price;
  const pComps = data.comps.comps_target_price;
  const pRim = data.rim.rim_target_price;
  const rec = data.recommendation;
  const wacc = data.wacc;

  // 1. Top KPI Ribbon
  document.getElementById("kpi-market-price").innerText = `IDR ${pMkt.toLocaleString()}`;
  document.getElementById("kpi-target-price").innerText = `IDR ${pTarget.toLocaleString()}`;
  
  const upsideEl = document.getElementById("kpi-upside-badge");
  const sign = rec.implied_upside_pct >= 0 ? "+" : "";
  upsideEl.innerText = `${sign}${rec.implied_upside_pct.toFixed(1)}%`;
  upsideEl.className = `font-mono font-bold ${rec.implied_upside_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`;

  document.getElementById("kpi-rec-badge").innerText = rec.badge;
  document.getElementById("kpi-range").innerText = rec.fair_value_range;
  document.getElementById("kpi-wacc").innerText = `${(wacc.wacc * 100).toFixed(2)}%`;
  document.getElementById("disp-computed-wacc").innerText = `WACC: ${(wacc.wacc * 100).toFixed(2)}%`;

  // 2. Tab 1: Pro Forma Table Rendering
  renderProFormaTable(data.pro_forma_schedule);

  // 3. Tab 2: Valuation Workbench
  document.getElementById("bench-dcf-price").innerText = `IDR ${pDcf.toLocaleString()}`;
  document.getElementById("bench-comps-price").innerText = `IDR ${pComps.toLocaleString()}`;
  document.getElementById("bench-rim-price").innerText = `IDR ${pRim.toLocaleString()}`;
  document.getElementById("ff-lbl-market").innerText = `IDR ${pMkt.toLocaleString()}`;
  document.getElementById("ff-lbl-target").innerText = `IDR ${pTarget.toLocaleString()}`;
  document.getElementById("synth-rating-badge").innerText = rec.badge;
  document.getElementById("synth-thesis").innerText = rec.thesis;

  renderFootballField(pMkt, pTarget, pDcf, pComps, pRim, data.scenarios.bear.price, data.scenarios.bull.price);

  // 4. Tab 3: Fan Chart & Scenario Cards
  renderFanChart(data.company.historical, data.scenarios);
  document.getElementById("scen-bear-price").innerText = `IDR ${data.scenarios.bear.price.toLocaleString()}`;
  document.getElementById("scen-base-price").innerText = `IDR ${data.scenarios.base.price.toLocaleString()}`;
  document.getElementById("scen-bull-price").innerText = `IDR ${data.scenarios.bull.price.toLocaleString()}`;

  // 5. Tab 4: Peers Table
  renderPeersTable(data.comps.peers);
  document.getElementById("implied-ev-ebitda").innerText = `IDR ${data.comps.price_ev_ebitda.toLocaleString()}`;
  document.getElementById("implied-pe").innerText = `IDR ${data.comps.price_pe.toLocaleString()}`;
  document.getElementById("implied-pb").innerText = `IDR ${data.comps.price_pb.toLocaleString()}`;

  // 6. Tab 5: Calculation Inspector
  renderInspector(data.audit_trail);

  // 7. Tab 6: 2D Sensitivity Grid
  renderSensitivityTable(data.sensitivity);

  // Guardrail check badge
  updateTerminalGBadge(state.terminalG, wacc.wacc);
}

// =============================================================================
// SUB-COMPONENT RENDERERS
// =============================================================================

function renderProFormaTable(schedule) {
  const tbody = document.getElementById("tbody-proforma");
  tbody.innerHTML = "";

  // 1. Audited 2025 actual row
  const histRev = state.company ? state.company.historical.revenue.slice(-1)[0] : 316.4;
  const histEbit = state.company ? state.company.historical.ebit.slice(-1)[0] : 44.3;
  const histFcff = state.company ? state.company.historical.fcff.slice(-1)[0] : 22.5;

  const baseRow = document.createElement("tr");
  baseRow.className = "bg-slate-950/60 text-slate-400 font-sans";
  baseRow.innerHTML = `
    <td class="py-2.5 px-3 font-bold text-slate-300">2025 (Audited Baseline)</td>
    <td class="py-2.5 px-3 font-mono">--</td>
    <td class="py-2.5 px-3 font-mono">14.0%</td>
    <td class="py-2.5 px-3 font-mono">${histRev.toFixed(1)}</td>
    <td class="py-2.5 px-3 font-mono">${histEbit.toFixed(1)}</td>
    <td class="py-2.5 px-3 font-mono text-white font-bold">${histFcff.toFixed(1)}</td>
    <td class="py-2.5 px-3 italic text-slate-500">Audited Historical Actuals (IDX Annual Report)</td>
  `;
  tbody.appendChild(baseRow);

  // 2. 10 Explicit Pro Forma Rows
  schedule.forEach((row, idx) => {
    const t = idx + 1;
    const isFade = t >= 6;
    const tr = document.createElement("tr");
    tr.className = `hover:bg-slate-800/40 transition ${isFade ? "bg-purple-950/10" : ""}`;

    tr.innerHTML = `
      <td class="py-2.5 px-3 font-bold ${isFade ? "text-purple-300" : "text-cyan-400"} font-sans">
        ${row.period}
      </td>
      <td class="py-2.5 px-3">
        <input type="number" step="0.1" value="${row.growth_pct.toFixed(1)}" 
          oninput="updateProFormaCell(${idx}, 'growth', this.value)"
          class="w-16 bg-[#080d1a] border ${isFade ? "border-purple-500/40 text-purple-300" : "border-cyan-500/40 text-cyan-300"} rounded px-2 py-0.5 font-mono text-right focus:outline-none"> %
      </td>
      <td class="py-2.5 px-3">
        <input type="number" step="0.1" value="${row.margin_pct.toFixed(1)}" 
          oninput="updateProFormaCell(${idx}, 'margin', this.value)"
          class="w-16 bg-[#080d1a] border border-emerald-500/40 text-emerald-300 rounded px-2 py-0.5 font-mono text-right focus:outline-none"> %
      </td>
      <td class="py-2.5 px-3 font-bold text-white font-mono">${row.revenue.toFixed(1)}</td>
      <td class="py-2.5 px-3 font-mono text-slate-300">${row.ebit.toFixed(1)}</td>
      <td class="py-2.5 px-3 font-bold text-cyan-300 font-mono">${row.fcff.toFixed(1)}</td>
      <td class="py-2.5 px-3">
        <input type="text" value="${row.thesis_note}" 
          oninput="updateProFormaCell(${idx}, 'note', this.value)"
          class="w-full bg-transparent border-b border-slate-700/60 text-xs font-sans text-slate-300 focus:outline-none focus:border-cyan-400">
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateProFormaCell(idx, field, val) {
  if (field === "growth") state.growthRates[idx] = parseFloat(val) || 0.0;
  else if (field === "margin") state.margins[idx] = parseFloat(val) || 0.0;
  else if (field === "note") state.notes[idx] = val;
  triggerRecalculate();
}

function applyAutoFadeHelper() {
  const g5 = state.growthRates[4] || 4.5;
  const targetG = state.terminalG || 1.5;
  const step = (g5 - targetG) / 5.0;

  for (let t = 5; t < 10; t++) {
    state.growthRates[t] = parseFloat((g5 - step * (t - 4)).toFixed(1));
  }
  triggerRecalculate();
}

function resetProFormaBaseline() {
  state.growthRates = [6.0, 3.0, 2.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5];
  state.margins = [14.0, 13.5, 13.5, 14.0, 14.0, 13.9, 13.8, 13.8, 13.8, 13.8];
  triggerRecalculate();
}

// =============================================================================
// FOOTBALL FIELD RENDERER
// =============================================================================
function renderFootballField(pMkt, pTarget, pDcf, pComps, pRim, pBear, pBull) {
  const container = document.getElementById("football-field-bars");
  container.innerHTML = "";

  const minScale = Math.min(pMkt, pBear, pDcf * 0.85) * 0.90;
  const maxScale = Math.max(pMkt, pBull, pDcf * 1.15) * 1.10;
  const range = maxScale - minScale;

  function toPct(val) {
    return Math.max(2, Math.min(98, ((val - minScale) / range) * 100));
  }

  const items = [
    { title: "1. DCF (10Y Pro Forma FCFF)", low: pDcf * 0.85, high: pDcf * 1.15, color: "from-cyan-600/40 to-cyan-500/60", border: "border-cyan-400" },
    { title: "2. Relative Comps (EV/EBITDA)", low: pComps * 0.88, high: pComps * 1.12, color: "from-purple-600/40 to-purple-500/60", border: "border-purple-400" },
    { title: "3. Residual Income Model (RIM)", low: pRim * 0.90, high: pRim * 1.10, color: "from-emerald-600/40 to-emerald-500/60", border: "border-emerald-400" },
    { title: "4. Multi-Scenario Spread (Bear/Bull)", low: pBear, high: pBull, color: "from-blue-600/40 to-indigo-500/60", border: "border-blue-400" }
  ];

  const mktPct = toPct(pMkt);
  const tgtPct = toPct(pTarget);

  items.forEach(item => {
    const leftPct = toPct(item.low);
    const rightPct = toPct(item.high);
    const widthPct = Math.max(4, rightPct - leftPct);

    const barEl = document.createElement("div");
    barEl.className = "space-y-1";
    barEl.innerHTML = `
      <div class="flex justify-between text-xs font-medium text-slate-300">
        <span>${item.title}</span>
        <span class="font-mono text-slate-400">IDR ${Math.round(item.low).toLocaleString()} — ${Math.round(item.high).toLocaleString()}</span>
      </div>
      <div class="h-6 bg-slate-900 rounded-lg relative overflow-hidden border border-slate-800">
        <!-- Range bar -->
        <div class="absolute h-full bg-gradient-to-r ${item.color} border-x-2 ${item.border}" 
          style="left: ${leftPct}%; width: ${widthPct}%;"></div>
        <!-- Market line -->
        <div class="absolute h-full w-[2px] bg-rose-500 z-10" style="left: ${mktPct}%;"></div>
        <!-- Target line -->
        <div class="absolute h-full w-[2px] bg-cyan-400 z-10" style="left: ${tgtPct}%;"></div>
      </div>
    `;
    container.appendChild(barEl);
  });
}

// =============================================================================
// SVG FAN CHART RENDERER (BÉZIER CURVES)
// =============================================================================
function renderFanChart(historical, scenarios) {
  const svg = document.getElementById("svg-fan-chart");
  svg.innerHTML = "";

  const histYears = historical.years;
  const histRev = historical.revenue;
  const baseSched = scenarios.base.schedule;
  const bearSched = scenarios.bear.schedule;
  const bullSched = scenarios.bull.schedule;

  const allYears = [...histYears, ...baseSched.map(r => r.year)];
  const allRevs = [
    ...histRev,
    ...bearSched.map(r => r.revenue),
    ...bullSched.map(r => r.revenue)
  ];

  const minRev = Math.min(...allRevs) * 0.85;
  const maxRev = Math.max(...allRevs) * 1.10;

  const w = 900, h = 300;
  const padL = 60, padR = 40, padT = 30, padB = 40;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  function getX(yearIndex) {
    return padL + (yearIndex / (allYears.length - 1)) * plotW;
  }
  function getY(rev) {
    return padT + plotH - ((rev - minRev) / (maxRev - minRev)) * plotH;
  }

  // Draw Grid Lines
  for (let i = 0; i <= 4; i++) {
    const val = minRev + (i / 4) * (maxRev - minRev);
    const yPos = getY(val);
    svg.innerHTML += `
      <line x1="${padL}" y1="${yPos}" x2="${w - padR}" y2="${yPos}" stroke="#1e293b" stroke-width="1" />
      <text x="${padL - 10}" y="${yPos + 4}" fill="#64748b" font-size="10" font-family="JetBrains Mono" text-anchor="end">${val.toFixed(0)}T</text>
    `;
  }

  // Historical coordinates
  let histPoints = histYears.map((yr, idx) => ({ x: getX(idx), y: getY(histRev[idx]) }));
  let histPath = histPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Projections
  const histLen = histYears.length;
  let bullPoints = [histPoints[histLen - 1], ...bullSched.map((r, i) => ({ x: getX(histLen + i), y: getY(r.revenue) }))];
  let bearPoints = [histPoints[histLen - 1], ...bearSched.map((r, i) => ({ x: getX(histLen + i), y: getY(r.revenue) }))];
  let basePoints = [histPoints[histLen - 1], ...baseSched.map((r, i) => ({ x: getX(histLen + i), y: getY(r.revenue) }))];

  let bullPath = bullPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  let bearPath = bearPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  let basePath = basePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Shaded Fan Area (between Bear and Bull)
  let areaPath = `${bullPath} ` + bearPoints.slice().reverse().map(p => `L ${p.x} ${p.y}`).join(" ") + " Z";

  svg.innerHTML += `
    <!-- Shaded Envelope -->
    <path d="${areaPath}" fill="rgba(56, 189, 248, 0.08)" />

    <!-- Trajectory Lines -->
    <path d="${bearPath}" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,4" />
    <path d="${bullPath}" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4,4" />
    <path d="${basePath}" fill="none" stroke="#38bdf8" stroke-width="3" />
    <path d="${histPath}" fill="none" stroke="#e2e8f0" stroke-width="3" />

    <!-- Phase Divider (Year 5) -->
    <line x1="${getX(histLen + 4)}" y1="${padT}" x2="${getX(histLen + 4)}" y2="${h - padB}" stroke="#475569" stroke-dasharray="3,3" />
    <text x="${getX(histLen + 4)}" y="${padT - 10}" fill="#94a3b8" font-size="10" text-anchor="middle">Explicit 5Y ➔ Fade 5Y</text>
  `;

  // Draw Circles for historical points
  histPoints.forEach(p => {
    svg.innerHTML += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffffff" stroke="#0ea5e9" stroke-width="2" />`;
  });
}

// =============================================================================
// RELATIVE PEERS & CALCULATION INSPECTOR
// =============================================================================
function renderPeersTable(peers) {
  const tbody = document.getElementById("tbody-peers");
  tbody.innerHTML = "";
  peers.forEach(p => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/40 transition";
    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-200 font-sans">${p.name}</td>
      <td class="py-3 px-4 text-cyan-400">${p.ticker}</td>
      <td class="py-3 px-4 text-emerald-400 font-bold">${p.ev_ebitda.toFixed(1)}x</td>
      <td class="py-3 px-4 text-purple-400 font-bold">${p.pe.toFixed(1)}x</td>
      <td class="py-3 px-4 text-blue-400">${p.pb.toFixed(2)}x</td>
      <td class="py-3 px-4 text-slate-300">${p.roe.toFixed(1)}%</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderInspector(auditTrail) {
  const container = document.getElementById("inspector-cards");
  container.innerHTML = "";

  auditTrail.forEach((card, idx) => {
    const cardEl = document.createElement("div");
    cardEl.className = "p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5";
    
    let subProofsHTML = card.component_proofs.map(sp => `<li class="font-mono text-[11px] text-slate-400">${sp}</li>`).join("");

    cardEl.innerHTML = `
      <div class="font-bold text-sm text-cyan-300 font-sans">${card.title}</div>
      <div class="text-xs text-slate-400 font-sans">${card.theory}</div>
      <div class="p-3 rounded-lg bg-[#070b14] border border-slate-800/80 my-2 overflow-x-auto text-center" id="katex-${idx}"></div>
      <div class="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 font-mono text-xs text-cyan-200">
        <strong>Substituted Balance Sheet Values:</strong><br>${card.substituted_proof}
      </div>
      <ul class="list-disc pl-4 space-y-1">${subProofsHTML}</ul>
    `;
    container.appendChild(cardEl);

    // Render KaTeX formula
    try {
      katex.render(card.latex_formula, document.getElementById(`katex-${idx}`), { throwOnError: false });
    } catch (e) {
      document.getElementById(`katex-${idx}`).innerText = card.latex_formula;
    }
  });
}

function renderSensitivityTable(sensitivity) {
  const table = document.getElementById("table-sensitivity");
  table.innerHTML = "";

  let thead = `<thead class="bg-slate-900/90 text-slate-400 font-sans border-b border-slate-800"><tr><th class="py-2.5 px-3">g \\ WACC</th>`;
  sensitivity.columns.forEach(col => {
    thead += `<th class="py-2.5 px-3 text-cyan-300">${col}</th>`;
  });
  thead += `</tr></thead>`;

  let tbody = `<tbody class="divide-y divide-slate-800/80">`;
  sensitivity.index.forEach((rowName, rIdx) => {
    tbody += `<tr><td class="py-2.5 px-3 font-bold text-slate-300 font-sans">${rowName}</td>`;
    sensitivity.data[rIdx].forEach(cellVal => {
      const isNa = cellVal.includes("N/A");
      tbody += `<td class="py-2.5 px-3 ${isNa ? "text-rose-400 font-sans text-[10px]" : "text-white font-bold"}">${cellVal}</td>`;
    });
    tbody += `</tr>`;
  });
  tbody += `</tbody>`;

  table.innerHTML = thead + tbody;
}

// =============================================================================
// SLIDERS & INTERACTIVE HELPERS
// =============================================================================
function adjustMethodSlider(changed) {
  let wDcf = parseInt(document.getElementById("w-dcf").value) || 0;
  let wComps = parseInt(document.getElementById("w-comps").value) || 0;
  let wRim = parseInt(document.getElementById("w-rim").value) || 0;

  let sum = wDcf + wComps + wRim;
  if (sum === 0) sum = 1;

  document.getElementById("lbl-w-dcf").innerText = `${Math.round((wDcf / sum) * 100)}%`;
  document.getElementById("lbl-w-comps").innerText = `${Math.round((wComps / sum) * 100)}%`;
  document.getElementById("lbl-w-rim").innerText = `${Math.round((wRim / sum) * 100)}%`;

  state.methodWeights.w_dcf = wDcf / sum;
  state.methodWeights.w_comps = wComps / sum;
  state.methodWeights.w_rim = wRim / sum;

  triggerRecalculate();
}

function updateTerminalGInput(val) {
  let g = parseFloat(val) || 1.5;
  document.getElementById("inp-terminal-g").value = g.toFixed(1);
  document.getElementById("slider-terminal-g").value = g.toFixed(1);
  state.terminalG = g;
  triggerRecalculate();
}

function updateTerminalGBadge(g, wacc) {
  const badge = document.getElementById("badge-terminal-g");
  const sanityStatus = document.getElementById("kpi-sanity-status");
  if (!badge) return;

  if (g >= wacc * 100) {
    badge.className = "text-rose-400 font-semibold font-sans";
    badge.innerText = `❌ Fatal: g ≥ WACC (${g}% ≥ ${(wacc * 100).toFixed(2)}%)`;
    if (sanityStatus) {
      sanityStatus.className = "text-[10px] text-rose-400 font-mono";
      sanityStatus.innerText = "❌ Fatal Error: g ≥ WACC";
    }
  } else if (g > 4.0) {
    badge.className = "text-amber-400 font-semibold font-sans";
    badge.innerText = "⚠️ High: g > GDP Cap (4.0%)";
  } else {
    badge.className = "text-emerald-400 font-semibold font-sans";
    badge.innerText = `✓ Safe (${g.toFixed(1)}% < GDP 4.0%)`;
    if (sanityStatus) {
      sanityStatus.className = "text-[10px] text-emerald-400 font-mono";
      sanityStatus.innerText = "✓ Boundary Guardrails Safe";
    }
  }
}

function toggleAdvancedDrawer() {
  const drawer = document.getElementById("advancedDrawer");
  const label = document.getElementById("advToggleLabel");
  if (drawer.classList.contains("hidden")) {
    drawer.classList.remove("hidden");
    label.innerText = "Hide Advanced Levers";
  } else {
    drawer.classList.add("hidden");
    label.innerText = "Show Advanced Levers (CapEx, Tax, WACC)";
  }
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("tab-active"));

  const targetEl = document.getElementById(tabId);
  const targetBtn = document.getElementById("btn-" + tabId);
  if (targetEl) targetEl.classList.remove("hidden");
  if (targetBtn) targetBtn.classList.add("tab-active");
}

function toggleWeightMode(val) {
  const box = document.getElementById("rule-justification-box");
  if (val === "rule") {
    box.innerText = "Suggested for Industrials / Conglomerates: 60% DCF-FCFF, 25% Relative Comps, 15% Residual Income.";
    document.getElementById("w-dcf").value = 60;
    document.getElementById("w-comps").value = 25;
    document.getElementById("w-rim").value = 15;
    adjustMethodSlider("dcf");
  } else {
    box.innerText = "Manual Discretion Active: You can set custom weights to stress-test relative vs intrinsic emphasis.";
  }
}

function resetAdvancedToAcademicDefaults() {
  document.getElementById("inp-terminal-g").value = "1.5";
  document.getElementById("slider-terminal-g").value = "1.5";
  document.getElementById("inp-rf").value = "6.60";
  document.getElementById("inp-beta").value = "0.85";
  document.getElementById("inp-erp").value = "7.20";
  document.getElementById("inp-kd").value = "5.80";
  document.getElementById("inp-wd").value = "21.5";
  document.getElementById("inp-tax-rate").value = "22.0";
  document.getElementById("inp-capex-pct").value = "5.5";
  document.getElementById("inp-expansion-capex").value = "0.0";
  document.getElementById("inp-nwc-pct").value = "8.0";
  document.getElementById("chk-tax-holiday").checked = false;
  triggerRecalculate();
}

async function triggerExcelDownload() {
  readDOMIntoState();
  const payload = {
    ticker: state.ticker,
    growth_rates: state.growthRates,
    margins: state.margins,
    notes: state.notes,
    terminal_g: state.terminalG,
    wacc_params: state.waccParams,
    capex_pct: state.reinvestmentParams.capex_pct,
    nwc_pct: state.reinvestmentParams.nwc_pct,
    has_tax_holiday: state.reinvestmentParams.has_tax_holiday
  };

  try {
    const res = await fetch("/api/export-excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.ticker}_Valuation_Model_MM6026.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error("Excel download failed:", err);
  }
}
