# 🏛️ VALUEX | Institutional Digital Business Valuation Platform
### MM6026 Digital Business Valuation — Master of Business Administration (MBA)
**Calibrated to IDX:PWON (PT Pakuwon Jati Tbk) & Indonesian Property Universe**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests: 34 Passed](https://img.shields.io/badge/Tests-34%20Passed-brightgreen.svg)](tests/)
[![Architecture: Clean Modular](https://img.shields.io/badge/Architecture-Clean%20Modular-orange.svg)](src/)
[![Indonesian IDX Benchmark](https://img.shields.io/badge/IDX%20Benchmark-PWON.JK-informational.svg)](https://www.idx.co.id/)
[![Git Branch: latest](https://img.shields.io/badge/Branch-latest-blueviolet.svg)](https://github.com/celeebi/DBV_Midterm)

An institutional-grade equity research, multi-model valuation triangulation, and 10-year 3-statement financial modeling platform engineered for Indonesian equities listed on the Indonesia Stock Exchange (**IDX**).

The platform pairs a high-performance **Python Starlette/Uvicorn backend** with a **zero-Node.js/npm React 18 frontend** (the **VALUEX Terminal**). Default benchmarked to **PT Pakuwon Jati Tbk (`PWON.JK`)** and its premier property peers (`BSDE.JK`, `CTRA.JK`, `SMRA.JK`, `ASII.JK`), the system features **Universal Ticker Search & Live Ingestion** from IDX/Yahoo Finance (`BBCA`, `TLKM`, `UNVR`, `BMRI`, `ICBP`), full **10-year explicit forecast sliders with auto-fade**, **dynamically refreshed 10-year 3-statement modeling with zero-balance checks** ($\text{Assets} \equiv \text{Liabilities} + \text{Equity}$), **Dynamic Weight Composition Donut Chart with 0% weight support & quick presets**, **Formula-Active 6-Sheet Excel Model Export with assumption parity**, and an advanced institutional model suite: **Revalued Net Asset Value (RNAV)**, **10,000-run Monte Carlo Simulation**, **Economic Value Added (EVA®) & MVA**, **Tornado Sensitivity Analysis**, and **5-Stage DuPont ROE Decomposition**.

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [The 8 Institutional Workflow Tabs](#-the-8-institutional-workflow-tabs)
- [Key Modeling & Analytical Capabilities](#-key-modeling--analytical-capabilities)
  - [1. Multi-Model Valuation Triangulation & Live Donut Chart](#1-multi-model-valuation-triangulation--live-donut-chart)
  - [2. Fundamental CAPM Modeler & Live Data Provenance Notes](#2-fundamental-capm-modeler--live-data-provenance-notes)
  - [3. Fully Articulated Multi-Stage DCF Schedule & Currency Scaling](#3-fully-articulated-multi-stage-dcf-schedule--currency-scaling)
  - [4. Dynamic 10-Year 3-Statement Financial Model & Live Recalculation](#4-dynamic-10-year-3-statement-financial-model--live-recalculation)
  - [5. Corporate Finance Scope: Non-Banking & Non-Lending Focus](#5-corporate-finance-scope-non-banking--non-lending-focus)
  - [6. Institutional Revalued Net Asset Value (RNAV)](#6-institutional-revalued-net-asset-value-rnav)
  - [7. 10,000-Run Vectorized Monte Carlo Simulation & VaR](#7-10000-run-vectorized-monte-carlo-simulation--var)
  - [8. Economic Value Added (EVA®) & Market Value Added (MVA)](#8-economic-value-added-eva--market-value-added-mva)
  - [9. Tornado Sensitivity Analysis & 5-Stage DuPont ROE Decomposition](#9-tornado-sensitivity-analysis--5-stage-dupont-roe-decomposition)
  - [10. Universal Ticker Ingestion & Statement Normalization](#10-universal-ticker-ingestion--statement-normalization)
  - [11. 10-Year Explicit Forecasts, Auto-Fade & Damodaran Boundaries](#11-10-year-explicit-forecasts-auto-fade--damodaran-boundaries)
  - [12. Formula-Active 6-Sheet Microsoft Excel Export with Live Assumption Parity](#12-formula-active-6-sheet-microsoft-excel-export-with-live-assumption-parity)
  - [13. Institutional Footer, Academic Co-Branding & Dedicated Pages](#13-institutional-footer-academic-co-branding--dedicated-pages)
- [Author Profile & Engineering Pedigree](#-author-profile--engineering-pedigree)
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
    Nav --> V4["⌘4 3-Statement Model (Dynamic IS, BS, CFS with Zero-Balance Check)"]
    Nav --> V5["⌘5 Assumptions (10-Yr Sliders + Weight Donut + CAPM Modeler + Auto-Fade)"]
    Nav --> V6["⌘6 Decision Blotter (EMS)"]
    Nav --> V7["⌘7 Watchlist & Comps"]
    Nav --> V8["⌘8 Tear Sheet (PDF / Excel Export)"]
    Nav --> V9["⌘9 About Platform (Author & Academic Pedigree)"]
    Nav --> V0["⌘0 Contact Author (Interactive Research Desk)"]
```

The VALUEX Terminal implements a comprehensive institutional equity research workflow. Every metric displayed in the interface is backed by pure-Python mathematical modules, ensuring complete auditability and zero hallucination.

---

## 🖥️ The 8 Institutional Workflow Tabs

1. **Top Live Market Ribbon & Real Estate Wire**:
   - Expanded unclipped real-time ticker tape displaying `PWON.JK` (IDR 270, Intrinsic IDR 575), property peers (`BSDE`, `CTRA`, `SMRA`, `ASII`), and macroeconomic benchmarks: `IHSG (7,785)`, `ID 10Y Yield (6.60%)`, `USD/IDR (15,850)`, `BI 7-Day Repo (6.00%)`, and `IDX Property Index (824.50)`.
   - Live stream toggle (`[● LIVE FEED] / [❚❚ PAUSED]`) with rotating real estate research wire bulletins.
2. **`⌘1` Executive Dashboard**:
   - Coverage market capitalization summary, average universe upside, and recommendation signal distribution.
   - Valuation Dislocation horizontal bar chart with BUY hurdle reference lines (+15%).
   - Direct launch links to valuation engines.
3. **`⌘2` Company Screener (Discovery)**:
   - Filter by recommendation signal (`BUY`, `HOLD`, `SELL`) and sort by upside or market cap.
   - **Universal Ticker Search & Ingestion Card**: Input any IDX/global equity (e.g. `BBCA`, `TLKM`, `UNVR`) to pull live audited financials and calculate intrinsic valuation instantly.
4. **`⌘3` Valuation Workspace**:
   - 12M historical market price vs intrinsic target area chart.
   - Top Header Toggle: Switch between **Valuation Methodology Football Field** and **Interactive Weight Composition Donut Chart**.
   - **10 Methodology Sub-Tabs**:
     - **Tab 1: Multi-Stage DCF**: 10-year FCFF pro forma schedule with complete line items ($\Delta\text{NWC}$, Discount Factors, PV of FCFF) + Enterprise-to-Equity bridge.
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
   - 10-year articulated financial statements (2026E–2035E).
   - Dedicated statement selector: Balance Sheet, Income Statement, and Cash Flow Statement.
   - **Zero-Balance Check Row**: Proves $\text{Assets} - (\text{Liabilities} + \text{Equity}) \equiv \text{IDR } 0.00$ with green checkmark across all 10 periods.
   - **Corporate Finance Scope Badge**: Highlighting top-down corporate demand engine vs banking ALM mechanics, with collapsible **Scope Rationale** modal.
6. **`⌘5` Model Assumptions & Parameter Editor**:
   - **Phase 1: Explicit High Growth (Years 1–5)**: 5 individual sliders/inputs for high-growth explicit period.
   - **Phase 2: Transition & Fade Phase (Years 6–10)**: 5 individual sliders/inputs for transition period.
   - **⚡ Auto-Fade Helper (Y6–Y10)**: Linearly fades Year 5 growth into terminal $g$ ($1.5\%$).
   - **⚡ "Recalculate Pro Forma" Engine**: Instant dynamic cascade updating all 3 statements and valuation outputs upon modifying growth or margin assumptions.
   - **Amateur Financier / Convergence Warning**: Educational alert banner triggered if Year 10 growth is set higher than sustainable GDP ($5.0\%$) or WACC.
   - **Cost of Capital & Fundamental CAPM Modeler**:
     - Sliders and numeric inputs for **Beta ($\beta$)**, **Risk-Free Rate ($R_f$)**, **Mature Market ERP**, **Country Risk Premium (CRP)**, **Pre-tax Cost of Debt ($K_d$)**, **Debt Weight ($W_d$)**, and **Tax Rate ($t$)**.
     - **Interactive Hoverable Provenance Notes (`[ⓘ]`)**: Sleek dark-slate tooltips detailing live data sources, citations, methodologies, and valuation impacts.
     - **Live Sync Cards**: Real-time reactive recalculation of Hurdle WACC (`10.42%`) and Cost of Equity ($K_e$: `12.00%`).
     - **"Reset CAPM"** button restoring scraped/calibrated defaults in 1 click.
   - **Model Weight Composition & Real-Time Donut Chart**:
     - Sliders support setting any weight to **`0%`** cleanly without NaN or default reset.
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
   - **"Download Excel Model (.xlsx)"** button with assumption parity.
10. **Dedicated Pages**:
    - **`⌘9` About Platform**: Comprehensive academic pedigree (MM6026 Digital Business Valuation at SBM ITB), methodology pillars, non-banking scope rationale, and Executive Author Profile.
    - **`⌘0` Contact Author**: Interactive research desk inquiry form, reference ID generator (`#VALUEX-XXXXX`), campus coordinates, direct author email, and social connection channels.
11. **Persistent "Inspector 🔍" KaTeX Flyout Drawer**:
    - Accessible from any screen via top header button.
    - Slides out KaTeX LaTeX equations with substituted figures for WACC, Terminal Value, Enterprise Bridge, DDM, and Triangulation.

---

## 📐 Key Modeling & Analytical Capabilities

### 1. Multi-Model Valuation Triangulation & Live Donut Chart
The platform computes a composite fair value from configurable weights:
$$\text{Composite Target} = \sum_{m \in \{\text{DCF}, \text{Comps}, \text{RIM}, \text{DDM}\}} w_m \cdot P_m \quad \text{where } \sum w_m = 100\%$$
- **0% Weight Flexibility**: Analysts can set any method to `0%` without numeric coercions.
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

### 3. Fully Articulated Multi-Stage DCF Schedule & Currency Scaling
The 10-year Free Cash Flow schedule displays complete, clean numbers without currency distortion:
- **Universal Scale Normalizer (`toTrillion`)**: Seamlessly handles backend trillion-denominated figures (`IDR 7.61T`) and client-side estimates without accidental double-divisions.
- **Full Cash Flow Articulation**: Displays Revenue, Operating Margin, Operating Income (EBIT), NOPAT, Depreciation & Amortization, Capital Expenditures (CapEx), **Change in Net Working Capital ($\Delta\text{NWC}$)**, **Free Cash Flow to Firm (FCFF)**, **Discount Factor ($df = 1 / (1 + \text{WACC})^t$)**, and **Present Value of FCFF**.
- **Dynamic WACC & Enterprise Bridge**: Header discount rate reflects live WACC dynamically, while summary bridge cards prioritize audited backend outputs.

### 4. Dynamic 10-Year 3-Statement Financial Model & Live Recalculation
Full mathematical articulation across Income Statement, Balance Sheet, and Cash Flow Statement:
- **Live Cascading Engine**: Adjusting any forecast slider on `⌘5` and clicking **"Recalculate Pro Forma"** instantly cascades through all 3 statements:
  - **Income Statement**: Pro forma revenues, EBITDA, EBIT, and Net Income dynamically update.
  - **Balance Sheet**: Net Income flows directly into Retained Earnings, Capex/Depreciation schedules update PP&E, and Cash acts as the dynamic liquidity plug.
  - **Cash Flow Statement**: Operating cash flows, working capital changes, CapEx reinvestment, and debt schedules update in complete mathematical balance.
- **Zero-Balance Check Row**: Proves $\text{Assets} - (\text{Liabilities} + \text{Equity}) \equiv \text{IDR } 0.00$ with green checkmark across all 10 forecast years.

### 5. Corporate Finance Scope: Non-Banking & Non-Lending Focus
The platform incorporates dedicated architectural documentation explaining its target corporate scope:
- **In-Scope: Non-Financial Corporates (Real Estate, Industrials, Consumer, Retail, Tech)**:
  - Demand-driven value creation ($P \times Q \rightarrow \text{Revenue} \rightarrow \text{Net Income} \rightarrow \text{FCFF}$).
  - Clear operational separation from financing decisions (EBITDA independent of leverage).
  - Physical working capital (DSO/DIO/DPO) supporting real asset delivery.
- **Out-of-Scope: Banking & Lending Institutions**:
  - For commercial banks, the balance sheet (loans and deposits) *is* the revenue-earning product itself.
  - Interest expense is Cost of Goods Sold (COGS), rendering Enterprise Value (EV) and Unlevered Free Cash Flow (FCFF) conceptually inapplicable.
  - Capital capacity is legally dictated by regulatory Capital Adequacy Ratios (CAR / CET1), requiring Asset-Liability Management (ALM) spread modeling and regulatory DDM.

### 6. Institutional Revalued Net Asset Value (RNAV)
Engineered specifically for real estate developers like `PWON.JK`:
- **Direct Capitalization of Retail Malls & Hotels**: NOI capitalized at sector cap rates ($8.5\%$).
- **Land Bank Mark-to-Market (MTM)**: Revalues undeveloped land reserves from book value to market value ($IDR 4.5M/m^2$ vs $IDR 1.2M/m^2$ historical cost).
- **Presales Discounting**: Present value of unbilled property presales over 3-year delivery horizon.
- **Target RNAV per Share**: GAV less net debt, applying property holding-company conglomerate discounts ($25\%$).

### 7. 10,000-Run Vectorized Monte Carlo Simulation & VaR
Replaces static single-point estimates with probability distributions using NumPy:
- **Correlated Stochastic Parameters**: Revenue growth (Normal), EBITDA margin (Normal), WACC (Normal, $9.5\% \text{ to } 11.5\%$), and terminal $g$ (Normal, $1.0\% \text{ to } 2.0\%$).
- **Statistical Output**: Mean target price, median (P50), standard deviation, 95% Confidence Interval, P10 (Downside / Bear), P90 (Upside / Bull).
- **Value at Risk (VaR 95%)**: Downside risk relative to current market price.
- **Probability of Undervaluation**: Percentage of simulation runs where intrinsic value exceeds current market price ($P(\text{Target} > P_{\text{market}})$).
- **Dynamic 25-Bin Frequency Histogram**: Visualized via responsive SVG with mean and market price reference lines.

### 8. Economic Value Added (EVA®) & Market Value Added (MVA)
Stern Stewart & Co. value-based management framework:
- **Economic Profit Identity**: $\text{EVA}_t = \text{NOPAT}_t - (\text{WACC} \times \text{Invested Capital}_{t-1}) \equiv (\text{ROIC}_t - \text{WACC}) \times \text{Invested Capital}_{t-1}$.
- **10-Year Schedule**: Explicit schedule of NOPAT, Invested Capital, ROIC, Economic Spread, and EVA discounted at WACC.
- **Market Value Added (MVA)**: PV of future EVA + Invested Capital, measuring net enterprise wealth creation above invested capital.

### 9. Tornado Sensitivity Analysis & 5-Stage DuPont ROE Decomposition
- **Tornado Sensitivity**: Two-sided DCF sensitivity swings ($\pm 100 \text{ bps}$ on WACC, $g$, margins, growth, and exit multiples) sorted in descending order of valuation impact.
- **5-Stage DuPont ROE Decomposition**:
  $$\text{ROE} = \left(\frac{\text{Net Income}}{\text{EBT}}\right) \times \left(\frac{\text{EBT}}{\text{EBIT}}\right) \times \left(\frac{\text{EBIT}}{\text{Revenue}}\right) \times \left(\frac{\text{Revenue}}{\text{Assets}}\right) \times \left(\frac{\text{Assets}}{\text{Equity}}\right)$$
  Decomposes ROE into Tax Burden, Interest Burden, Operating Margin, Asset Turnover, and Financial Leverage, benchmarked against Indonesian property sector averages.

### 10. Universal Ticker Ingestion & Statement Normalization
In addition to the pre-calibrated `PWON.JK` benchmark and property universe, analysts can type **any** ticker into the header bar or Screener card (e.g. `BBCA.JK`, `TLKM.JK`, `BMRI.JK`, `UNVR.JK`, `ICBP.JK`). The system queries `yfinance`, extracts audited balance sheets, income statements, cash flows, beta, shares, and current prices, normalizes currency units, and integrates the stock directly into the terminal.

### 11. 10-Year Explicit Forecasts, Auto-Fade & Damodaran Boundaries
Explicit controls for all 10 periods:
- **Phase 1 (Years 1–5)**: High-growth operational roll-forward.
- **Phase 2 (Years 6–10)**: Macroeconomic transition & fade.
- **Auto-Fade Helper**: Automatically applies linear interpolation:
  $$\Delta g = \frac{g_5 - g_{\text{terminal}}}{5}, \quad g_t = g_5 - \Delta g \times (t - 5) \quad \text{for } t \in [6, 10]$$
- **Amateur Financier Warning**: Flags a Damodaran boundary error if an analyst attempts to run Year 10 growth above long-term Indonesian GDP ($5.0\%$) into terminal perpetuity.

### 12. Formula-Active 6-Sheet Microsoft Excel Export with Live Assumption Parity
Generates institutional `.xlsx` workbooks via `openpyxl` with dynamic, uppercase Excel formulas:
- **Assumption Parity**: Downloaded workbooks dynamically incorporate any custom 10-year growth or margin assumptions selected in the UI.
- **Sheet 1: `Executive Summary`**: Valuation matrix, KPI cards, and methodology football field.
- **Sheet 2: `10Y Pro Forma DCF`**: Explicit FCFF schedules with dynamic Excel formulas (`=B1*(1+B2)`, `=SUM(B3:B10)`).
- **Sheet 3: `3-Statement Model`**: Full 10-year IS, BS, and CFS articulation with live zero-balance check rows.
- **Sheet 4: `Property Comps`**: Peer multiple benchmarks (EV/EBITDA, P/E, P/B).
- **Sheet 5: `RIM & DDM`**: Economic profit schedules, dividend discount schedules, and terminal values.
- **Sheet 6: `Audit & Sensitivity`**: 5x5 WACC vs $g$ sensitivity matrix and LaTeX proof summaries.

### 13. Institutional Footer, Academic Co-Branding & Dedicated Pages
- **Persistent Viewport Footer**: Multi-column institutional directory rendered across all workspace screens.
- **Academic Co-Branding**: Features the **VALUEX** platform logo alongside the **University Crest** (`/static/img/university_logo.png`) and **MM6026 Course Logo** (`/static/img/course_logo.png`).
- **Dedicated "About Us" Workspace (`⌘9`)**: Comprehensive presentation of the MM6026 Digital Business Valuation project in the Master of Business Administration (MBA) program at SBM ITB, multi-model triangulation methodology, pure Python / React 18 architecture, and Executive Author Profile.
- **Dedicated "Contact Author" Workspace (`⌘0`)**: Direct inquiry form with asynchronous dispatch, unique reference ID generation (`#VALUEX-XXXXX`), campus coordinates, valuation FAQ accordion, direct author email, and social connection channels.

---

## 👤 Author Profile & Engineering Pedigree

The VALUEX platform was conceptualized, engineered, and calibrated by:

### **Ahmad Farhan (Abas)**
*Engineering Physics (ITS) • MBA Candidate, Finance (SBM ITB)*

Operating at the intersection of quantitative rigor and financial analysis, Ahmad Farhan engineered this platform to simplify and streamline core business valuation frameworks—translating complex multi-stage discounted cash flows, 10-year articulated financial modeling, and intrinsic valuation theories into an intuitive, accessible tool for students, equity analysts, and finance practitioners.

#### Connect & Feedback Channels:
- **LinkedIn**: [linkedin.com/in/afenterprisefarhan](https://www.linkedin.com/in/afenterprisefarhan)
- **GitHub**: [@celeebi (github.com/celeebi)](https://github.com/celeebi)
- **Instagram**: [@abas.space (instagram.com/abas.space)](https://instagram.com/abas.space)
- **Personal Email**: [`afenterprisefarhan@gmail.com`](mailto:afenterprisefarhan@gmail.com)
- **University Email**: [`29125329@mahasiswa.itb.ac.id`](mailto:29125329@mahasiswa.itb.ac.id)
- **Campus Coordinates**: School of Business and Management, Institut Teknologi Bandung (SBM ITB), Jl. Ganesha No. 10, Bandung, Indonesia.

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
│   • Cascading Dynamic Recalculation on Assumption Changes   │
│   • Exact Zero-Balance Validation (Assets = Liab + Equity)  │
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
(Live 10-Yr Recalc & Scope Rationale)      (Full Assumption Parity)
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
│   ├── app_react.jsx               # VALUEX Terminal application (8 workflow views, Donut chart, 10 subtabs, Author bio)
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
│       ├── exporter.py             # 6-sheet formula-active Excel (.xlsx) exporter with assumption parity
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
    └── test_api_endpoints.py       # Starlette REST API endpoints, pro forma recalculation & Excel parity tests
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
To verify all financial engines, 3-statement balance checks, advanced models, Excel export parity, and REST API endpoints:
```powershell
.\.venv\Scripts\pytest.exe -v
```
Expected output: **34 passed in ~3.5s** (100% pass rate).

---

## 🛡️ Git Branching & Safety Policy

| Branch / Tag | Status | Description | Anchor Commit |
| :--- | :--- | :--- | :--- |
| **`latest`** ⭐ | **Active / Default** | Most up-to-date production branch: Pro forma 3-statement dynamic recalculator, Excel assumption parity, DCF currency scaling fix, non-banking scope rationale, Author profile (Ahmad Farhan - Abas), Instagram integration, and 34 passed tests. | `019212c` |
| **`main`** | **Backup (Checkpoint)** | Safe original anchor checkpoint containing verified baseline 4-way valuation models and Excel exporter. | `36a99e3` |
| **`develop`** | **Backup (Baseline)** | Prior development baseline containing the initial VALUEX Terminal and Universal Ticker Search. | `67dd6d9` |
| **`develop_further`** | Preserved on Remote | Preserved historical development branch. | `3bb1328` |
| **`v1.0-checkpoint`** (Tag) | Fixed Tag | Checkpoint tag anchored to `36a99e3` for instant rollback safety. | `36a99e3` |

To switch back to the stable backup checkpoint at any time:
```powershell
git checkout main
# or
git checkout v1.0-checkpoint
```

---

## 📄 License & Academic Disclosure

- **Degree Program:** Master of Business Administration (MBA)
- **Course:** MM6026 Digital Business Valuation  
- **Institution:** School of Business and Management, Institut Teknologi Bandung (SBM ITB)
- **License:** MIT License. See [`LICENSE`](file:///c:/Users/Public/Documents/Project%20BA/LICENSE) for terms.  
- **Academic AI Disclosure:** All AI assistance utilized in constructing and verifying this platform complies with institutional academic standards. See [`AI_DISCLOSURE.md`](file:///c:/Users/Public/Documents/Project%20BA/AI_DISCLOSURE.md).
