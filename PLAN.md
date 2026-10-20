# MM6026 Digital Business Valuation: Mid-Term Exam Final Implementation Plan
*(Course: MM6026 Digital Business Valuation | Updated: Interactive Pro Forma Financial Statement Editor & Year-by-Year Assumption Controls)*

## 1. Exam Alignment & Architecture Overview
This plan integrates an **Interactive Pro Forma Financial Statement Model** directly into our Python/Streamlit web application. Rather than locking the user into a single flat growth rate, the platform generates an intelligent baseline and gives the user full Excel-like flexibility to:
1. **Edit Year-by-Year Explicit Forecasts** (e.g., Year 1: 6.0%, Year 2: 3.0%, Year 3: 2.5%, Year 4: 5.0%, Year 5: 4.5%).
2. **Document Analyst Thesis / Assumption Rationales** for each individual forecast year (e.g., *"Year 2 slowdown due to EV price wars and high commodity input costs; Year 3 recovery from export expansion"*).
3. **Instantly Recalculate Pro Forma Statements**: Revenue $\to$ EBIT $\to$ NOPAT $\to$ CapEx $\to$ $\Delta NWC$ $\to$ FCFF $\to$ Discount Factors $\to$ Equity Value per share.
4. **Export Clean Pro Forma Workbooks**: Download the completed statement with formulas and notes directly to Excel (`.xlsx`).

---

## 2. Key Methodological & Technical Decisions

| Dimension | Specification | Academic & Exam Justification |
| :--- | :--- | :--- |
| **Pro Forma Schedule** | **Interactive 10-Year Statement Grid (`st.data_editor`)** | • **Historical Statements (2021–2025)**: Displayed as locked audited reference.<br>• **Explicit Forecast (2026E–2030E)**: Fully editable cells for Revenue Growth (%), EBIT Margin (%), CapEx (% Rev), and NWC (% Rev).<br>• **Transition Fade (2031E–2035E)**: Auto-calculated smooth fade toward long-term GDP growth ($g \le 4.0\%$) and steady-state margins.<br>• **Analyst Rationale Column**: Editable text field where the student documents their qualitative investment thesis. |
| **DCF Horizon** | **10-Year Multi-Stage with Fade** | Seamlessly connects explicit pro forma inputs into terminal value without artificial cliff effects. |
| **Indonesian Macro Presets** | **Calibrated to IDX / BI Benchmarks** | • **Tax Rate ($t$)**: 22% (Statutory Indonesian corporate income tax under UU HPP).<br>• **Risk-Free Rate ($R_f$)**: 6.60% (Indonesia 10-Year Government Bond yield).<br>• **Equity Risk Premium ($ERP$)**: 7.20% (Aswath Damodaran Indonesia country risk framework).<br>• Full manual override sliders available. |
| **Relative Valuation (Comps)** | **Pre-Configured Indonesian Peers + Custom Input** | Automatically loads direct sector competitors (e.g. for `ASII.JK`: `UNTR.JK`, `AUTO.JK`, `IMAS.JK`), calculates median P/E, EV/EBITDA, and P/B, and lets the user dynamically add/remove peers. |
| **Backend Transparency** | **Dedicated "Calculation Inspector & Audit Trail" Tab** | For every metric (WACC, FCFF, Terminal Value, Enterprise-to-Equity Bridge, Comps), displays formal LaTeX formulas, plain-language theory, and exact substituted balance sheet numbers. |
| **Material Error Guardrails** | **Automated Model Sanity Checks** | Real-time validation checks for $g \ge WACC$, negative multiples, and complete Enterprise-to-Equity reconciliation. |

---

## 3. System Architecture & Folder Layout

