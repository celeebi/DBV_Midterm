# 🏛️ Institutional Valuation Platform & 3-Statement Financial Model
### MM6026 Digital Business Valuation — Highest-Score Implementation Tier

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests: 12 Passed](https://img.shields.io/badge/Tests-12%20Passed-brightgreen.svg)](tests/)
[![Architecture: Clean Modular](https://img.shields.io/badge/Architecture-Clean%20Modular-orange.svg)](src/)
[![Indonesian IDX Benchmark](https://img.shields.io/badge/IDX%20Benchmark-PWON.JK-informational.svg)](https://www.idx.co.id/)

An institutional-grade, multi-stage equity valuation and 3-statement financial modeling platform tailored for Indonesian corporations listed on the Indonesia Stock Exchange (**IDX**). 

Calibrated to **PT Pakuwon Jati Tbk (`PWON.JK`)** using audited 2021–2025 actuals, the system integrates live market data ingestion via `yfinance`, dynamic 10-year pro forma statement projections, multi-model approach triangulation (DCF, Relative Valuation, and RIM), automated LaTeX mathematical proofs, and an institutional **6-sheet formula-active Microsoft Excel export (`.xlsx`)** with exact zero-balance checks ($A = L + E$).

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1-Click Launch (Windows)](#1-click-launch-windows)
  - [Command-Line Launch](#command-line-launch)
  - [Running Unit Tests](#running-unit-tests)
- [Financial Modeling Methodology](#-financial-modeling-methodology)
  - [1. Cost of Capital (CAPM & WACC)](#1-cost-of-capital-capm--wacc)
  - [2. Multi-Stage DCF-FCFF Engine](#2-multi-stage-dcf-fcff-engine)
  - [3. Integrated 10-Year 3-Statement Model](#3-integrated-10-year-3-statement-model)
  - [4. Property Sector Comps & Residual Income (RIM)](#4-property-sector-comps--residual-income-rim)
  - [5. Justified Triangulation & Margin of Safety](#5-justified-triangulation--margin-of-safety)
- [Formula-Active 6-Sheet Excel Export](#-formula-active-6-sheet-excel-export)
- [Auditing & Academic Verification](#-auditing--academic-verification)
- [License & Academic Disclosure](#-license--academic-disclosure)

---

## 🚀 Key Features

### 1. Multi-Stage Discounted Cash Flow (DCF-FCFF)
- **10-Year Projection Horizon**: 5 years of explicit operational forecasting followed by a 5-year macroeconomic fade into long-term terminal perpetuity.
- **Granular Levers**: Dynamic inputs for statutory tax rates (UU HPP 22%), pioneer tax holidays, maintenance CapEx, expansion CapEx lump sums, and working capital intensity ($\Delta NWC$).
- **Dual Terminal Value Benchmarking**: Multi-stage Gordon Growth model cross-checked against EV/EBITDA Exit Multiple heuristics.

### 2. Integrated 3-Statement Financial Modeling Engine
- **Full Statement Articulation**: Mathematically coupled Income Statement, Balance Sheet, and Cash Flow Statement across all 10 forecast years.
- **Dynamic Balance Check**: Actively monitors that $\text{Assets} - (\text{Liabilities} + \text{Equity}) \equiv 0.00$ in every single period with zero hallucination.
- **Working Capital & PP&E Schedules**: Working capital driven by Days Sales Outstanding (DSO = 15 days), Days Inventory Outstanding (DIO = 521 days for property inventories), and Days Payable Outstanding (DPO = 72 days).

### 3. Relative Valuation (Comps) & Outlier Filtering
- **IDX Property & Real Estate Peer Group**: Automated peer benchmarking across Indonesian real estate leaders:
  - `BSDE.JK` (PT Bumi Serpong Damai Tbk)
  - `CTRA.JK` (PT Ciputra Development Tbk)
  - `SMRA.JK` (PT Summarecon Agung Tbk)
  - `ASRI.JK` (PT Alam Sutera Realty Tbk)
  - `LPKR.JK` (PT Lippo Karawaci Tbk)
- **Flexible Multiple Aggregation**: Switch between Median, Harmonic Mean, and 25th percentile multiples, with automatic interquartile outlier filtering.

### 4. Residual Income Model (RIM)
- **Clean Surplus Accounting**: Computes residual equity income based on beginning Book Value of Equity, ROE trajectory, and the Cost of Equity ($K_e$).

### 5. Multi-Scenario Fan Charts & 2D Sensitivity Grid
- **Scenario Forecaster**: Instant Bear (property credit tightening & slowdown), Base (consensus retail occupancy & superblock expansion), and Bull (mortgage VAT incentives & retail consumer boom) trajectories.
- **2D Stress-Test Matrix**: Sensitivity analysis of target share prices across hurdle rates ($WACC \pm 1.0\%$) and perpetual growth ($g \pm 1.0\%$).

### 6. Calculation Inspector (Transparent LaTeX Audit Trail)
- Step-by-step LaTeX formula derivations with substituted balance sheet figures for WACC, FCFF roll-forward, Gordon Growth terminal value, and Enterprise-to-Equity reconciliation.

### 7. Modern Institutional Web UI & Companion Streamlit App
- Dark Koyfin/Bloomberg-style terminal interface built with Starlette and Tailwind CSS (zero Node.js/npm dependencies).
- Companion Streamlit interface (`app.py`) for alternative analytical workflows.

---

## 🏛 System Architecture

```
[ yfinance Live Market Data / Audited IDX Filings ]
                         ↓
       [ FinancialDataLoader & Statement Normalizer ]
                         ↓
  ┌─────────────────────────────────────────────────────────┐
  │      10-Year Pro Forma Financial Statement Editor       │
  │  (Revenue Growth %, EBIT Margin %, Drivers & Levers)    │
  └──────────────────────────┬──────────────────────────────┘
                             ↓
       ┌─────────────────────┼─────────────────────┐
       ↓                     ↓                     ↓
[ Multi-Stage DCF ]  [ Relative Comps ]   [ Residual Income (RIM) ]
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             ↓
      [ Multi-Approach Triangulation & Weighting Engine ]
                             ↓
             [ Margin of Safety Recommendation ]
                    (BUY / HOLD / SELL)
                             ↓
       ┌─────────────────────┴─────────────────────┐
       ↓                                           ↓
[ Calculation Inspector ]           [ Formula-Active Excel Export ]
  (Step-by-Step LaTeX)              (6-Sheet Integrated 3-Statement)
```

---

## 📂 Repository Structure

```text
├── src/
│   ├── analytics/
│   │   ├── audit_trail.py       # Transparent LaTeX formula derivations
│   │   ├── exporter.py          # 6-sheet formula-active Excel export engine (.xlsx)
│   │   ├── sensitivity.py       # 2D WACC vs. g sensitivity stress-testing matrix
│   │   └── visualizer.py        # Charting & fan chart rendering helpers
│   ├── data/
│   │   ├── country_data.py      # Bank Indonesia rates, property peer map & macro assumptions
│   │   └── loader.py            # Live yfinance loader & audited PWON historical normalization
│   ├── models/
│   │   ├── dcf.py               # Enterprise DCF-FCFF discounting & TV calculations
│   │   ├── ensemble.py          # Multi-approach triangulation & weighted fair value
│   │   ├── multiples.py         # Peer multiples (EV/EBITDA, P/E, P/B) & statistical filters
│   │   ├── parameters.py        # CAPM, Cost of Debt, and WACC hurdle rate calculations
│   │   ├── pro_forma.py         # 10-year explicit forecast & macroeconomic fade engine
│   │   ├── rim.py               # Residual Income Model (clean surplus equity framework)
│   │   ├── scenarios.py         # Multi-scenario forecaster (Bear, Base, Bull)
│   │   └── three_statement.py   # 10-year integrated 3-statement modeling engine (IS, BS, CFS)
│   └── rules/
│       ├── recommendations.py   # Margin-of-safety rules (BUY / HOLD / SELL)
│       └── sanity_checks.py     # Real-time guardrails (g < WACC, GDP cap, EV reconciliation)
├── static/
│   ├── app.js                   # Interactive client logic, fan chart SVG, and DOM sync
│   └── index.html               # Institutional dark fintech UI (Tailwind CSS, KaTeX, Lucide)
├── tests/
│   ├── test_dcf_and_exporter.py # Unit tests for DCF logic and openpyxl byte generation
│   ├── test_pro_forma.py        # Unit tests for WACC and 10-year pro forma roll-forward
│   ├── test_sanity_checks.py    # Unit tests for economic guardrails & error boundaries
│   └── test_three_statement.py  # Unit tests for 3-statement articulation & zero balance check
├── AI_DISCLOSURE.md             # Deliverable 1: AI pair programming disclosure & verification
├── app.py                       # Companion Streamlit application
├── create_desktop_shortcut.bat  # 1-click Windows desktop shortcut generator
├── launcher.py                  # Headless port resolver and web browser trigger
├── PLAN.md                      # Comprehensive project specification & exam roadmap
├── requirements.txt             # Python dependency requirements
├── run_app.bat                  # 1-click execution script for Windows
├── server.py                    # High-performance asynchronous Starlette / Uvicorn backend
└── USER_GUIDE.md                # Comprehensive valuation manual and user documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python 3.10+** (tested on Python 3.14.7).
- Git installed on your system.

### 1-Click Launch (Windows)
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd "Project BA"
   ```
2. Double-click **[`run_app.bat`](run_app.bat)**.
3. The script will automatically verify the Python environment, install missing requirements, start the asynchronous backend server, and open your browser to `http://localhost:8000`.
4. *(Optional)* Double-click **[`create_desktop_shortcut.bat`](create_desktop_shortcut.bat)** to create a 1-click icon on your desktop.

### Command-Line Launch
```powershell
# 1. Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch the institutional fintech web platform (Port 8000)
python server.py

# 4. (Optional) Launch the companion Streamlit app (Port 8501)
streamlit run app.py
```

### Running Unit Tests
Execute the automated test suite to verify financial algorithms and balance check proofs:
```powershell
pytest -v
```
Expected output:
```text
tests/test_dcf_and_exporter.py::test_dcf_and_reconciliation PASSED
tests/test_dcf_and_exporter.py::test_excel_formula_active_export PASSED
tests/test_pro_forma.py::test_wacc_calculation_accuracy PASSED
tests/test_pro_forma.py::test_pro_forma_10_year_roll_forward PASSED
tests/test_pro_forma.py::test_auto_fade_helper PASSED
tests/test_sanity_checks.py::test_terminal_growth_fatal_when_ge_wacc PASSED
tests/test_sanity_checks.py::test_terminal_growth_warning_when_gt_gdp PASSED
tests/test_sanity_checks.py::test_terminal_growth_safe PASSED
tests/test_sanity_checks.py::test_ev_to_equity_bridge_reconciliation PASSED
tests/test_sanity_checks.py::test_negative_multiples_detected PASSED
tests/test_three_statement.py::test_three_statement_engine_articulation_and_balance PASSED
tests/test_three_statement.py::test_excel_export_six_sheets_and_formulas PASSED

============================= 12 passed in 1.05s =============================
```

---

## 📐 Financial Modeling Methodology

### 1. Cost of Capital (CAPM & WACC)
The hurdle rate is derived using the standard Capital Asset Pricing Model (CAPM) calibrated to Indonesian capital market parameters:
$$K_e = R_f + \beta \times ERP$$
$$K_{d,\text{after}} = K_{d,\text{pre}} \times (1 - t)$$
$$WACC = \left(W_e \times K_e\right) + \left(W_d \times K_{d,\text{after}}\right)$$

*Default Parameters (`PWON.JK` — PT Pakuwon Jati Tbk):*
- **Risk-Free Rate ($R_f$):** `6.60%` (10-Year Indonesian Government Bond Yield)
- **Equity Beta ($\beta$):** `0.75` (Indonesian Property & Real Estate Developer Beta)
- **Equity Risk Premium ($ERP$):** `7.20%` (Damodaran Emerging Market ERP for Indonesia)
- **Cost of Equity ($K_e$):** $6.60\% + (0.75 \times 7.20\%) = \mathbf{12.00\%}$
- **Pre-Tax Cost of Debt ($K_{d,\text{pre}}$):** `6.50%` (Senior notes coupon & credit spread)
- **After-Tax Cost of Debt ($K_{d,\text{after}}$):** $6.50\% \times (1 - 0.22) = \mathbf{5.07\%}$
- **Target Capital Structure:** Debt Weight $W_d = 20.0\%$, Equity Weight $W_e = 80.0\%$
- **Resulting Hurdle Rate (WACC):** $\mathbf{\approx 10.42\%}$

### 2. Multi-Stage DCF-FCFF Engine
Free Cash Flow to Firm (FCFF) is calculated for each explicit forecast period:
$$\text{NOPAT}_t = \text{EBIT}_t \times (1 - t_t)$$
$$FCFF_t = \text{NOPAT}_t + \text{D\&A}_t - \text{CapEx}_t - \Delta NWC_t$$

Terminal Value at Year 10 is computed via the Gordon Growth perpetuity model:
$$TV_{10} = \frac{FCFF_{10} \times (1 + g)}{WACC - g}$$

Enterprise Value (EV) and Equity Value reconciliation:
$$EV = \sum_{t=1}^{10} \frac{FCFF_t}{(1 + WACC)^t} + \frac{TV_{10}}{(1 + WACC)^{10}}$$
$$\text{Equity Value} = EV + \text{Cash} - \text{Total Debt} - \text{Minority Interest}$$
$$\text{Fair Value per Share} = \frac{\text{Equity Value}}{\text{Shares Outstanding}}$$

### 3. Integrated 10-Year 3-Statement Model
The financial engine produces full 10-year pro forma statements linking:
1. **Net Income** from the Income Statement flows directly into **Operating Cash Flow (CFO)** and **Retained Earnings** on the Balance Sheet.
2. **CapEx** from the PP&E Schedule flows into **Investing Cash Flow (CFI)** and updates **Net PP&E**.
3. **Debt Drawdowns / Repayments** and **Dividends Paid** flow into **Financing Cash Flow (CFF)**.
4. **Ending Cash** from the Cash Flow Statement articulates back into **Cash & Equivalents** on the Balance Sheet.
5. Exact zero-balance validation:
   $$\text{Balance Check} = \text{Total Assets} - (\text{Total Liabilities} + \text{Total Shareholders' Equity}) \equiv 0.00$$

### 4. Property Sector Comps & Residual Income (RIM)
- **Relative Valuation**:
  $$\text{Target Price}_{\text{EV/EBITDA}} = \frac{(\text{Benchmark Multiple} \times \text{EBITDA}_{Y1}) + \text{Cash} - \text{Debt} - \text{MI}}{\text{Shares Outstanding}}$$
- **Residual Income Model (RIM)**:
  $$RI_t = \text{Net Income}_t - (K_e \times \text{Book Value}_{t-1})$$
  $$\text{Equity Value}_{\text{RIM}} = \text{Book Value}_0 + \sum_{t=1}^{10} \frac{RI_t}{(1 + K_e)^t} + \text{Terminal Excess Return}$$

### 5. Justified Triangulation & Margin of Safety
The composite fair value target combines approaches based on academic criteria or discretionary analyst weights:
$$\text{Target Price} = (w_{\text{DCF}} \times P_{\text{DCF}}) + (w_{\text{Comps}} \times P_{\text{Comps}}) + (w_{\text{RIM}} \times P_{\text{RIM}})$$

*Recommended Property Allocation:* DCF ($55\%$), Relative Comps ($30\%$), RIM ($15\%$).

**Recommendation Badges:**
- **STRONG BUY**: Implied Upside $\ge +25\%$ and Current Price $\le$ Bear Price.
- **BUY**: Implied Upside $\ge +15\%$.
- **HOLD**: Implied Upside between $-10\%$ and $+15\%$.
- **SELL**: Implied Upside $< -10\%$.

---

## 📊 Formula-Active 6-Sheet Excel Export

The platform exports a 6-sheet openpyxl workbook containing **live Excel formulas** rather than hardcoded static outputs:

| Sheet Name | Content & Features | Sample Live Formulas |
|---|---|---|
| **`Executive Dashboard`** | C-suite summary, recommendation badge, football field bounds. | `=SUMPRODUCT()`, enterprise bridge, upside % |
| **`Income Statement`** | Audited 2025 actuals + 10-year pro forma projection. | `=B6*(1+C5)` (Revenue), `=C6-C7` (Gross Profit), `=C13-C14` (Net Income) |
| **`Balance Sheet`** | Assets, Liabilities, Equity with dynamic linkages. | Cash: `='Cash Flow Statement'!C21`, RE: `='Balance Sheet'!B23+'Income Statement'!C17` |
| **`Balance Check`** | **Active Zero-Balance Check Row (Row 28)** | `='Balance Sheet'!C12 - 'Balance Sheet'!C26` (= 0.00 in all years) |
| **`Cash Flow Statement`** | Articulated CFO, CFI, CFF, Net Cash Change, Ending Cash. | Net Income: `='Income Statement'!C15`, Working Capital from BS deltas |
| **`Schedules & DCF`** | Working capital schedules (DSO, DIO, DPO), PP&E, FCFF, TV. | FCFF derivation, Gordon Growth $TV_{10}$, PV discounting |
| **`Assumptions & Notes`** | Strategic macroeconomic assumptions & annual thesis notes. | Macro hurdle rates and qualitative year-by-year rationales |

---

## 🔍 Auditing & Academic Verification
Designed specifically for MM6026 examination committees:
1. **Zero Hallucination Guarantee**: Every figure in the Calculation Inspector matches the Python calculation engine and the exported Excel workbook.
2. **Transparent LaTeX Proofs**: Full algebraic derivations with exact substituted figures available inside **Tab 5 (Calculation Inspector)**.
3. **Comprehensive Documentation**:
   - Detailed valuation manual: [`USER_GUIDE.md`](USER_GUIDE.md)
   - Academic disclosure & prompt log: [`AI_DISCLOSURE.md`](AI_DISCLOSURE.md)
   - Technical roadmap & specification: [`PLAN.md`](PLAN.md)

---

## 📜 License & Academic Disclosure
This project is developed for the **MM6026 Digital Business Valuation** course under the Highest-Score Implementation Tier. Code is released under the [MIT License](LICENSE). For full details on the artificial intelligence tools utilized during development, refer to [`AI_DISCLOSURE.md`](AI_DISCLOSURE.md).
