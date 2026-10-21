# 📘 VALUEX Terminal: User Guide & Valuation Manual
### MM6026 Digital Business Valuation — Institutional Implementation Tier
**Primary Benchmark:** `PWON.JK` (PT Pakuwon Jati Tbk) | **Universe:** Indonesian Property & Equities  
**Valuation Date:** October 2026 | **Interface:** VALUEX Terminal (React 18 / Starlette)

---

## 📑 Table of Contents
1. [System Setup & Launch](#1-system-setup--launch)
2. [Terminal Layout & Navigation](#2-terminal-layout--navigation)
3. [Universal Ticker Search & Ingestion](#3-universal-ticker-search--ingestion)
4. [The 8 Workflow Views](#4-the-8-workflow-views)
   - [⌘1 Executive Dashboard](#1-executive-dashboard)
   - [⌘2 Company Screener](#2-company-screener)
   - [⌘3 Valuation Workspace (10 Institutional Models & Tools)](#3-valuation-workspace)
   - [⌘4 10-Year 3-Statement Model](#4-10-year-3-statement-model)
   - [⌘5 Model Assumptions & Weight Composition Donut](#5-model-assumptions--weight-composition-donut)
   - [⌘6 Buy / Sell Decision Workspace & Order Blotter](#6-buy--sell-decision-workspace--order-blotter)
   - [⌘7 Watchlist & Comps Matrix](#7-watchlist--comps-matrix)
   - [⌘8 Research Tear Sheet & Memo](#8-research-tear-sheet--memo)
5. [Model Weight Composition & Donut Visualization](#5-model-weight-composition--donut-visualization)
6. [Institutional Valuation Engines Reference](#6-institutional-valuation-engines-reference)
   - [A. Revalued Net Asset Value (RNAV) for Property Developers](#a-revalued-net-asset-value-rnav-for-property-developers)
   - [B. 10,000-Run Vectorized Monte Carlo Simulation & VaR](#b-10000-run-vectorized-monte-carlo-simulation--var)
   - [C. Economic Value Added (EVA®) & Market Value Added (MVA)](#c-economic-value-added-eva--market-value-added-mva)
   - [D. Tornado Sensitivity Analysis](#d-tornado-sensitivity-analysis)
   - [E. 5-Stage DuPont ROE Decomposition](#e-5-stage-dupont-roe-decomposition)
7. [10-Year Forecasts, Auto-Fade & Convergence Warnings](#7-10-year-forecasts-auto-fade--convergence-warnings)
8. [Integrated 3-Statement Zero-Balance Check](#8-integrated-3-statement-zero-balance-check)
9. [Formula-Active 6-Sheet Excel Exporter](#9-formula-active-6-sheet-excel-exporter)
10. [Auditing & LaTeX Inspector Drawer](#10-auditing--latex-inspector-drawer)

---

## 1. System Setup & Launch

### Prerequisites
- Python 3.10+ (tested on Python 3.14.7).
- No Node.js or npm required — the application serves React 18 production UMD, Tailwind CSS, Lucide, and KaTeX via CDN.

### 1-Click Launch (Windows)
Double-click [`run_app.bat`](file:///c:/Users/Public/Documents/Project%20BA/run_app.bat) in the project root directory. The script will:
1. Detect or create the local Python virtual environment (`.venv`).
2. Launch the Starlette asynchronous valuation backend on port 8000.
3. Automatically open your default browser to `http://localhost:8000`.

### Command-Line Launch
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Launch the VALUEX Terminal
python server.py
```

### Automated Test Verification
Run pytest to verify all 31 corporate finance tests across 10 test suites:
```powershell
.\.venv\Scripts\pytest.exe -v
```

---

## 2. Terminal Layout & Navigation

The VALUEX Terminal organizes your equity research workflow into a clear top-down visual hierarchy:

```
┌────────────────────────────────────────────────────────────────────────┐
│  ROW 1: LIVE MARKET TAPE (PWON, BSDE, CTRA, SMRA, ASII, Macro Benchmarks)  │
│  ROW 2: INSTITUTIONAL REAL ESTATE RESEARCH WIRE (Rotating Bulletins)   │
├────────────────────────────────────────────────────────────────────────┤
│  HEADER: VALUEX Logo | Active Security Pill | Universal Ticker Search | │
│          Quick Pills (PWON, BSDE...) | Inspector 🔍 | Excel .xlsx Export │
├───────────┬────────────────────────────────────────────────────────────┤
│ SIDEBAR   │ MAIN WORKSPACE VIEW (Active Tab)                           │
│ ⌘1–⌘8 Nav │ (Dashboard, Screener, DCF, 3-Statement, Assumptions, etc.)  │
└───────────┴────────────────────────────────────────────────────────────┘
```

- **Top Live Tape**: Features real-time price ticks ($\pm 0.65\%$) with flashing indicators, macro yield curves, and a `[● LIVE FEED] / [❚❚ PAUSED]` toggle.
- **Sidebar**: Quick keyboard shortcuts (`⌘1` through `⌘8` or numeric key clicks) allow seamless switching across research phases.
- **Inspector Drawer**: Click **"Inspector 🔍"** in the top header from any tab to slide out KaTeX LaTeX formula proofs with substituted numbers.

---

## 3. Universal Ticker Search & Ingestion

While the platform is calibrated to **`PWON.JK`** (PT Pakuwon Jati Tbk) as its primary benchmark, financial analysts can analyze **any** stock:

1. **Header Bar Search**:
   - Locate the search box in the top header (`Search Any Ticker (e.g. BBCA, TLKM)...`).
   - Type any ticker symbol (e.g., `BBCA`, `TLKM`, `UNVR`, `BMRI`, `ICBP`) and press **Enter** or click **`Load`**.
   - If no exchange suffix is typed, `.JK` is automatically appended.
2. **Quick Benchmark Pills**:
   - Click any preloaded benchmark pill (`PWON`, `BSDE`, `CTRA`, `SMRA`, `ASII`) to instantly switch active focus.
3. **What Happens on Load**:
   - The backend `/api/company?ticker=SYMBOL` endpoint pulls live financial statements, market capitalization, shares outstanding, and beta via `yfinance`.
   - The frontend normalizes the data into billions IDR, creates a 10-year baseline assumption profile, calculates initial DCF/Comps/RIM/DDM/RNAV/Monte Carlo valuations, and navigates straight into the Valuation Workspace.

---

## 4. The 8 Workflow Views

### `⌘1` Executive Dashboard
- **Coverage Summary**: Aggregated market cap, average universe upside, and recommendation signal distribution.
- **Universe Valuation Matrix**: High-level table displaying reference prices, DCF targets, DDM targets, comps, composite fair values, and spreads.
- **Implied Dislocation Chart**: Horizontal visual ranking of equity mispricings relative to the +15% BUY hurdle.

### `⌘2` Company Screener
- **Universe Discovery**: Filter securities by recommendation signal (`BUY`, `HOLD`, `SELL`) or sort by upside and market cap.
- **Universal Security Screener Card**: Enter any IDX ticker to pull live financial data directly into the screener grid.
- **Company Cards**: View sector, industry, reference price, upside %, and toggle watchlist bookmarks.

### `⌘3` Valuation Workspace
- **12M Price vs Intrinsic Area Chart**: Visual comparison of historical trading price vs composite fair value target.
- **Header View Switcher**: Toggle between the classic **"Football Field"** view and the **"Weight Donut"** view directly from the valuation header.
- **10 Methodology Sub-Tabs**:
  1. **Multi-Stage DCF**: 10-year FCFF schedule (2026E–2035E) + Enterprise-to-Equity bridge.
  2. **Property Comps**: EV/EBITDA, P/E, P/B peer matrix with subject comparisons.
  3. **Residual Income (RIM)**: Book value equity + PV of economic profits schedule.
  4. **Dividend Discount (DDM)**: 10-year explicit dividend schedule ($DPS_t$) + Gordon Growth perpetual terminal value.
  5. **RNAV (Revalued NAV)**: GAV breakdown, NOI direct capitalization, land bank mark-to-market, and RNAV per share.
  6. **Monte Carlo DCF**: 10,000-run stochastic simulation, VaR 95%, P10/P50/P90 distributions, and SVG frequency histogram.
  7. **EVA® & MVA**: NOPAT, Invested Capital, ROIC vs WACC spread, 10-year EVA schedule, and Market Value Added.
  8. **5x5 WACC Sensitivity**: Matrix testing target price across WACC (9.42%–11.42%) vs $g$ (1.0%–2.0%).
  9. **Tornado & DuPont**: DCF two-sided sensitivity swing ranking and 5-stage DuPont ROE breakdown.
  10. **KaTeX Mathematical Proofs**: Step-by-step LaTeX formula derivations with substituted values.

### `⌘4` 10-Year 3-Statement Model
- **Statement Switcher**: Toggle between Balance Sheet, Income Statement, and Cash Flow Statement across 2026E–2035E.
- **Zero-Balance Reconciliation**: Prominent banner confirming $\text{Assets} \equiv \text{Liabilities} + \text{Equity}$ ($\text{Difference} \equiv \text{IDR } 0.00$).
- **Export**: One-click download of the 6-sheet articulated financial model workbook (`.xlsx`).

### `⌘5` Model Assumptions & Weight Composition Donut
- **10-Year Growth Curve**:
  - Phase 1: High Growth (Y1–Y5 sliders/inputs)
  - Phase 2: Fade Phase (Y6–Y10 sliders/inputs)
  - **⚡ Auto-Fade Helper (Y6–Y10)** button
  - **Macro Convergence Warning** banner
- **Operating Margins & Reinvestment**: EBITDA margin, statutory tax rate (22%), CapEx % of revenue, D&A %, and NWC intensity.
- **Section 4: Model Weight Composition & Real-Time Donut**:
  - Individual sliders for DCF, Comps, RIM, and DDM weights with **full `0%` support**.
  - Live SVG Donut chart displaying percentage allocations in real time.
  - Quick preset buttons: `50/50 DCF & RIM`, `100% DCF`, `4-Way Triangulation (40/20/20/20)`, `Equal (25% each)`, and `Normalize to 100%`.

### `⌘6` Buy / Sell Decision Workspace & Order Blotter
- **Investment Committee Memo**: Thesis pillars, catalyst checklist, and downside risk register.
- **Target Parameters**: Target entry price, target exit price, margin of safety %, and investment horizon.
- **Simulated Order Ticket (EMS)**: Standard **IDX 100-share lot** quantity input, limit price, and gross notional calculation.
- **Staged Order Blotter**: Logged session orders with time, side, lots, and execution status.

### `⌘7` Watchlist & Comps Matrix
- Manage bookmarked equities and compare multiple companies side-by-side across fundamental and valuation ratios.

### `⌘8` Research Tear Sheet & Memo
- Formal equity research tear sheet formatted for investment banking committee distribution.
- **"Print / Save Research PDF"**: Formats cleanly for `@media print` without navigation bars.
- **"Download Excel Model (.xlsx)"**: Downloads the live formula-active spreadsheet.

---

## 5. Model Weight Composition & Donut Visualization

In equity research, analysts frequently want to test pure models (e.g. 100% DCF) or specific blends (e.g. 50% DCF + 50% RIM) while de-weighting relative multiples:

### Zero-Weight Capability
- In prior versions, setting a slider or numeric input to `0` would inadvertently snap back to a non-zero default.
- The parameter engine now uses strict nullish coalescing (`?? 0`), allowing any methodology weight to be set to **`0%`**.
- When a method is set to `0%`, it is gracefully excluded from the composite target price calculation and dynamic KaTeX proofs.

### Interactive Donut Chart & Quick Presets
Located in **`⌘5 Model Assumptions` (Section 4)** and toggled in **`⌘3 Valuation Workspace`**:
- **SVG Donut Segments**: Dynamically rendered with hover tooltips and matching color indicators (DCF = Blue, Comps = Emerald, RIM = Purple, DDM = Amber).
- **One-Click Presets**:
  - **50/50 DCF & RIM**: Sets DCF = 50%, RIM = 50%, Comps = 0%, DDM = 0%. Renders exactly half blue and half purple.
  - **100% DCF**: Sets DCF = 100%, others = 0%. Evaluates intrinsic DCF directly.
  - **4-Way Triangulation**: Sets 40% DCF, 20% Comps, 20% RIM, 20% DDM.
  - **Equal**: Sets all four methods to 25% each.
  - **Normalize to 100%**: Automatically rescales any custom distribution proportionally so weights sum to exactly 100%.

---

## 6. Institutional Valuation Engines Reference

### A. Revalued Net Asset Value (RNAV) for Property Developers
For property holding companies, historical cost book value significantly understates true asset worth. The RNAV engine computes:
1. **Gross Asset Value (GAV)**:
   - **Direct Capitalization of Retail Malls & Offices**:
     $$\text{Capitalized Value} = \frac{\text{Net Operating Income (NOI)}}{\text{Cap Rate}}$$
     Default cap rate: $8.5\%$ (commercial property standard in Jakarta/Surabaya).
   - **Land Bank Mark-to-Market (MTM)**: Revalues raw land reserves at market values ($IDR 4.5M/m^2$ market vs $IDR 1.2M/m^2$ book value).
   - **Unbilled Pre-sales Handover**: Present value of unbilled property sales discounted at WACC across the 3-year construction cycle.
2. **Net Asset Value (NAV)**:
   $$\text{NAV} = \text{GAV} + \text{Cash} - \text{Total Debt} - \text{Minority Interest}$$
3. **Target Price per Share**:
   $$\text{Target Price}_{\text{RNAV}} = \frac{\text{NAV} \times (1 - \text{Discount})}{\text{Shares Outstanding}}$$
   Default conglomerate holding discount: $25.0\%$.

### B. 10,000-Run Vectorized Monte Carlo Simulation & VaR
Static point estimates fail to convey macroeconomic uncertainty. The Monte Carlo engine executes 10,000 correlated simulations:
- **Input Distributions**:
  - Revenue Growth: $\mathcal{N}(\mu_g, 1.5\%)$
  - EBITDA Margin: $\mathcal{N}(\mu_{\text{margin}}, 2.0\%)$
  - WACC: $\mathcal{N}(\mu_{\text{wacc}}, 0.5\%)$
  - Terminal Growth $g$: $\mathcal{N}(\mu_g, 0.3\%)$
- **Simulated Metrics**:
  - **P10 (Bear Downside)**: 10th percentile intrinsic value.
  - **P50 (Median)**: 50th percentile intrinsic value.
  - **P90 (Bull Upside)**: 90th percentile intrinsic value.
  - **Value at Risk (VaR 95%)**: Downside loss at 95% confidence relative to current price.
  - **Probability of Undervaluation**: Percentage of simulation runs where Intrinsic Value exceeds Current Market Price.
  - **25-Bin Frequency Histogram**: Real-time SVG distribution visualization with reference mean and market price lines.

### C. Economic Value Added (EVA®) & Market Value Added (MVA)
Measures true economic profit after deducting the opportunity cost of all invested capital:
$$\text{NOPAT}_t = \text{EBIT}_t \times (1 - t)$$
$$\text{Invested Capital}_{t-1} = \text{Total Debt}_{t-1} + \text{Total Equity}_{t-1} - \text{Excess Cash}_{t-1}$$
$$\text{ROIC}_t = \frac{\text{NOPAT}_t}{\text{Invested Capital}_{t-1}}$$
$$\text{EVA}_t = (\text{ROIC}_t - \text{WACC}) \times \text{Invested Capital}_{t-1}$$
$$\text{MVA} = \sum_{t=1}^{10} \frac{\text{EVA}_t}{(1 + \text{WACC})^t} + \frac{\text{Terminal EVA}}{(1 + \text{WACC})^{10}}$$
When $\text{ROIC} > \text{WACC}$, the business creates economic value; when $\text{ROIC} < \text{WACC}$, growth destroys shareholder value.

### D. Tornado Sensitivity Analysis
Ranks valuation input drivers by their two-sided impact on Target Price:
- Tests $\pm 100 \text{ bps}$ sensitivity across: WACC, Terminal Growth $g$, EBITDA Margin, Revenue Growth Y1–Y5, and Exit Multiple.
- Visualized as horizontal bars sorted from greatest valuation swing to least, identifying the single most sensitive risk variable.

### E. 5-Stage DuPont ROE Decomposition
Deconstructs Return on Equity into five distinct operational and financial levers:
$$\text{ROE} = \underbrace{\frac{\text{Net Income}}{\text{EBT}}}_{\text{Tax Burden}} \times \underbrace{\frac{\text{EBT}}{\text{EBIT}}}_{\text{Interest Burden}} \times \underbrace{\frac{\text{EBIT}}{\text{Revenue}}}_{\text{Operating Margin}} \times \underbrace{\frac{\text{Revenue}}{\text{Assets}}}_{\text{Asset Turnover}} \times \underbrace{\frac{\text{Assets}}{\text{Equity}}}_{\text{Financial Leverage}}$$
The terminal displays the subject company's five ratios alongside Indonesian property sector peer benchmarks, highlighting whether high ROE stems from superior operating profitability or excessive financial leverage.

---

## 7. 10-Year Forecasts, Auto-Fade & Convergence Warnings

### The 10-Year Explicit Horizon
Academic corporate finance (McKinsey, Damodaran) dictates that firms require an explicit forecast period followed by a transition period to converge toward macroeconomic steady-state:
- **Phase 1 (Years 1 to 5: 2026E–2030E)**: Reflects company-specific operational expansion (e.g. retail mall leasing, pre-sales handovers).
- **Phase 2 (Years 6 to 10: 2031E–2035E)**: Transition phase where abnormal growth fades toward long-term macroeconomic equilibrium.

### The Auto-Fade Helper
Clicking **`⚡ Auto-Fade (Y6–Y10)`** in `⌘5 Model Assumptions` applies linear interpolation from Year 5 down to terminal growth ($g = 1.5\%$):
$$\Delta g = \frac{g_5 - g_{\text{terminal}}}{5}, \quad g_t = g_5 - \Delta g \times (t - 5) \quad \text{for } t \in [6, 10]$$

### Amateur Financier / Convergence Warning
If an analyst sets Year 10 growth $\ge 4.0\%$ or $\ge \text{WACC}$:
> ⚠️ **Macro Convergence Warning**: Year 10 growth is set to **X%**, exceeding the sustainable Indonesian nominal GDP ceiling (4.0%–5.0%). In corporate finance theory, steady-state firms cannot permanently outgrow the broader macroeconomy into perpetuity.

The analyst can click the embedded action button to restore macroeconomic equilibrium in 1 click.

---

## 8. Integrated 3-Statement Zero-Balance Check

In `⌘4 3-Statement Model`, the balance sheet articulation verifies the fundamental identity:
$$\text{Total Assets}_t - (\text{Total Liabilities}_t + \text{Total Equity}_t) = 0.00 \quad \forall t \in [1, 10]$$

Key Balance Sheet drivers:
- **Cash**: Cash from prior period + Net Change in Cash from Cash Flow Statement.
- **Accounts Receivable**: Driven by Days Sales Outstanding ($\text{DSO} = 15 \text{ days}$).
- **Inventory**: Driven by Days Inventory Outstanding ($\text{DIO} = 521 \text{ days}$ for residential/commercial property developments).
- **Accounts Payable**: Driven by Days Payable Outstanding ($\text{DPO} = 72 \text{ days}$).
- **Net PP&E**: $\text{PP\&E}_{t-1} + \text{CapEx}_t - \text{Depreciation}_t$.
- **Retained Earnings**: $\text{RE}_{t-1} + \text{Net Income}_t - \text{Dividends Paid}_t$.

---

## 9. Formula-Active 6-Sheet Excel Exporter

Clicking **"Excel Model (.xlsx)"** in the top header or in `⌘8 Research Tear Sheet` triggers an automated workbook generation using `openpyxl`.

All mathematical cells contain uppercase Excel formulas rather than hardcoded numbers:
- Revenue Roll-Forward: `=B4*(1+B5)`
- Operating Profit (EBIT): `=B4*B6`
- Free Cash Flow: `=B7+B8-B9-B10`
- Present Value: `=B11/(1+$C$2)^B3`
- Net Present Value: `=SUM(B12:K12)`
- Terminal Value Perpetuity: `=(K11*(1+$C$3))/($C$2-$C$3)`
- Enterprise Value: `=B13+B14`
- Equity Value: `=B15+B16-B17-B18`
- Balance Sheet Check: `=B25-(B32+B38)`

---

## 10. Auditing & LaTeX Inspector Drawer

Click the **"Inspector 🔍"** button in the top navigation bar to open the LaTeX slide-out drawer from any screen:
- **CAPM Cost of Equity**: Substituted risk-free rate ($6.60\%$), equity beta ($\beta = 0.75$), and Damodaran Indonesia ERP ($7.20\%$).
- **WACC Formula**: Substituted equity weight, cost of equity, debt weight, pre-tax cost of debt, and statutory tax rate (22.0%).
- **FCFF Discounting Proof**: Explicit 10-year discount factor derivation.
- **Gordon Growth Terminal Value Proof**: Numerator and denominator boundary condition proof.
- **Enterprise-to-Equity Bridge**: Complete reconciliation proof verifying:
  $$\text{Equity Value} \equiv \text{Enterprise Value} + \text{Cash} - \text{Total Debt} - \text{Minority Interest}$$
- **Multi-Model Triangulation Proof**: Dynamically displays only active weights and target components.
