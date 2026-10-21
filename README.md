# 🏛️ VALUEX | Institutional Digital Business Valuation Platform
### MM6026 Digital Business Valuation — Highest-Score Implementation Tier
**Calibrated to IDX:PWON (PT Pakuwon Jati Tbk) & Indonesian Property Universe**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests: 32 Passed](https://img.shields.io/badge/Tests-32%20Passed-brightgreen.svg)](tests/)
[![Architecture: Clean Modular](https://img.shields.io/badge/Architecture-Clean%20Modular-orange.svg)](src/)
[![Indonesian IDX Benchmark](https://img.shields.io/badge/IDX%20Benchmark-PWON.JK-informational.svg)](https://www.idx.co.id/)
[![Git Branch: develop_further](https://img.shields.io/badge/Branch-develop__further-blueviolet.svg)](https://github.com/celeebi/DBV_Midterm)

An institutional-grade equity research, multi-model valuation triangulation, and 10-year 3-statement financial modeling platform engineered for Indonesian equities listed on the Indonesia Stock Exchange (**IDX**).

The platform pairs a high-performance **Python Starlette/Uvicorn backend** with a **zero-Node.js/npm React 18 frontend** (the **VALUEX Terminal**). Default benchmarked to **PT Pakuwon Jati Tbk (`PWON.JK`)** and its property peers (`BSDE.JK`, `CTRA.JK`, `SMRA.JK`, `ASII.JK`), the system features **Universal Ticker Search & Live Ingestion** from IDX/Yahoo Finance (`BBCA`, `TLKM`, `UNVR`, `BMRI`, `ICBP`), full **10-year explicit forecast sliders with auto-fade**, integrated **10-year 3-statement modeling with zero-balance checks** ($\text{Assets} \equiv \text{Liabilities} + \text{Equity}$), **Dynamic Weight Composition Donut Chart with 0% weight support & quick presets**, and an advanced institutional model suite: **Revalued Net Asset Value (RNAV)**, **10,000-run Monte Carlo Simulation**, **Economic Value Added (EVA®) & MVA**, **Tornado Sensitivity Analysis**, and **5-Stage DuPont ROE Decomposition**.

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [The 8 Institutional Workflow Tabs](#-the-8-institutional-workflow-tabs)
- [Key Modeling Capabilities](#-key-modeling-capabilities)
  - [1. Multi-Model Valuation Triangulation & Live Donut Chart](#1-multi-model-valuation-triangulation--live-donut-chart)
  - [2. Fundamental CAPM Modeler & Live Data Provenance Notes](#2-fundamental-capm-modeler--live-data-provenance-notes)
  - [3. Institutional Revalued Net Asset Value (RNAV)](#3-institutional-revalued-net-asset-value-rnav)
  - [4. 10,000-Run Vectorized Monte Carlo Simulation & VaR](#4-10000-run-vectorized-monte-carlo-simulation--var)
  - [5. Economic Value Added (EVA®) & Market Value Added (MVA)](#5-economic-value-added-eva--market-value-added-mva)
  - [6. Tornado Sensitivity Analysis & 5-Stage DuPont ROE Decomposition](#6-tornado-sensitivity-analysis--5-stage-dupont-roe-decomposition)
  - [7. Universal Ticker Search & Live Fetcher](#7-universal-ticker-search--live-fetcher)
  - [8. Full 10-Year Explicit Forecasts & Auto-Fade](#8-full-10-year-explicit-forecasts--auto-fade)
  - [9. Integrated 10-Year 3-Statement Financial Model](#9-integrated-10-year-3-statement-financial-model)
  - [10. Formula-Active 6-Sheet Microsoft Excel Export](#10-formula-active-6-sheet-microsoft-excel-export)
  - [11. Institutional Website Footer, Co-Branding & Navigable Pages](#11-institutional-website-footer-co-branding--navigable-pages)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1-Click Launch (Windows)](#1-click-launch-windows)
  - [Command-Line Execution](#command-line-execution)
  - [Running Automated Unit Tests](#running-automated-unit-tests)
- [Git Branching & Safety Policy](#-git-branching--safety-policy)
- [License & Academic Disclosure](#-license--academic-disclosure)

---

## 🌟 Executive Overview

```mermaid
flowchart LR
    Tape["Live Market Tape & Real Estate News Wire"] --> Nav["Institutional Header & Universal Ticker Search"]
    Nav --> V1["⌘1 Dashboard"]
    Nav --> V2["⌘2 Screener"]
    Nav --> V3["⌘3 Valuation (DCF / Comps / RIM / DDM / RNAV / MC / EVA / Tornado / DuPont)"]
    Nav --> V4["⌘4 3-Statement Model (IS, BS, CFS)"]
    Nav --> V5["⌘5 Assumptions (10-Yr Sliders + Weight Donut + Auto-Fade)"]
    Nav --> V6["⌘6 Decision Blotter (EMS)"]
    Nav --> V7["⌘7 Watchlist & Comps"]
    Nav --> V8["⌘8 Tear Sheet (PDF / Excel)"]
```

The VALUEX Terminal implements an institutional equity research workflow. Every metric displayed in the interface is backed by pure-Python mathematical modules, ensuring complete auditability and zero hallucination.

---

## 🖥️ The 8 Institutional Workflow Tabs

1. **Top Live Market Ribbon & Real Estate Wire**:
   - Expanded unclipped real-time ticker tape displaying `PWON.JK` (IDR 270, Intrinsic IDR 575), property peers (`BSDE`, `CTRA`, `SMRA`, `ASII`), and macroeconomic benchmarks: `IHSG (7,785)`, `ID 10Y Yield (6.60%)`, `USD/IDR (15,850)`, `BI 7-Day Repo (6.00%)`, and `IDX Property Index (824.50)`.
   - Live stream toggle (`[● LIVE FEED] / [❚❚ PAUSED]`) with rotating real estate research wire bulletins.
2. **`⌘1` Executive Dashboard**:
   - Coverage market capitalization summary, average universe upside, and recommendation signal distribution.
   - Valuation Dislocation horizontal bar chart with BUY hurdle reference lines (+15%).
   - Direct launch links to valuation models.
3. **`⌘2` Company Screener (Discovery)**:
   - Filter by recommendation signal (`BUY`, `HOLD`, `SELL`) and sort by upside or market cap.
   - **Universal Ticker Search & Ingestion Card**: Input any IDX/global equity (e.g. `BBCA`, `TLKM`, `UNVR`) to pull live audited financials and calculate intrinsic valuation instantly.
4. **`⌘3` Valuation Workspace**:
   - 12M historical market price vs intrinsic target area chart.
   - Top Header Toggle: Switch between **Valuation Methodology Football Field** and **Interactive Weight Composition Donut Chart**.
   - **10 Methodology Sub-Tabs**:
     - **Tab 1: Multi-Stage DCF**: 10-year FCFF pro forma schedule + Enterprise-to-Equity bridge.
     - **Tab 2: Property Comps**: EV/EBITDA, P/E, P/B peer matrix with subject comparisons.
     - **Tab 3: Residual Income Model (RIM)**: Book value equity + PV of economic profits schedule.
     - **Tab 4: Dividend Discount Model (DDM)**: 10-year explicit dividend schedule + Gordon Growth terminal value.
     - **Tab 5: Revalued Net Asset Value (RNAV)**: Property GAV breakdown, NOI capitalization, land bank mark-to-market, and RNAV discount.
     - **Tab 6: Monte Carlo DCF**: 10,000-run simulation, VaR 95%, P10/P50/P90 distributions, and SVG frequency histogram.
     - **Tab 7: Economic Value Added (EVA®)**: NOPAT, Invested Capital, ROIC vs WACC economic spread, 10-year EVA schedule, and MVA.
     - **Tab 8: 5x5 WACC Sensitivity**: Heatmap matrix across WACC (9.42%–11.42%) vs $g$ (1.0%–2.0%).
     - **Tab 9: Tornado & DuPont**: Two-sided DCF sensitivity swing rankings + 5-stage DuPont ROE decomposition.
     - **Tab 10: KaTeX Mathematical Proofs**: Substituted step-by-step LaTeX formula derivations.
5. **`⌘4` 3-Statement Financial Model**:
   - First-class view showcasing 10-year articulated financial statements (2026E–2035E).
   - Dedicated statement selector: Balance Sheet, Income Statement, and Cash Flow Statement.
   - **Zero-Balance Check Row**: Proves $\text{Assets} - (\text{Liabilities} + \text{Equity}) \equiv \text{IDR } 0.00$ with green checkmark across all 10 periods.
6. **`⌘5` Model Assumptions & Parameter Editor**:
   - **Phase 1: Explicit High Growth (Years 1–5)**: 5 individual sliders/inputs for high-growth explicit period.
   - **Phase 2: Transition & Fade Phase (Years 6–10)**: 5 individual sliders/inputs for transition period.
   - **⚡ Auto-Fade Helper (Y6–Y10)**: Linearly fades Year 5 growth into terminal $g$ ($1.5\%$).
   - **Amateur Financier / Convergence Warning**: Educational alert banner triggered if Year 10 growth is set higher than sustainable GDP ($5.0\%$) or WACC.
   - **Section 3: Cost of Capital & Fundamental CAPM Modeler**:
     - Sliders and numeric inputs for **Beta ($\beta$)**, **Risk-Free Rate ($R_f$)**, **Mature Market ERP**, **Country Risk Premium (CRP)**, **Pre-tax Cost of Debt ($K_d$)**, **Debt Weight ($W_d$)**, and **Tax Rate ($t$)**.
     - **Interactive Hoverable Provenance Notes (`[ⓘ]`)**: Sleek dark-slate tooltips detailing live data sources, citations, methodologies, and valuation impacts.
     - **Live Sync Cards**: Real-time reactive recalculation of Hurdle WACC (`10.42%`) and Cost of Equity ($K_e$: `12.00%`).
     - **"Reset CAPM"** button restoring scraped/calibrated defaults in 1 click.
   - **Section 4: Model Weight Composition & Real-Time Donut Chart**:
     - Sliders support setting any weight to **`0%`** cleanly (resolved falsy coercion bug).
     - Interactive SVG Donut Chart dynamically renders methodology slice proportions.
     - **Quick Presets**: `50/50 DCF & RIM`, `100% DCF`, `4-Way Triangulation (40/20/20/20)`, `Equal (25% each)`, and `Normalize to 100%`.
7. **`⌘6` Buy / Sell Decision Workspace**:
   - Investment thesis pillars, catalyst monitoring, and downside risks.
   - Portfolio Committee decision parameters (Entry/Exit targets, holding horizon, analyst memo).
   - **Simulated Order Ticket (EMS Preview)**: Standard **IDX 100-share lot** quantity input, limit price, and gross notional calculation.
8. **`⌘7` Watchlist & Comps Matrix**:
   - Equity watchlist with side-by-side fundamental and multiple comparison matrix.
9. **`⌘8` Research Report Tear Sheet**:
   - Formal investment banking equity research memo format.
   - **"Print / Save PDF"** button (invoking `@media print` clean report layout).
   - **"Download Excel Model (.xlsx)"** button.
10. **Persistent "Inspector 🔍" KaTeX Flyout Drawer**:
    - Accessible from any screen via top header button.
    - Slides out KaTeX LaTeX equations with substituted figures for WACC, Terminal Value, Enterprise Bridge, DDM, and Triangulation.

---

## 📐 Key Modeling Capabilities

### 1. Multi-Model Valuation Triangulation & Live Donut Chart
The platform computes a composite fair value from configurable weights:
$$\text{Composite Target} = \sum_{m \in \{\text{DCF}, \text{Comps}, \text{RIM}, \text{DDM}\}} w_m \cdot P_m \quad \text{where } \sum w_m = 100\%$$
- **0% Weight Flexibility**: Analysts can set any method (e.g. DCF) to `0%` without it resetting.
- **Interactive SVG Donut**: Slices update in real-time with responsive tooltips and color matching.
- **Dynamic KaTeX Proofs**: Substituted step-by-step mathematical proof automatically suppresses zero-weighted methods and reflects custom allocations.

### 2. Fundamental CAPM Modeler & Live Data Provenance Notes
Replaces opaque single WACC sliders with institutional bottom-up capital structure modeling:
- **Live Scraped Beta ($\beta$)**: Sourced directly from Yahoo Finance 5-year regression against the IHSG for any searched company, with property sector fallbacks.
- **Risk-Free Rate ($R_f$)**: Calibrated to Bank Indonesia / Ministry of Finance 10-Year Indonesian Sovereign Bond Yield (`INDOGB 10Y`: $6.60\%$).
- **Mature Market ERP & Damodaran Country Risk Premium (CRP)**: Decomposed into mature market equity premium ($5.00\%$) and Indonesian sovereign default spread / equity volatility premium ($2.16\%$).
- **Cost of Debt ($K_d$) & Corporate Spread**: Commercial borrowing rate ($6.50\%$) with automated after-tax debt shielding: $K_{d,\text{after}} = K_d \times (1 - 22.0\% \text{ Tax}) = 5.07\%$.
- **Interactive Data Provenance Tooltips (`[ⓘ]`)**: Sleek dark-mode popovers beside every parameter explaining data sources, citations, financial methodologies, and valuation sensitivities.
- **Reactive Valuation Sync**: Real-time recalculation of $K_e$, $K_{d,\text{after}}$, and WACC, instantly updating DCF, RIM, and DDM target prices.

### 3. Institutional Revalued Net Asset Value (RNAV)
Engineered specifically for real estate developers like `PWON.JK`:
- **Direct Capitalization of Retail Malls & Hotels**: NOI capitalized at sector cap rates ($8.5\%$).
- **Land Bank Mark-to-Market (MTM)**: Revalues undeveloped land reserves from book value to market value ($IDR 4.5M/m^2$ vs $IDR 1.2M/m^2$ historical cost).
- **Presales Discounting**: Present value of unbilled property presales over 3-year delivery horizon.
- **Target RNAV per Share**: GAV less net debt, applying property holding-company conglomerate discounts ($25\%$).

### 4. 10,000-Run Vectorized Monte Carlo Simulation & VaR
Replaces static single-point estimates with probability distributions using NumPy:
- **Correlated Stochastic Parameters**: Revenue growth (Normal), EBITDA margin (Normal), WACC (Normal, $9.5\% \text{ to } 11.5\%$), and terminal $g$ (Normal, $1.0\% \text{ to } 2.0\%$).
- **Statistical Output**: Mean target price, median (P50), standard deviation, 95% Confidence Interval, P10 (Downside / Bear), P90 (Upside / Bull).
- **Value at Risk (VaR 95%)**: Downside risk relative to current market price.
- **Probability of Undervaluation**: Percentage of simulation runs where intrinsic value exceeds current market price ($P(\text{Target} > P_{\text{market}})$).
- **Dynamic 25-Bin Frequency Histogram**: Visualized via responsive SVG with mean and market price reference lines.

### 5. Economic Value Added (EVA®) & Market Value Added (MVA)
Stern Stewart & Co. value-based management framework:
- **Economic Profit Identity**: $\text{EVA}_t = \text{NOPAT}_t - (\text{WACC} \times \text{Invested Capital}_{t-1}) \equiv (\text{ROIC}_t - \text{WACC}) \times \text{Invested Capital}_{t-1}$.
- **10-Year Schedule**: Explicit schedule of NOPAT, Invested Capital, ROIC, Economic Spread, and EVA discounted at WACC.
- **Market Value Added (MVA)**: PV of future EVA + Invested Capital, measuring net enterprise wealth creation above invested capital.

### 6. Tornado Sensitivity Analysis & 5-Stage DuPont ROE Decomposition
- **Tornado Sensitivity**: Two-sided DCF sensitivity swings ($\pm 100 \text{ bps}$ on WACC, $g$, margins, growth, and exit multiples) sorted in descending order of valuation impact.
- **5-Stage DuPont ROE Decomposition**:
  $$\text{ROE} = \left(\frac{\text{Net Income}}{\text{EBT}}\right) \times \left(\frac{\text{EBT}}{\text{EBIT}}\right) \times \left(\frac{\text{EBIT}}{\text{Revenue}}\right) \times \left(\frac{\text{Revenue}}{\text{Assets}}\right) \times \left(\frac{\text{Assets}}{\text{Equity}}\right)$$
  Decomposes ROE into Tax Burden, Interest Burden, Operating Margin, Asset Turnover, and Financial Leverage, benchmarked against Indonesian property sector averages.

### 7. Universal Ticker Search & Live Fetcher
In addition to the pre-calibrated `PWON.JK` benchmark and property universe, analysts can type **any** ticker into the header bar or Screener card (e.g. `BBCA.JK`, `TLKM.JK`, `BMRI.JK`, `UNVR.JK`, `ICBP.JK`). The system queries `yfinance`, extracts audited balance sheets, income statements, cash flows, beta, shares, and current prices, normalizes currency units, and integrates the stock directly into the terminal.

### 8. Full 10-Year Explicit Forecasts & Auto-Fade
Rather than truncating the forecast at Year 5, the platform provides explicit controls for all 10 periods:
- **Phase 1 (Years 1–5)**: High-growth operational roll-forward.
- **Phase 2 (Years 6–10)**: Macroeconomic transition & fade.
- **Auto-Fade Helper**: Automatically applies linear interpolation:
  $$\Delta g = \frac{g_5 - g_{\text{terminal}}}{5}, \quad g_t = g_5 - \Delta g \times (t - 5) \quad \text{for } t \in [6, 10]$$
- **Amateur Financier Warning**: Flags a Damodaran boundary error if an analyst attempts to run Year 10 growth above long-term Indonesian GDP ($5.0\%$) into terminal perpetuity.

### 9. Integrated 10-Year 3-Statement Financial Model
Full mathematical articulation across Income Statement, Balance Sheet, and Cash Flow Statement:
- **Balance Sheet Check**: $\text{Assets} - (\text{Liabilities} + \text{Equity}) \equiv \text{IDR } 0.00$ across all 10 forecast years.
- Dynamic Working Capital schedules (DSO = 15 days, DIO = 521 days for property inventories, DPO = 72 days).
- PP&E continuity schedules ($\text{PP\&E}_t = \text{PP\&E}_{t-1} + \text{CapEx}_t - \text{Depr}_t$).

### 10. Formula-Active 6-Sheet Microsoft Excel Export
Generates institutional `.xlsx` workbooks via `openpyxl` with dynamic, uppercase Excel formulas:
- **Sheet 1: `Executive Summary`**: Valuation matrix, KPI cards, and methodology football field.
- **Sheet 2: `10Y Pro Forma DCF`**: Explicit FCFF schedules with dynamic Excel formulas (`=B1*(1+B2)`, `=SUM(B3:B10)`).
- **Sheet 3: `3-Statement Model`**: Full 10-year IS, BS, and CFS articulation with live zero-balance check rows.
- **Sheet 4: `Property Comps`**: Peer multiple benchmarks (EV/EBITDA, P/E, P/B).
- **Sheet 5: `RIM & DDM`**: Economic profit schedules, dividend discount schedules, and terminal values.
- **Sheet 6: `Audit & Sensitivity`**: 5x5 WACC vs $g$ sensitivity matrix and LaTeX proof summaries.

### 11. Institutional Website Footer, Co-Branding & Navigable Pages
- **Persistent Viewport Footer**: Multi-column institutional directory rendered across all workspace screens.
- **Academic Co-Branding**: Features the **VALUEX** platform logo alongside the **University Logo** (`/static/img/university_logo.png`) and **MM6026 Course Logo** (`/static/img/course_logo.png`), complete with graceful image fallback badges.
- **Dedicated "About Us" Workspace (`activeNav === 'about'`)**: Comprehensive institutional presentation of the MM6026 Digital Business Valuation project, academic pedigree at SBM ITB, multi-model triangulation methodology, and pure Python / React 18 architecture.
- **Dedicated "Contact Us & Research Desk" Workspace (`activeNav === 'contact'`)**: Interactive inquiry and model feedback form with asynchronous dispatch, unique reference ID generation (`#VALUEX-XXXXX`), campus coordinates, and valuation FAQ accordion.

---

## 🏛 System Architecture

```
[ yfinance Live Market API / IDX Audited Filings ]
                     ↓
[ FinancialDataLoader & Statement Normalizer (src/data/loader.py) ]
                     ↓
┌─────────────────────────────────────────────────────────────┐
│          10-Year Pro Forma Financial Modeling Engine        │
│          (src/models/pro_forma.py & three_statement.py)     │
└──────────────────────────────┬──────────────────────────────┘
                               ↓
       ┌───────────────────────┼───────────────────────┐
       ↓                       ↓                       ↓
[ Multi-Stage DCF ]    [ Relative Comps ]      [ RIM & DDM Models ]
(src/models/dcf.py)   (src/models/multiples.py) (src/models/rim, ddm.py)
       │                       │                       │
       ├───────────────────────┼───────────────────────┤
       ↓                       ↓                       ↓
[ Institutional RNAV ] [ Monte Carlo (10k) ]   [ EVA® & MVA Engine ]
(src/models/rnav.py)   (src/models/monte_carlo) (src/models/eva.py)
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ↓
               [ Multi-Model Triangulation & Weight Donut ]
                    (src/models/ensemble.py)
                               ↓
       ┌───────────────────────┴───────────────────────┐
       ↓                                               ↓
[ Tornado Sensitivity ]                 [ 5-Stage DuPont ROE ]
(src/analytics/tornado.py)              (src/analytics/dupont.py)
                               ↓
               [ Margin of Safety Recommendation ]
                  (src/rules/recommendations.py)
                               ↓
               [ Automated Model Sanity Checks ]
                  (src/rules/sanity_checks.py)
                               ↓
       ┌───────────────────────┴───────────────────────┐
       ↓                                               ↓
[ VALUEX React 18 Terminal ]            [ Active Excel Exporter (.xlsx) ]
(Zero Node.js / Python Starlette)          (src/analytics/exporter.py)
```

---

## 📁 Repository Structure

```
Project BA/
├── run_app.bat                     # 1-Click Windows launcher (Starlette server @ localhost:8000)
├── create_desktop_shortcut.bat     # Windows desktop shortcut generator
├── server.py                       # High-performance asynchronous backend server (Starlette/Uvicorn)
├── app.py                          # Companion Streamlit analytical interface
├── requirements.txt                # Python package dependencies
├── README.md                       # Comprehensive institutional project documentation
├── USER_GUIDE.md                   # User guide & operational manual for VALUEX Terminal
├── PLAN.md                         # Architectural design and execution roadmap
├── AI_DISCLOSURE.md                # Academic AI disclosure and verification statement
├── LICENSE                         # MIT License
├── static/
│   ├── img/                        # Institutional co-branding and academic assets
│   │   ├── university_logo.png     # SBM ITB / University crest logo
│   │   └── course_logo.png         # MM6026 Digital Business Valuation course logo
│   ├── index.html                  # React 18 production shell (Tailwind CDN, Lucide, KaTeX, Error Boundary)
│   ├── app_react.jsx               # VALUEX Terminal application (8 workflow views, Donut chart, 10 subtabs)
│   ├── coverage_data.js            # Synchronous initial Indonesian property coverage (PWON, BSDE, CTRA, SMRA, ASII)
│   ├── index_legacy.html           # Verified backup of prior frontend interface
│   ├── app.js                      # Legacy vanilla JS controller
│   └── draft.tsx                   # Original institutional design reference template
├── src/
│   ├── data/
│   │   ├── loader.py               # Live market extractor & statement normalizer
│   │   ├── coverage.py             # Coverage universe data (PWON benchmark + property peers)
│   │   ├── country_data.py         # Indonesian macroeconomic parameters (tax rate, BI 7DRR, 10Y yield)
│   │   └── normalizer.py           # Balance sheet & income statement standardization
│   ├── models/
│   │   ├── dcf.py                  # 10-year FCFF multi-stage DCF engine with dual terminal value
│   │   ├── ddm.py                  # Multi-stage Dividend Discount Model with Gordon Growth TV
│   │   ├── three_statement.py      # Integrated 10-year 3-statement financial model (zero-balance check)
│   │   ├── multiples.py            # Relative valuation comps with peer filtering & median/mean aggregation
│   │   ├── rim.py                  # Residual Income Model (clean surplus ROE - Ke)
│   │   ├── rnav.py                 # Revalued Net Asset Value (GAV, NOI cap, land bank MTM, RNAV discount)
│   │   ├── monte_carlo.py          # 10,000-run vectorized Monte Carlo simulation with VaR 95% & histogram
│   │   ├── eva.py                  # Economic Value Added (EVA) and Market Value Added (MVA) 10Y schedule
│   │   ├── ensemble.py             # Multi-model triangulation aggregator
│   │   ├── parameters.py           # CAPM & WACC capital structure model
│   │   ├── pro_forma.py            # 10-year pro forma roll-forward & auto-fade generator
│   │   └── scenarios.py            # Bear / Base / Bull scenario forecaster
│   ├── rules/
│   │   ├── sanity_checks.py        # Academic guardrails (g >= WACC, negative multiples, EV bridge check)
│   │   └── recommendations.py      # Recommendation engine (BUY / HOLD / SELL)
│   └── analytics/
│       ├── tornado.py              # Two-sided sensitivity swing ranking (Tornado diagram)
│       ├── dupont.py               # 5-stage DuPont ROE decomposition with property sector benchmarking
│       ├── exporter.py             # 6-sheet formula-active Excel (.xlsx) exporter
│       ├── audit_trail.py          # LaTeX mathematical proof generator
│       ├── sensitivity.py          # 2D WACC vs g sensitivity matrix
│       └── visualizer.py           # Plotly visualization engine
└── tests/
    ├── test_dcf_and_exporter.py    # DCF discounting math and active formula Excel tests
    ├── test_ddm.py                 # Multi-stage DDM, 4-way triangulation, and Excel export tests
    ├── test_pro_forma.py           # 10-year pro forma roll-forward, WACC, and auto-fade tests
    ├── test_sanity_checks.py       # Terminal growth, negative multiple, and EV bridge tests
    ├── test_three_statement.py     # 10-year 3-statement articulation and zero-balance tests
    ├── test_rnav.py                # RNAV GAV, land bank MTM, and target price tests
    ├── test_monte_carlo.py         # Monte Carlo 10k simulations, percentiles, and VaR tests
    ├── test_eva.py                 # EVA mathematical identity, 10Y schedule, and MVA tests
    ├── test_analytics_advanced.py  # Tornado sensitivity and DuPont identity tests
    └── test_api_endpoints.py       # Starlette REST API endpoints tests
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14.7).
- Standard web browser (Edge, Chrome, Firefox, Safari).
- Zero external Node.js, npm, or JavaScript build steps required.

### 1-Click Launch (Windows)
Double-click [`run_app.bat`](file:///c:/Users/Public/Documents/Project%20BA/run_app.bat) in the project folder. It will:
1. Detect or configure your local Python virtual environment (`.venv`).
2. Start the asynchronous Starlette valuation server.
3. Automatically launch your default browser to `http://localhost:8000`.

### Command-Line Execution
```powershell
# Activate local virtual environment
.\.venv\Scripts\Activate.ps1

# Start the VALUEX Terminal server (Port 8000)
python server.py

# Or run the companion Streamlit interface (Port 8501)
streamlit run app.py
```

### Running Automated Unit Tests
To verify all financial engines, 3-statement balance checks, advanced models, and Excel exports:
```powershell
.\.venv\Scripts\pytest.exe -v
```
Expected output: **32 passed in ~2.8s** (100% pass rate).

---

## 🛡️ Git Branching & Safety Policy

| Branch / Tag | Description | Commit |
| :--- | :--- | :--- |
| **`develop_further`** (Active) | Institutional Option A + Fundamental CAPM upgrade: live-scraped beta, Damodaran ERP/CRP, data provenance tooltips, RNAV, Monte Carlo (10k), EVA/MVA, Tornado, DuPont, Weight Donut Chart, and 0-weight support. | `1efeadb` |
| **`develop`** (Feature) | Contains the institutional VALUEX Terminal, Universal Ticker Search, expanded live ribbon, and 10-year sliders. | `67dd6d9` |
| **`main`** (Stable) | Untouched stable baseline containing the verified 4-way valuation models and Excel exporter. | `36a99e3` |
| **`v1.0-checkpoint`** (Tag) | Fixed checkpoint tag anchored to `36a99e3` for instant rollback safety. | `36a99e3` |

To switch back to the stable checkpoint at any time:
```powershell
git checkout main
# or
git checkout v1.0-checkpoint
```

---

## 📄 License & Academic Disclosure

- **Course:** MM6026 Digital Business Valuation  
- **License:** MIT License. See [`LICENSE`](file:///c:/Users/Public/Documents/Project%20BA/LICENSE) for terms.  
- **Academic AI Disclosure:** All AI assistance utilized in constructing and verifying this platform complies with institutional academic standards. See [`AI_DISCLOSURE.md`](file:///c:/Users/Public/Documents/Project%20BA/AI_DISCLOSURE.md).
