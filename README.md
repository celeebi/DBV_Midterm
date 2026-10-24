# 🏛️ VALUEX | Institutional Digital Business Valuation Platform
### MM6026 Digital Business Valuation — Master of Business Administration (MBA)
**School of Business and Management, Institut Teknologi Bandung (SBM ITB)**  
*Engineered for Indonesian Equities Listed on the Indonesia Stock Exchange (IDX)*

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests: 92 Passed](https://img.shields.io/badge/Tests-92%20Passed-brightgreen.svg)](tests/)
[![Architecture: Clean Modular](https://img.shields.io/badge/Architecture-Clean%20Modular-orange.svg)](src/)
[![Indonesian IDX Benchmark](https://img.shields.io/badge/IDX%20Universe-110%20Pre--Cached%20Emiten-informational.svg)](data/idx_cache/)
[![Git Branch: develop_further](https://img.shields.io/badge/Branch-develop__further-blueviolet.svg)](https://github.com/celeebi/DBV_Midterm/tree/develop_further)

An institutional-grade equity research, multi-model valuation triangulation, and 10-year 3-statement financial modeling platform engineered specifically for companies listed on the Indonesia Stock Exchange (**IDX**).

The platform pairs a high-performance **Python Starlette/Uvicorn backend** with a **zero-Node.js/npm React 18 frontend** (the **VALUEX Terminal**). Default benchmarked to **PT Pakuwon Jati Tbk (`PWON.JK`)** and a curated universe of **110 top non-financial IDX equities across 11 industry sectors**, the platform features:
- **Universal Ticker Search & Fast Ingestion** from IDX XBRL and Yahoo Finance with intelligent banking ALM scope guards.
- **Pre-Cached 110 Non-Financial Universe** with instant **~5ms response times** and guaranteed zero-balance identity.
- **Explicit Data Provenance Markings** distinguishing official IDX XBRL filings from harmonized Yahoo Finance data.
- **12-Month Target Price Cone & Football Field Toggle** with strict monotonic scenario ordering ($\text{BEAR} < \text{BASE} < \text{BULL}$).
- **Dynamic 10-Year 3-Statement Financial Modeling** with live cascading recalculations and exact zero-balance checks ($\text{Assets} \equiv \text{Liabilities} + \text{Equity}$).
- **Multi-Model Valuation Triangulation** with an interactive SVG Weight Donut supporting 0% weight allocations and dynamic KaTeX mathematical proofs.
- **Advanced Institutional Models**: Revalued Net Asset Value (**RNAV**), 10,000-run **Monte Carlo Simulation** with 95% VaR, Economic Value Added (**EVA®**) & MVA, **Tornado Sensitivity Analysis**, and **5-Stage DuPont ROE Decomposition**.
- **Formula-Active 6-Sheet Microsoft Excel Export (`.xlsx`)** with dynamic uppercase Excel formulas and complete assumption parity.

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [The 8 Institutional Workflow Tabs](#-the-8-institutional-workflow-tabs)
- [Key Analytical & Modeling Capabilities](#-key-analytical--modeling-capabilities)
  - [1. Universal Ingestion & Pre-Cached 110 Universe](#1-universal-ingestion--pre-cached-110-universe)
  - [2. Explicit Data Provenance Markings (IDX vs Yahoo Finance)](#2-explicit-data-provenance-markings-idx-vs-yahoo-finance)
  - [3. 12-Month Target Price Cone & Milestone Trajectory](#3-12-month-target-price-cone--milestone-trajectory)
  - [4. Dynamic 10-Year 3-Statement Financial Model](#4-dynamic-10-year-3-statement-financial-model)
  - [5. Corporate Finance Scope vs Banking ALM Guard](#5-corporate-finance-scope-vs-banking-alm-guard)
  - [6. Multi-Model Valuation Triangulation & Weight Donut](#6-multi-model-valuation-triangulation--weight-donut)
  - [7. Fundamental CAPM & Cost of Capital Modeler](#7-fundamental-capm--cost-of-capital-modeler)
  - [8. Institutional RNAV for Real Estate Developers](#8-institutional-rnav-for-real-estate-developers)
  - [9. 10,000-Run Vectorized Monte Carlo Simulation & VaR](#9-10000-run-vectorized-monte-carlo-simulation--var)
  - [10. Economic Value Added (EVA®) & MVA Engine](#10-economic-value-added-eva--mva-engine)
  - [11. Tornado Sensitivity & 5-Stage DuPont ROE](#11-tornado-sensitivity--5-stage-dupont-roe)
  - [12. Formula-Active 6-Sheet Excel Exporter](#12-formula-active-6-sheet-excel-exporter)
  - [13. Step-by-Step KaTeX LaTeX Mathematical Proofs](#13-step-by-step-katex-latex-mathematical-proofs)
- [Pre-Cached 110 IDX Universe Breakdown](#-pre-cached-110-idx-universe-breakdown)
- [Author Profile & Engineering Pedigree](#-author-profile--engineering-pedigree)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1-Click Launch (Windows)](#1-click-launch-windows)
  - [Command-Line Execution](#command-line-execution)
  - [Running Automated Unit Tests](#running-automated-unit-tests)
  - [Re-Running Pre-Caching Utility](#re-running-pre-caching-utility)
- [Git Branching & Safety Policy](#-git-branching--safety-policy)
- [License & Academic Disclosure](#-license--academic-disclosure)

---

## 🌟 Executive Overview

```mermaid
flowchart TD
    subgraph Data_Layer ["Data Ingestion & Normalization Layer"]
        IDX["Official IDX XBRL Scraper\n(idx.co.id/primary/ListedCompany)"]
        CB["Cloudflare Fast-Fail\nCircuit Breaker (<300ms)"]
        YF["Universal Statement Harmonizer\n(yfinance Fallback Ingestion)"]
        FX["Bank Indonesia Historical FX Engine\n(USD to IDR Conversion)"]
        Cache[("Pre-Cached Universe Cache\n110 Emiten / 151 Files (data/idx_cache/)")]
        
        IDX -->|Cloudflare 403 Challenge| CB
        CB -->|Instant Fallback| YF
        YF --> FX
        FX --> Cache
        IDX -->|Audit Filing Parsed| Cache
    end

    subgraph Modeling_Layer ["Quantitative Modeling & Valuation Engines"]
        PF["10-Year Pro Forma Roll-Forward\n(Years 1-5 Explicit, Years 6-10 Fade)"]
        ThreeStmt["10-Year 3-Statement Model\n(IS, BS, CFS with Zero-Balance Check)"]
        CAPM["Fundamental CAPM & WACC Modeler\n(Rf, Beta, Mature ERP, Damodaran CRP, Kd, Wd)"]
        
        DCF["Multi-Stage DCF / FCFF Engine\n(Gordon Growth & Exit Multiple TV)"]
        Comps["Relative Comps Matrix\n(EV/EBITDA, P/E, P/B)"]
        RIM["Residual Income Model (RIM)\n(Clean Surplus ROE Spread)"]
        DDM["Dividend Discount Model (DDM)\n(10-Year Dividend Schedule)"]
        RNAV["Revalued Net Asset Value (RNAV)\n(GAV, Land Bank MTM, Conglomerate Discount)"]
        MC["Monte Carlo Simulation\n(10,000 Runs, VaR 95%, Frequency Histogram)"]
        EVA["Economic Value Added (EVA®) & MVA\n(NOPAT - Capital Charge 10Y Schedule)"]
        Tornado["Tornado Sensitivity Analysis\n(Two-Sided Impact Swing Ranking)"]
        DuPont["5-Stage DuPont ROE Decomposition\n(Operating, Financing, Tax Decomposed)"]
        Scenarios["Scenario Forecaster\n(Monotonic BEAR < BASE < BULL)"]
        
        Cache --> PF
        PF --> ThreeStmt
        ThreeStmt --> CAPM
        CAPM --> DCF & Comps & RIM & DDM & RNAV & MC & EVA & Tornado & DuPont & Scenarios
    end

    subgraph Presentation_Layer ["VALUEX React 18 Terminal (Zero npm/Node.js)"]
        UI1["⌘1 Dashboard\n(Market Dislocation Bar Chart & Signals)"]
        UI2["⌘2 Screener\n(Universal Search & Liquidity Presets)"]
        UI3["⌘3 Valuation Workspace\n(Target Price Cone Toggle & 10 Methodology Subtabs)"]
        UI4["⌘4 3-Statement Model\n(Forecast vs Audited Actuals Toggle & Provenance Marks)"]
        UI5["⌘5 Assumptions\n(10-Yr Sliders, Auto-Fade, Interactive Weight Donut)"]
        UI6["⌘6 Order Ticket (EMS)\n(100-Share IDX Lots & Investment Memo)"]
        UI7["⌘7 Watchlist & Comps\n(Peer Multiples & Fundamental Comparison)"]
        UI8["⌘8 Research Tear Sheet\n(Print PDF & Active Formula Excel Export)"]
        UI9["⌘9 About Platform & ⌘0 Contact Author"]
        
        DCF & Comps & RIM & DDM & RNAV & MC & EVA & Tornado & DuPont & Scenarios --> Presentation_Layer
    end
```

Every number shown across the VALUEX Terminal is backed by rigorous pure-Python mathematical routines. There is zero mock data, zero financial hallucination, and full accounting consistency.

---

## 🏛 System Architecture

The project adheres to a clean, decoupled architecture:

```
[ External Data Providers ]
  ├── Indonesia Stock Exchange (IDX XBRL API)
  ├── Bank Indonesia (10Y Sovereign Yield, BI-Rate, Historical FX)
  └── Yahoo Finance (Audited Filings, Equity Beta, Live Market Prices)
                    ↓
[ Ingestion & Harmonization Pipeline (src/data/) ]
  ├── loader.py              → Universal statement normalizer & loader
  ├── adapters/idx_adapter.py → Official IDX XBRL adapter & cache router
  └── adapters/idx_scraper/  → Multi-year XBRL scraper with fast-fail circuit breaker
                    ↓
[ Core Valuation & Financial Modeling Engines (src/models/) ]
  ├── three_statement.py     → 10-year articulated IS, BS, CFS with zero-balance checks
  ├── pro_forma.py           → Explicit growth schedules & linear auto-fade
  ├── parameters.py          → Capital structure WACC & fundamental CAPM
  ├── dcf.py                 → Multi-stage FCFF discounted cash flow engine
  ├── multiples.py           → Relative peer multiple valuation (EV/EBITDA, P/E, P/B)
  ├── rim.py                 → Residual Income Model (clean surplus framework)
  ├── ddm.py                 → Multi-stage Dividend Discount Model
  ├── rnav.py                → Property Revalued Net Asset Value (GAV + Land MTM)
  ├── monte_carlo.py         → 10,000-run vectorized Monte Carlo simulation
  ├── eva.py                 → Stern Stewart EVA® & Market Value Added (MVA)
  ├── ensemble.py            → Configurable multi-model triangulation
  └── scenarios.py           → Monotonic Bear / Base / Bull scenario forecaster
                    ↓
[ Analytics, Risk & Exporters (src/analytics/, src/rules/) ]
  ├── tornado.py             → Two-sided parameter sensitivity swing ranking
  ├── dupont.py              → 5-stage DuPont ROE decomposition
  ├── exporter.py            → 6-sheet formula-active Microsoft Excel exporter
  ├── recommendations.py     → Margin-of-safety recommendation engine (BUY/HOLD/SELL)
  └── sanity_checks.py       → Damodaran boundary enforcement (g < GDP, WACC constraints)
                    ↓
[ Asynchronous REST API (server.py) ]
  ├── /api/recalculate       → Real-time full-model recalculation
  ├── /api/company           → Single ticker ingestion & metadata extraction
  ├── /api/coverage          → Universe coverage overview
  └── /api/export/excel      → Live custom assumption Excel export
                    ↓
[ VALUEX Terminal (static/app_react.jsx, static/index.html) ]
  └── Zero Node.js / zero npm React 18 frontend with Tailwind CSS, Lucide & KaTeX
```

---

## 🖥️ The 8 Institutional Workflow Tabs

1. **Top Live Market Ribbon & Real Estate Wire**:
   - Real-time ticker tape displaying `PWON.JK` and property peers (`BSDE`, `CTRA`, `SMRA`, `ASII`) alongside macroeconomic benchmarks: `IHSG (7,785)`, `ID 10Y Yield (6.60%)`, `USD/IDR (16,400)`, `BI 7-Day Repo (6.00%)`, and `IDX Property Index (824.50)`.
   - Streaming wire toggle (`[● LIVE FEED] / [❚❚ PAUSED]`) with rotating research bulletins.
2. **`⌘1` Executive Dashboard**:
   - Coverage market capitalization summary, average upside, and recommendation distribution.
   - **Market Dislocation Chart**: Horizontal bar chart comparing current market price against composite fair value with BUY hurdle reference line (+15%).
3. **`⌘2` Company Screener (Discovery)**:
   - Filter by recommendation signal (`BUY`, `HOLD`, `SELL`) and sort by upside, market cap, or ticker.
   - **Universal Ticker Search & Ingestion Card**: Input any IDX ticker (e.g. `ICBP`, `TLKM`, `ASII`, `ADRO`, `BBCA`) with instant sector and scope feedback.
4. **`⌘3` Valuation Workspace**:
   - **Target Price Cone Toggle**: Instant switch between the **12-Month Target Price Cone** (with historical 5-year trajectory and shaded Bull/Base/Bear scenarios) and the **Valuation Methodology Football Field**.
   - **10 Methodology Sub-Tabs**:
     - **Tab 1: Multi-Stage DCF**: 10-year FCFF pro forma schedule ($\Delta\text{NWC}$, Discount Factors, PV of FCFF) + Enterprise-to-Equity bridge.
     - **Tab 2: Peer Comps**: EV/EBITDA, P/E, P/B peer matrix with subject comparisons.
     - **Tab 3: Residual Income Model (RIM)**: Book value equity + PV of economic profits schedule.
     - **Tab 4: Dividend Discount Model (DDM)**: 10-year explicit dividend schedule + Gordon Growth terminal value.
     - **Tab 5: Revalued Net Asset Value (RNAV)**: Property GAV breakdown, NOI capitalization, land bank mark-to-market, and conglomerate discount.
     - **Tab 6: Monte Carlo DCF**: 10,000-run simulation, VaR 95%, P10/P50/P90 distributions, and SVG frequency histogram.
     - **Tab 7: Economic Value Added (EVA®)**: NOPAT, Invested Capital, ROIC vs WACC economic spread, 10-year EVA schedule, and MVA.
     - **Tab 8: 5x5 WACC Sensitivity**: Matrix heatmap across WACC (9.42%–11.42%) vs $g$ (1.0%–2.0%).
     - **Tab 9: Tornado & DuPont**: Two-sided sensitivity swing ranking + 5-stage DuPont ROE decomposition.
     - **Tab 10: Step-by-Step KaTeX Proofs**: Substituted mathematical proof derivations rendered in KaTeX LaTeX.
5. **`⌘4` 3-Statement Financial Model**:
   - **View Mode Toggle**: Switch between **10-Year Pro Forma Forecast (2026E–2035E)** and **Audited Multi-Year Actuals (2021A–2025A)**.
   - Dedicated statement selector: Balance Sheet, Income Statement, Cash Flow Statement, and Operational Drivers.
   - **Zero-Balance Check Row**: Proves $\text{Assets} - (\text{Liabilities} + \text{Equity}) \equiv \text{IDR } 0.00$ with green checkmark across every period.
   - **Data Provenance Mark**: Explicit badge and banner declaring whether data originated from **IDX Official XBRL** or **Yahoo Finance Harmonized**.
6. **`⌘5` Model Assumptions & Parameter Editor**:
   - **Phase 1: Explicit High Growth (Years 1–5)**: 5 individual sliders/inputs for high-growth explicit period.
   - **Phase 2: Transition & Fade Phase (Years 6–10)**: 5 individual sliders/inputs for transition period.
   - **⚡ Auto-Fade Helper (Y6–Y10)**: Linearly fades Year 5 growth into terminal $g$ ($1.5\%$).
   - **⚡ "Recalculate Pro Forma" Engine**: Instant dynamic cascade updating all 3 statements and valuation outputs.
   - **Damodaran Boundary Alert**: Flags if Year 10 growth is set higher than sustainable GDP ($5.0\%$) or WACC.
   - **Fundamental CAPM Modeler**: Sliders and inputs for Beta ($\beta$), Risk-Free Rate ($R_f$), Mature Market ERP, Country Risk Premium (CRP), Pre-tax Cost of Debt ($K_d$), Debt Weight ($W_d$), and Tax Rate ($t$).
   - **Interactive Weight Donut Chart**: Full support for setting any model weight to `0%` cleanly, with one-click presets (`50/50 DCF & RIM`, `100% DCF`, `4-Way Triangulation`, `Equal Weight`).
7. **`⌘6` Buy / Sell Decision Workspace**:
   - Investment thesis pillars, catalyst monitoring, and downside risk assessment.
   - Portfolio Committee decision parameters (Entry/Exit targets, holding horizon, analyst memo).
   - **Simulated Order Ticket (EMS Preview)**: Standard **IDX 100-share lot** quantity input, limit price, and gross notional calculation.
8. **`⌘7` Watchlist & Comps Matrix**:
   - Fundamental watchlist with side-by-side multiple and growth benchmarking.
9. **`⌘8` Research Report Tear Sheet**:
   - Investment banking equity research report layout.
   - **"Print / Save PDF"** button (invoking `@media print` clean report layout).
   - **"Download Excel Model (.xlsx)"** button with dynamic assumption parity.
10. **Dedicated Pages**:
    - **`⌘9` About Platform**: MM6026 Digital Business Valuation project details (SBM ITB), methodology pillars, non-banking scope rationale, and Executive Author Profile.
    - **`⌘0` Contact Author**: Interactive inquiry form, unique reference ID generator (`#VALUEX-XXXXX`), campus coordinates, author email, and social channels.
11. **Persistent "Inspector 🔍" KaTeX Flyout Drawer**:
    - Slides out KaTeX LaTeX equations with substituted figures for WACC, Terminal Value, Enterprise Bridge, DDM, and Triangulation from any screen.

---

## 📐 Key Analytical & Modeling Capabilities

### 1. Universal Ingestion & Pre-Cached 110 Universe
The platform provides a dual-engine data ingestion architecture:
- **Pre-Cached 110 Universe**: Multi-year audited statements for **110 top non-financial IDX equities** (151 total files) pre-cached in `data/idx_cache/` that load in **3 to 10 milliseconds**.
- **Universal On-The-Fly Ingestion**: Typing any arbitrary IDX ticker into the header or screener automatically queries live audited filings, converts multi-currency statements (e.g. natural resources reporting in USD) to IDR via Bank Indonesia exchange rates, maps line items to standardized PSAK schemas, and auto-caches them locally.
- **Cloudflare Fast-Fail Circuit Breaker**: If the raw IDX scraper encounters Cloudflare Turnstile blocks (`HTTP 403`), it trips in under 300ms and engages the Universal Statement Harmonizer, eliminating long scraper freezes.

### 2. Explicit Data Provenance Markings (IDX vs Yahoo Finance)
To ensure complete institutional transparency, every screen and sub-table displays explicit marks indicating data provenance:
- **IDX Official XBRL**: Displays an emerald badge `SOURCE: IDX.CO.ID (XBRL)` or `DATA: IDX XBRL`.
- **Yahoo Finance Harmonized**: Displays an amber/gold badge `SOURCE: YAHOO FINANCE` or `DATA: YAHOO FINANCE`.
- Visible across the **Top Company Header**, the **Show Historical Actuals Toggle Button**, the **Historical Statements Banner**, and the **Sub-Table First-Column Headers** (`[IDX XBRL]` vs `[YAHOO FINANCE]`).

### 3. 12-Month Target Price Cone & Milestone Trajectory
Visualizes 5-year historical price action against the Jakarta Composite Index (JCI) alongside forward scenario projections:
$$\text{Trajectory Split: } 77\% \text{ Historical Actuals (Feb 2021 – Oct 2026)} \quad \longleftrightarrow \quad 23\% \text{ Forward 12M Scenario Cone}$$
- Shaded green-to-slate cone expanding from current market price to **BULL TP**, **BASE TP**, and **BEAR TP**.
- Strict monotonic ordering enforced: $\text{BEAR TP} < \text{BASE TP} < \text{BULL TP}$.
- Interactive toggle button allows switching between the **Target Price Cone** and the **Valuation Methodology Football Field** without leaving the view.

### 4. Dynamic 10-Year 3-Statement Financial Model
Full mathematical articulation across Income Statement, Balance Sheet, and Cash Flow Statement:
- **Cascading Recalculation Engine**: Modifying growth or margin assumptions cascades through all three statements:
  - **Income Statement**: Revenue, EBITDA, EBIT, and Net Income dynamically update.
  - **Balance Sheet**: Net Income flows into Retained Earnings; CapEx and Depreciation update Net PP&E; Cash acts as the dynamic liquidity plug.
  - **Cash Flow Statement**: CFO, CFI, and CFF update in exact balance with $\Delta\text{Cash}$.
- **Zero-Balance Identity**: Proves:
  $$\text{Total Assets} \equiv \text{Total Liabilities} + \text{Total Equity} + \text{Minority Interest} \quad (\text{balance\_check} = 0.00)$$

### 5. Corporate Finance Scope vs Banking ALM Guard
The platform enforces a strict methodology guard:
- **In-Scope: Non-Financial Corporates**: Demand-driven value creation ($P \times Q \rightarrow \text{Revenue} \rightarrow \text{Net Income} \rightarrow \text{FCFF}$) with physical working capital (DSO/DIO/DPO) and leverage-independent operating metrics (EBITDA).
- **Out-of-Scope: Commercial Banks & Financial Institutions**: Searching tickers like `BBCA`, `BBRI`, `BMRI`, or `BBNI` triggers an educational guard modal. Because commercial banks treat debt and deposits as their core revenue-earning product, Enterprise Value (EV) and Unlevered Free Cash Flow (FCFF) are mathematically inapplicable, requiring regulatory Asset-Liability Management (ALM) modeling and Basel III / OJK Capital Adequacy Ratio (CAR) constraints.

### 6. Multi-Model Valuation Triangulation & Weight Donut
The platform computes a composite fair value from configurable weights:
$$\text{Composite Target} = \sum_{m \in \{\text{DCF}, \text{Comps}, \text{RIM}, \text{DDM}\}} w_m \cdot P_m \quad \text{where } \sum w_m = 100\%$$
- **0% Weight Flexibility**: Setting any model weight to `0%` cleanly zeroes its contribution without numeric errors or resets.
- **Interactive SVG Donut**: Slices update in real-time with responsive tooltips and color matching.
- **Dynamic KaTeX Proofs**: Substituted mathematical derivations automatically suppress zero-weighted methods and display active allocations.

### 7. Fundamental CAPM & Cost of Capital Modeler
Replaces single opaque WACC inputs with institutional bottom-up capital structure modeling:
- **Equity Beta ($\beta$)**: Sourced from 5-year regression against the IHSG with sector baselines.
- **Risk-Free Rate ($R_f$)**: Bank Indonesia 10-Year Sovereign Bond Yield (`INDOGB 10Y`: $6.60\%$).
- **Mature Market ERP & Damodaran Country Risk Premium (CRP)**: Decomposed into mature equity premium ($5.00\%$) and Indonesian sovereign default/volatility premium ($2.16\%$).
- **Cost of Debt ($K_d$)**: Pre-tax borrowing rate ($6.50\%$) with tax shield: $K_{d,\text{after}} = K_d \times (1 - 22.0\% \text{ Tax}) = 5.07\%$.
- **Interactive Data Provenance Notes (`[ⓘ]`)**: Dark-mode popovers beside every parameter explaining sources, citations, and valuation sensitivities.

### 8. Institutional RNAV for Real Estate Developers
Tailored for Indonesian property developers (`PWON`, `BSDE`, `CTRA`, `SMRA`):
- **Direct Capitalization of Retail Malls & Hotels**: Net Operating Income (NOI) capitalized at market cap rates ($8.5\%$).
- **Land Bank Mark-to-Market (MTM)**: Undeveloped land reserves revalued from historical book value to market value ($IDR 4.5M/m^2$ vs $IDR 1.2M/m^2$).
- **Presales Discounting**: Present value of unbilled property presales over delivery horizon.
- **Target RNAV per Share**: Gross Asset Value (GAV) less net debt, applying holding-company conglomerate discounts ($25\%$).

### 9. 10,000-Run Vectorized Monte Carlo Simulation & VaR
Replaces single-point estimates with statistical probability distributions using NumPy:
- **Stochastic Parameters**: Correlated sampling of revenue growth, EBITDA margin, WACC ($9.5\% \text{ to } 11.5\%$), and terminal $g$ ($1.0\% \text{ to } 2.0\%$).
- **Statistical Outputs**: Mean target price, median (P50), standard deviation, 95% Confidence Interval, P10 (Bear), P90 (Bull).
- **Value at Risk (VaR 95%)**: Downside risk relative to current market price.
- **Probability of Undervaluation**: Percentage of runs where intrinsic value exceeds current market price ($P(\text{Target} > P_{\text{market}})$).
- **SVG Frequency Histogram**: Visualized with market price and mean reference lines.

### 10. Economic Value Added (EVA®) & MVA Engine
Stern Stewart & Co. value-based management framework:
- **Economic Profit Identity**:
  $$\text{EVA}_t = \text{NOPAT}_t - (\text{WACC} \times \text{Invested Capital}_{t-1}) \equiv (\text{ROIC}_t - \text{WACC}) \times \text{Invested Capital}_{t-1}$$
- **10-Year Schedule**: NOPAT, Invested Capital, ROIC, Economic Spread, and EVA discounted at WACC.
- **Market Value Added (MVA)**: Present value of future EVA plus Invested Capital.

### 11. Tornado Sensitivity & 5-Stage DuPont ROE
- **Tornado Sensitivity**: Two-sided DCF sensitivity swings ($\pm 100 \text{ bps}$ on WACC, $g$, margins, growth, exit multiples) ranked in descending order of valuation impact.
- **5-Stage DuPont ROE Decomposition**:
  $$\text{ROE} = \left(\frac{\text{Net Income}}{\text{EBT}}\right) \times \left(\frac{\text{EBT}}{\text{EBIT}}\right) \times \left(\frac{\text{EBIT}}{\text{Revenue}}\right) \times \left(\frac{\text{Revenue}}{\text{Assets}}\right) \times \left(\frac{\text{Assets}}{\text{Equity}}\right)$$
  Decomposes ROE into Tax Burden, Interest Burden, Operating Margin, Asset Turnover, and Financial Leverage, benchmarked against Indonesian sector averages.

### 12. Formula-Active 6-Sheet Excel Exporter
Generates institutional `.xlsx` workbooks via `openpyxl` with dynamic, uppercase Excel formulas:
- **Live Assumption Parity**: Downloaded workbooks reflect any custom growth or margin assumptions selected in the terminal.
- **Sheet 1: `Executive Summary`**: Valuation matrix, KPI cards, and methodology football field.
- **Sheet 2: `10Y Pro Forma DCF`**: Explicit FCFF schedules with dynamic Excel formulas (`=B1*(1+B2)`, `=SUM(B3:B10)`).
- **Sheet 3: `3-Statement Model`**: Full 10-year IS, BS, and CFS articulation with live zero-balance check rows.
- **Sheet 4: `Property Comps`**: Peer multiple benchmarks (EV/EBITDA, P/E, P/B).
- **Sheet 5: `RIM & DDM`**: Economic profit schedules, dividend discount schedules, and terminal values.
- **Sheet 6: `Audit & Sensitivity`**: 5x5 WACC vs $g$ sensitivity matrix and mathematical proof summaries.

### 13. Step-by-Step KaTeX LaTeX Mathematical Proofs
Dedicated mathematical proof engine that renders substituted formulas for:
- WACC Capital Asset Pricing Model derivation.
- Gordon Growth and Exit Multiple Terminal Value derivations.
- Enterprise-to-Equity Bridge calculation.
- 10-Year DDM dividend aggregation.
- RNAV Net Asset Value bridge.
- Multi-Model Triangulation weighted composite target.

---

## 📊 Pre-Cached 110 IDX Universe Breakdown

The repository ships with **110 pre-cached, audited non-financial equities** in [`data/idx_cache/`](data/idx_cache/) (151 total files, under 2 MB), providing instant load times out of the box:

| Sector | Count | Tickers Pre-Cached |
| :--- | :---: | :--- |
| **Consumer Staples** | 23 | `ICBP`, `INDF`, `UNVR`, `KLBF`, `MYOR`, `CPIN`, `JPFA`, `CMRY`, `AMRT`, `MIDI`, `GGRM`, `HMSP`, `WIIM`, `ROTI`, `ULTJ`, `CLEO`, `STTP`, `AALI`, `LSIP`, `SIMP`, `DSNG`, `TAPG`, `SSMS`, `TBLA` |
| **Energy, Coal, Oil & Gas** | 18 | `ADRO`, `PTBA`, `ITMG`, `MEDC`, `AKRA`, `PGAS`, `HRUM`, `ESSA`, `INDY`, `BUMI`, `DOID`, `ENRG`, `ELSA`, `PGEO`, `BREN`, `MBMA`, `ARKO`, `RAJA` |
| **Real Estate & Construction** | 12 | `PWON`, `BSDE`, `CTRA`, `SMRA`, `ASRI`, `SSIA`, `DMAS`, `DILD`, `PTPP`, `WIKA`, `ADHI`, `TOTL` |
| **Telecommunications & Tech** | 11 | `TLKM`, `ISAT`, `EXCL`, `TOWR`, `TBIG`, `MTEL`, `GOTO`, `BUKA`, `MTDL`, `EMTK`, `SCMA`, `MNCN` |
| **Basic Materials, Cement & Paper** | 9 | `BRPT`, `TPIA`, `INTP`, `SMGR`, `INKP`, `TKIM`, `AVIA`, `AMMN`, `SMBR` |
| **Healthcare, Pharma & Hospitals** | 7 | `MIKA`, `HEAL`, `SILO`, `TSPC`, `PRDA`, `SAME`, `SIDO` |
| **Mining & Metals** | 7 | `ANTM`, `INCO`, `MDKA`, `TINS`, `NCKL`, `CITA`, `PSAB` |
| **Consumer Discretionary & Retail** | 7 | `ACES`, `MAPI`, `MAPA`, `MAPB`, `ERAA`, `RALS`, `LPPF` |
| **Industrials & Heavy Equipment** | 6 | `ASII`, `UNTR`, `AUTO`, `HEXA`, `DRMA`, `SMSM` |
| **Logistics, Shipping & Transport** | 5 | `BIRD`, `SMDR`, `ASSA`, `TMAS`, `PSSI` |
| **Infrastructure & Utilities** | 3 | `JSMR`, `POWR`, `KEEN` |
| **Total Universe** | **110** | **100% Audited, Zero-Balance Discrepancy, Instant Loading (~5ms)** |

---

## 👤 Author Profile & Engineering Pedigree

The VALUEX platform was conceptualized, engineered, and calibrated by:

### **Ahmad Farhan (Abas)**
*Engineering Physics (ITS) • MBA Candidate, Finance (SBM ITB)*

Operating at the intersection of quantitative engineering and financial modeling, Ahmad Farhan developed this platform to translate complex multi-stage discounted cash flows, 10-year articulated financial modeling, and intrinsic business valuation frameworks into an intuitive, accessible tool for students, equity analysts, and finance practitioners.

#### Connect & Research Feedback Channels:
- **LinkedIn**: [linkedin.com/in/afenterprisefarhan](https://www.linkedin.com/in/afenterprisefarhan)
- **GitHub**: [@celeebi (github.com/celeebi)](https://github.com/celeebi)
- **Instagram**: [@abas.space (instagram.com/abas.space)](https://instagram.com/abas.space)
- **Personal Email**: [`afenterprisefarhan@gmail.com`](mailto:afenterprisefarhan@gmail.com)
- **University Email**: [`29125329@mahasiswa.itb.ac.id`](mailto:29125329@mahasiswa.itb.ac.id)
- **Campus Coordinates**: School of Business and Management, Institut Teknologi Bandung (SBM ITB), Jl. Ganesha No. 10, Bandung, Indonesia.

---

## 📁 Repository Structure

```
Project BA/
├── run_app.bat                           # 1-Click Windows launcher (Starlette server @ localhost:8000)
├── create_desktop_shortcut.bat           # Windows desktop shortcut generator
├── server.py                             # High-performance asynchronous backend server (Starlette/Uvicorn)
├── app.py                                # Companion Streamlit interface
├── requirements.txt                      # Python dependencies (openpyxl, pandas, numpy, uvicorn, starlette, etc.)
├── README.md                             # Comprehensive institutional documentation
├── USER_GUIDE.md                         # Detailed terminal user manual
├── PLAN.md                               # Architectural execution roadmap
├── AI_DISCLOSURE.md                      # Academic AI disclosure and compliance statement
├── LICENSE                               # MIT License
├── data/
│   └── idx_cache/                        # 151 pre-cached audited statement files (110 IDX equities)
├── scripts/
│   └── precache_universe.py              # Automated batch pre-caching utility for top IDX universe
├── static/
│   ├── img/                              # Institutional co-branding and crest logos
│   │   ├── university_logo.png           # SBM ITB / University crest
│   │   └── course_logo.png               # MM6026 Digital Business Valuation course logo
│   ├── index.html                        # React 18 production shell (Tailwind CDN, Lucide, KaTeX)
│   ├── app_react.jsx                     # VALUEX Terminal (8 workflow views, Cone chart, 10 subtabs, Provenance)
│   ├── coverage_data.js                  # Initial property universe data (PWON, BSDE, CTRA, SMRA, ASII)
│   ├── index_legacy.html                 # Prior frontend backup
│   ├── app.js                            # Legacy vanilla JS controller
│   └── draft.tsx                         # Institutional design reference template
├── src/
│   ├── data/
│   │   ├── loader.py                     # Universal statement harmonizer, loader & banking scope guard
│   │   ├── coverage.py                   # Property universe metadata & defaults
│   │   ├── country_data.py               # Indonesian macroeconomic parameters (INDOGB 10Y, BI-Rate, Tax)
│   │   ├── normalizer.py                 # Statement standardization routines
│   │   └── adapters/
│   │       ├── idx_adapter.py            # Official IDX XBRL adapter, cache manager & USD conversion
│   │       └── idx_scraper/              # Reverse-engineered IDX XBRL multi-year financial scraper
│   │           ├── client.py             # HTTP client with Cloudflare fast-fail circuit breaker
│   │           ├── api.py                # IDX report query loops & payload extractors
│   │           ├── statement.py          # XBRL financial report parser
│   │           └── proforma/             # Statement normalization & financial ratio calculators
│   ├── models/
│   │   ├── three_statement.py            # Dynamic 10-year 3-statement model with zero-balance checks
│   │   ├── pro_forma.py                  # 10-year pro forma roll-forward & auto-fade generator
│   │   ├── parameters.py                 # Capital structure WACC & fundamental CAPM
│   │   ├── dcf.py                        # Multi-stage FCFF DCF model with dual terminal value
│   │   ├── multiples.py                  # Relative valuation peer multiples (EV/EBITDA, P/E, P/B)
│   │   ├── rim.py                        # Residual Income Model (clean surplus framework)
│   │   ├── ddm.py                        # Multi-stage Dividend Discount Model with Gordon Growth TV
│   │   ├── rnav.py                       # Revalued Net Asset Value (GAV, Land MTM, Conglomerate Discount)
│   │   ├── monte_carlo.py                # 10,000-run vectorized Monte Carlo simulation with 95% VaR
│   │   ├── eva.py                        # Stern Stewart Economic Value Added (EVA®) & MVA engine
│   │   ├── ensemble.py                   # Multi-model triangulation aggregator with 0% weight support
│   │   └── scenarios.py                  # Strictly monotonic Bear / Base / Bull scenario forecaster
│   ├── rules/
│   │   ├── sanity_checks.py              # Damodaran boundary constraints (g < GDP, WACC guardrails)
│   │   └── recommendations.py            # Margin-of-safety recommendation engine (BUY/HOLD/SELL)
│   └── analytics/
│       ├── tornado.py                    # Two-sided sensitivity swing ranking (Tornado diagram)
│       ├── dupont.py                     # 5-stage DuPont ROE decomposition with sector benchmarks
│       ├── exporter.py                   # Formula-active 6-sheet Microsoft Excel exporter (.xlsx)
│       ├── audit_trail.py                # LaTeX mathematical proof generator
│       ├── sensitivity.py                # 2D WACC vs g sensitivity matrix
│       └── visualizer.py                 # Plotly visualization engine
└── tests/
    ├── test_dcf_and_exporter.py          # DCF discounting math and active formula Excel tests
    ├── test_ddm.py                       # Multi-stage DDM, 4-way triangulation, and Excel export tests
    ├── test_pro_forma.py                 # 10-year pro forma roll-forward, WACC, and auto-fade tests
    ├── test_sanity_checks.py             # Terminal growth, negative multiple, and EV bridge tests
    ├── test_three_statement.py           # 10-year 3-statement articulation and zero-balance tests
    ├── test_rnav.py                      # RNAV GAV, land bank MTM, and target price tests
    ├── test_monte_carlo.py               # Monte Carlo 10k simulations, percentiles, and VaR tests
    ├── test_eva.py                       # EVA mathematical identity, 10Y schedule, and MVA tests
    ├── test_analytics_advanced.py        # Tornado sensitivity and DuPont identity tests
    ├── test_api_endpoints.py             # Starlette REST API endpoints, recalculation & Excel parity tests
    └── test_universal_pipeline_and_scenarios.py # Universal harmonizer, scenario ordering & provenance tests
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (tested on Python 3.10, 3.11, 3.12, 3.14).
- Standard web browser (Chrome, Edge, Firefox, Safari).
- **Zero Node.js / npm installation required**: The React 18 interface compiles and renders natively in the browser.

### 1-Click Launch (Windows)
Double-click [`run_app.bat`](run_app.bat) in the project directory. The script will:
1. Detect or initialize your local Python virtual environment (`.venv`).
2. Install any missing package dependencies from `requirements.txt`.
3. Launch the asynchronous Starlette valuation server at `http://localhost:8000`.
4. Open the VALUEX Terminal automatically in your default browser.

### Command-Line Execution
```powershell
# 1. Clone repository and navigate to folder
git clone https://github.com/celeebi/DBV_Midterm.git
cd "DBV_Midterm"

# 2. Activate Python virtual environment
.\.venv\Scripts\Activate.ps1

# 3. Start the VALUEX Terminal server (Port 8000)
python server.py

# 4. (Optional) Run the companion Streamlit interface (Port 8501)
streamlit run app.py
```
Open your browser to `http://localhost:8000`.

### Running Automated Unit Tests
To verify all valuation engines, 3-statement balance identities, scenario monotonicity, and REST API endpoints:
```powershell
.\.venv\Scripts\pytest.exe -v
```
Expected output: **92 passed in ~7.0s** (100% pass rate).

### Re-Running Pre-Caching Utility
To refresh or expand the pre-cached universe across all 110 prominent equities:
```powershell
python scripts/precache_universe.py
```
Statements will be harmonized, verified for zero-balance identity, and written to `data/idx_cache/`.

---

## 🛡️ Git Branching & Safety Policy

| Branch / Tag | Status | Description | Anchor Commit |
| :--- | :--- | :--- | :--- |
| **`develop_further`** ⭐ | **Active Production** | Current development branch: 110 pre-cached equities, explicit data provenance marks (IDX vs Yahoo Finance), 12M Target Price Cone toggle, monotonic scenarios, fast-fail circuit breaker, and 92 passed unit tests. | `c74c0f9` |
| **`latest`** | **Release Milestone** | Pre-caching baseline checkpoint with initial 34 unit tests. | `019212c` |
| **`main`** | **Stable Backup** | Safe anchor checkpoint containing verified baseline 4-way valuation models and Excel exporter. | `36a99e3` |
| **`develop`** | **Historical Baseline** | Prior development baseline containing initial VALUEX Terminal. | `67dd6d9` |
| **`v1.0-checkpoint`** (Tag) | Fixed Tag | Checkpoint tag anchored to `36a99e3` for instant rollback safety. | `36a99e3` |

To switch back to a previous stable checkpoint at any time:
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
- **License:** MIT License. See [`LICENSE`](LICENSE) for terms.  
- **Academic AI Disclosure:** All AI assistance utilized in constructing and verifying this platform complies with institutional academic standards. See [`AI_DISCLOSURE.md`](AI_DISCLOSURE.md).