```
Project BA/
├── requirements.txt           # streamlit, plotly, yfinance, pandas, numpy, scipy, openpyxl, pytest
├── app.py                     # Streamlit application entrypoint
├── PLAN.md                    # Full architectural plan & methodology specification
├── USER_GUIDE.md              # Deliverable 1: User guide with setup, formulas, and operating instructions
├── AI_DISCLOSURE.md           # Academic AI tools & validation disclosure statement
├── src/
│   ├── __init__.py
│   ├── data/
│   │   ├── __init__.py
│   │   ├── loader.py          # yfinance data extraction with caching & error handling
│   │   ├── normalizer.py      # Standardizes line items across quarters/annual reports
│   │   └── country_data.py    # Indonesian macro benchmarks (22% tax, 6.6% bond, 7.2% ERP)
│   ├── rules/
│   │   ├── __init__.py
│   │   ├── recommendations.py # Industry rule engine (Manufacturing vs Banks vs Tech)
│   │   └── sanity_checks.py   # Material error checking (g vs WACC, EV-to-Equity reconciliation)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── pro_forma.py       # [NEW] Pro Forma 10-year dynamic financial statement generator
│   │   ├── parameters.py      # CAPM Cost of Equity (Ke), Cost of Debt (Kd), and WACC
│   │   ├── scenarios.py       # Bear / Base / Bull 10-year projection engine
│   │   ├── dcf.py             # FCFF & FCFE multi-stage projection with dual terminal value
│   │   ├── multiples.py       # Relative valuation comps (P/E, EV/EBITDA, P/B) with peer filtering
│   │   ├── rim.py             # Residual Income Model (Book Value + PV of excess ROE)
│   │   └── ensemble.py        # Probability-weighted valuation aggregator
│   └── analytics/
│       ├── __init__.py
│       ├── audit_trail.py     # Backend Calculation Inspector (step-by-step formulas & substituted values)
│       ├── sensitivity.py     # 2D grid sensitivity matrix (WACC vs. g)
│       ├── visualizer.py      # Plotly forecasting fan chart, football field, and WACC charts
│       └── exporter.py        # Excel (.xlsx) workbook export with pro forma sheets
└── tests/
    ├── __init__.py
    ├── test_pro_forma.py      # [NEW] Tests pro forma calculation consistency & line item arithmetic
    ├── test_sanity_checks.py  # Tests validation guardrails (g >= WACC, negative debt)
    ├── test_dcf_math.py       # Verifies 10-year fade and discounting math against textbook fixtures
    ├── test_audit_trail.py    # Confirms step-by-step substitution accuracy
    └── test_multiples.py      # Tests peer filtering and median multiples computation
```

---

## 4. Granular Assumption Levers & Pro Forma Mechanics (`src/models/pro_forma.py`)

### The 6 Granular Assumption Levers (Institutional & Academic Flexibility)
To ensure the model never restricts the analyst to crude dropdowns or static percentages, the platform exposes 6 direct numeric controls:
1. **Terminal Value Engine ($g$ & Exit Multiple)**:
   - **Perpetual Growth ($g$)**: Direct numeric float input (e.g. `1.5%`, `2.0%`, `2.5%`) with real-time Damodaran boundary checks:
     $$\text{Condition: } 0\% < g < \text{WACC} \quad \text{and} \quad g \le \text{Long-term GDP Growth (4.0\%)}$$
   - **Dual Terminal Cross-Check**: Gordon Growth Model ($TV = \frac{FCFF_{11}}{WACC - g}$) benchmarked against Exit Multiple ($TV = \text{EBITDA}_{10} \times \text{Exit Multiple}$, e.g. $4.5\times$).
2. **Cost of Capital (WACC & CAPM Parameter Engine)**:
   - Direct numeric overrides for Risk-free Rate ($R_f = 6.60\%$), Equity Beta ($\beta = 0.85$), Equity Risk Premium ($ERP = 7.20\%$), Pre-tax Cost of Debt ($K_d = 5.80\%$), and Target Debt Ratio ($W_d = 21.5\%$).
   - Dynamic CAPM formula:
     $$K_e = R_f + \beta \times ERP, \quad K_{d,\text{after}} = K_d \times (1 - t), \quad WACC = W_e K_e + W_d K_{d,\text{after}}$$
3. **Capital Expenditures & Reinvestment Schedule**:
   - Maintenance CapEx (% of Revenue, default 5.5%).
   - Lump-Sum Project Expansion CapEx (e.g. Rp 10T factory expansion in Year 2).
4. **Working Capital Dynamics ($\Delta NWC$)**:
   - Incremental Working Capital Intensity (% of $\Delta$ Revenue, default 8.0%).
   - Depreciation schedule as % of Net PP&E.
5. **Fiscal & Tax Policy**:
   - Statutory corporate tax rate ($t = 22\%$).
   - Pioneer Industry / Green Vehicle Tax Holiday toggle (drops effective tax to 10% in Y1–Y3).
6. **Relative Valuation Comps Benchmark Rules**:
   - Multiple benchmark statistic selector: Sector Median (robust) vs. 25th Percentile (conservative) vs. Harmonic Mean.
   - Outlier filtration rule: Automatically excludes peers with negative earnings or $P/E > 40\times$.

### The Pro Forma Schedule Architecture
For each explicit forecast year ($t = 1 \dots 10$):
1. **Revenue Projection**:
   $$\text{Revenue}_t = \text{Revenue}_{t-1} \times (1 + g_t)$$
   *(where $g_t$ is user-editable for Years 1–5, e.g. Y1: 6%, Y2: 3%, Y3: 2.5%, and manually editable or smoothly faded to $g$ in Years 6–10)*.
2. **Operating Income (EBIT)**:
   $$\text{EBIT}_t = \text{Revenue}_t \times \text{Operating Margin}_t$$
3. **Net Operating Profit After Tax (NOPAT)**:
   $$\text{NOPAT}_t = \text{EBIT}_t \times (1 - t_t)$$
4. **Depreciation & Amortization (D&A)**:
   $$\text{D\&A}_t = \text{Revenue}_t \times (\text{Historical D\&A \% of Rev})$$
5. **Capital Expenditures (CapEx)**:
   $$\text{CapEx}_t = (\text{Revenue}_t \times \text{CapEx \% of Rev}_t) + \text{Expansion CapEx}_t$$
6. **Change in Net Working Capital ($\Delta NWC$)**:
   $$\Delta NWC_t = \max(0, (\text{Revenue}_t - \text{Revenue}_{t-1}) \times \text{NWC Intensity})$$
7. **Free Cash Flow to Firm (FCFF)**:
   $$FCFF_t = \text{NOPAT}_t + \text{D\&A}_t - \text{CapEx}_t - \Delta NWC_t$$
8. **Present Value (PV)**:
   $$PV(FCFF_t) = \frac{FCFF_t}{(1 + WACC)^t}$$

---

## 5. Detailed Tab-by-Tab User Experience (`app.py`)

1. **Top Header & Provenance Banner**:
   - Active Ticker, Company Name, Industry Badge, Valuation Date (`2026-10-20`), Source (`Yahoo Finance API / IDX Filings`), and Sanity Check Badges ($g < \text{WACC}$, Positive Multiples, EV-to-Equity reconciliation).
2. **Tab 1: 10-Year Pro Forma Financial Statement Editor (`st.data_editor`)**:
   - **Historical Statements (2021–2025)**: Audited Income Statement and Cash Flow baseline.
   - **Collapsible "Advanced Assumption Levers" Drawer**: Direct numeric input for Terminal $g$ (e.g. 1.5%), Exit multiple, WACC CAPM parameters, CapEx %, NWC %, and Tax Holidays.
   - **Interactive Forecast Spreadsheet (2026E–2035E)**:
     - Editable numeric cells: Revenue Growth (%), Operating Margin (%).
     - **"Analyst Thesis & Drivers" Column**: Text field to write explicit justification for each year's assumption.
     - **Live Recalculate & Auto-Fade Helper**: Instant synchronization with DCF Target and sensitivity matrix.
3. **Tab 2: Valuation Workbench & Justified Weighting**:
   - Industry recommendation callout explaining why DCF-FCFF is primary for the active sector.
   - Interactive probability sliders for DCF-FCFF, RIM, and Multiples with 100% auto-normalization.
   - Summary Metric Cards: Market Price, Composite Fair Value, Implied Upside %, Margin of Safety.
   - Interactive **Football Field Distribution Chart** comparing method spreads against market price.
4. **Tab 3: 10-Year Multi-Stage Scenario Forecast (Bear / Base / Bull)**:
   - Interactive **Forecasting Fan Chart** (4 years historical actuals + 5-year explicit forecast + 5-year fade).
   - Scenario comparison matrix table (Revenue CAGR, EBIT Margins, WACC, Implied Prices).
   - Scenario probability assignor (e.g. 20% Bear, 60% Base, 20% Bull).
5. **Tab 4: Relative Valuation & IDX Peers**:
   - Pre-configured peer benchmarking table (e.g. for `ASII.JK`: `UNTR.JK`, `AUTO.JK`, `IMAS.JK`).
   - Multiple benchmark statistic selector (Median, 25th percentile, Harmonic Mean).
   - Outlier filter toggles (Exclude negative earnings or $P/E > 40\times$).
   - Dynamic custom peer ticker adder/remover.
6. **Tab 5: Calculation Inspector & Audit Trail (The Key Exam Feature)**:
   - Accordion cards for **WACC Proof**, **FCFF Schedule Proof**, **Reinvestment Proof**, **Terminal Value Proof**, and **Enterprise-to-Equity Bridge**.
   - Displays plain-language explanation, LaTeX mathematical formulas, substituted audited values, and intermediate calculation steps.
7. **Tab 6: Sensitivity Matrix & Excel Export**:
   - 2D Heatmap (WACC $\pm 1.0\%$ vs. Perpetual Growth $g \pm 1.0\%$).
   - **Download Model (.xlsx)** button: Generates an Excel workbook with separate sheets for Inputs, Assumptions (with your written notes), Pro Forma Statements, and Valuation Summary.

---

## 5.1 MM6026 Defense "Grill-Me" Protocol
The model includes built-in stress-test interrogatories designed to prepare the student for sharp examination questions:
- **Terminal Growth Thesis Defense**: Why $g = 1.5\%$ when Indonesia's 10Y bond yield is $6.6\%$ and real GDP is $\sim 5.0\%$? (Defense: Mature conglomerates cannot outgrow the aggregate economy; $1.5\%$ reflects long-term real growth after terminal automotive saturation and EV price competition).
- **Fade Length Defense**: Why 10 years instead of 5 years? (Defense: Automotive model cycles in Indonesia span 5–7 years; a 10-year horizon captures the full transition from ICE to hybrid/EV fleets).
- **Capital Structure Defense**: Market D/E vs Target D/E? (Defense: While Astra operates with low net debt today, a long-term target capital structure of 20–25% debt captures its financing subsidiary capital needs).

---

## 6. Verification & Test Plan

### Automated Pytest Suite
```bash
.\.venv\Scripts\python -m pytest tests/ -v
```
1. `tests/test_pro_forma.py`: Confirms that editing year-by-year growth rates correctly rolls forward to Revenue, NOPAT, FCFF, and Discounted Value with zero arithmetic drift.
2. `tests/test_sanity_checks.py`: Verifies that invalid inputs ($g \ge WACC$, negative debt) trigger alerts.
3. `tests/test_dcf_math.py`: Tests 10-year multi-stage fade math, discounting factors, and Gordon Growth terminal values against textbook solutions.
4. `tests/test_audit_trail.py`: Validates that intermediate values in the Calculation Inspector match the engine's outputs exactly.

### Manual Verification Checklist
1. Launch app: `.\.venv\Scripts\streamlit run app.py`
2. Open **Tab 2 (Pro Forma Statements)**:
   - Change Year 2 growth to `3.0%` and Year 3 to `2.5%`.
   - Add a note in the Rationale column: *"Auto market price competition"*.
   - Confirm that the Free Cash Flow row and the DCF target update instantly in real-time.
3. Download the Excel model:
   - Open in Excel and verify that the edited Pro Forma schedule and thesis notes appear in the workbook.
