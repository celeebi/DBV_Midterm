# MM6026 Digital Business Valuation Platform
## User Guide & Valuation Manual
**Course:** MM6026 Digital Business Valuation  
**Implementation Standard:** Highest-Score Platform Tier (Institutional Fintech Web Application)  
**Valuation Date:** October 20, 2026  
**Primary Ticker Benchmark:** `PWON.JK` (PT Pakuwon Jati Tbk)  

---

## 1. System Setup & Launch Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14.7).
- Local virtual environment with dependencies installed: `starlette`, `uvicorn`, `streamlit`, `plotly`, `yfinance`, `pandas`, `numpy`, `openpyxl`, `pytest`.

### 1-Click Launch (Double-Click)
- **Primary Institutional Platform (Recommended):** Double-click [`run_app.bat`](file:///c:/Users/Public/Documents/Project%20BA/run_app.bat) in the project folder.
- **Desktop Shortcut:** Double-click [`create_desktop_shortcut.bat`](file:///c:/Users/Public/Documents/Project%20BA/create_desktop_shortcut.bat) to place a 1-click icon on your Windows Desktop named *"MM6026 Valuation Platform"*.
- The launcher automatically activates `.venv`, starts the local server, and opens your default browser directly to `http://localhost:8000`.

### Command-Line Execution
Alternatively, you can launch from PowerShell:

```powershell
# Launch the Institutional Web Platform (Port 8000)
.\.venv\Scripts\python server.py

# Or launch the companion Streamlit interface (Port 8501)
.\.venv\Scripts\streamlit run app.py
```

### Running Verification Unit Tests
To verify all calculation engines, discounting arithmetic, and sanity checks against the automated test suite:

```powershell
.\.venv\Scripts\pytest -v
```

---

## 2. Platform Architecture & Workflow

The platform separates **Data Ingestion**, **Forecast Assumptions**, **Valuation Engine**, and **Analytical Outputs** into a clean modular pipeline:

```
[ yfinance Live Market API / IDX Filings ]
                     ↓
[ FinancialDataLoader & Statement Normalizer ]
                     ↓
[ 10-Year Pro Forma Financial Statement Editor ] ➔ [ 6 Granular Levers: Terminal g, CapEx, WACC ]
                     ↓
┌────────────────────┼────────────────────┐
↓                    ↓                    ↓
[ Multi-Stage DCF ]  [ Relative Comps ]   [ Residual Income Model ]
                     ↓
[ Method Selection & Approach Triangulation ] ➔ [ Margin of Safety Recommendation ]
                     ↓
[ Calculation Inspector (LaTeX Proofs) ] & [ Formula-Active Excel Export (.xlsx) ]
```

---

## 3. Detailed Guide to Tabs & Controls

### Tab 1: 10-Year Pro Forma Financial Statement Editor
- **Historical Baseline**: Displays audited actuals (2021–2025) normalized to Indonesian Rupiah Trillions (`Rp T`).
- **Interactive Pro Forma Grid**:
  - Edit **Revenue Growth (%)** and **EBIT Margin (%)** for any year from Year 1 (2026E) to Year 10 (2035E).
  - Edit **Analyst Thesis / Driver Notes** to document the economic rationale behind each individual forecast year.
- **Top Controls**:
  - **🪄 Auto-Fade Helper**: Linearly fades Year 5 growth into your specified terminal perpetuity growth rate ($g$) across Years 6–10.
  - **↺ Reset Baseline**: Restores calibrated institutional baseline assumptions.
- **⚙️ Advanced Assumption Levers Drawer**:
  - **Terminal Growth ($g$)**: Direct floating-point number input (e.g. `1.5%`, `2.0%`, `2.5%`). Guardrails automatically verify that $0\% < g < \text{WACC}$ and $g \le 4.0\%$ (long-term Indonesian nominal GDP ceiling).
  - **WACC CAPM Parameters**: Direct overrides for Risk-free rate ($R_f = 6.60\%$), Equity Beta ($\beta = 0.85$), Equity Risk Premium ($ERP = 7.20\%$), Pre-tax Cost of Debt ($K_d = 5.80\%$), and Target Debt Ratio ($W_d = 21.5\%$).
  - **CapEx & Reinvestment Schedule**: Maintenance CapEx (% of Rev) and optional Lump-Sum Expansion CapEx in Year 2.
  - **Working Capital Dynamics**: Incremental Net Working Capital intensity ($\Delta NWC$ % of $\Delta$Rev).
  - **Fiscal Tax Policy**: Statutory corporate tax rate (22.0% under UU HPP) with strategic pioneer tax holiday toggle (10% in Y1–Y3).

### Tab 2: Valuation Workbench & Justified Triangulation
- **Dual-Mode Approach Selection**:
  - *Rule Engine Suggested*: Proposes academic weights based on industry lifecycle and cash flow stability.
  - *Manual Analyst Override*: Allows full discretionary weight allocation across DCF, Relative Valuation, and RIM.
- **Summary KPI Cards**: Current Market Price, Composite Fair Value Target, Implied Upside %, and Recommendation (BUY / HOLD / SELL).
- **Valuation Football Field Chart**: Compares method spreads against the observed market price.

### Tab 3: 10-Year Multi-Stage Fan Chart & Scenarios
- **Forecasting Fan Chart**: Renders a smooth visual trajectory spanning 4 historical actual years + 5 explicit forecast years + 5 fade years.
- **Bear / Base / Bull Comparison**: Scenario comparison matrix displaying Revenue CAGRs, Operating Margins, Hurdle Rates, and Target Prices.

### Tab 4: Relative Valuation Comps
- Displays live/calibrated IDX peer multiples (`UNTR.JK`, `AUTO.JK`, `IMAS.JK`, `SMSM.JK`, `DRMA.JK`).
- Implied prices from EV/EBITDA, P/E, and P/B.
- Multiples statistic toggle (Median, 25th percentile, Harmonic Mean).

### Tab 5: Calculation Inspector & Transparent Audit Trail
- Designed specifically for examination auditing.
- Provides LaTeX equations, corporate finance theory explanations, and **exact substituted balance sheet numbers** for:
  1. WACC CAPM Proof
  2. Free Cash Flow to Firm (FCFF) Roll-Forward Proof
  3. Terminal Value Gordon Growth Proof
  4. Enterprise-to-Equity Value Bridge Proof
  5. Composite Target Triangulation Proof

### Tab 6: 2D Sensitivity Grid & Formula-Active 3-Statement Excel Export
- **2D Stress-Test Matrix**: Evaluates DCF target share prices across WACC ($\pm 1.0\%$) and Terminal Growth $g$ ($\pm 1.0\%$).
- **📥 Download Model (.xlsx)**: Generates a complete institutional-grade 6-sheet Microsoft Excel workbook containing **live Excel formulas** linking all 3 financial statements and schedules:
  1. `Executive Dashboard`: Valuation summary, method triangulation with `=SUMPRODUCT()`, football field parameters, and recommendation badge.
  2. `Income Statement`: Audited 2025 actuals + 10-year dynamic forecast with live formulas (`=B6*(1+C5)`, Gross Profit, SG&A, EBIT, Interest, Tax, Net Income, Dividends, Addition to Retained Earnings).
  3. `Balance Sheet`: Articulated Assets (linking to CFS cash), Receivables (via DSO), Inventory (via DIO), Net PP&E, Liabilities (via DPO), Retained Earnings roll-forward, and an active green balance check row (`=Assets - (Liabilities + Equity)` = 0.00).
  4. `Cash Flow Statement`: CFO (Net Income + D&A - Working Capital), CFI (CapEx), CFF (Debt changes - Dividends), Net Change in Cash, and Ending Cash.
  5. `Schedules & DCF`: Working Capital (DSO/DIO/DPO), PP&E roll-forward, FCFF derivation, WACC discounting, Gordon Growth terminal value, and Enterprise-to-Equity reconciliation.
  6. `Assumptions & Notes`: Macroeconomic drivers, annual growth thesis, and hurdle rate documentation.

---

## 4. Key Mathematical Formulations

### 1. Cost of Capital (CAPM & WACC)
$$K_e = R_f + \beta \times ERP$$
$$K_{d,\text{after}} = K_{d,\text{pre}} \times (1 - t)$$
$$WACC = \left(W_e \times K_e\right) + \left(W_d \times K_{d,\text{after}}\right)$$

### 2. Free Cash Flow to Firm (FCFF)
$$\text{NOPAT}_t = \text{EBIT}_t \times (1 - t_t)$$
$$FCFF_t = \text{NOPAT}_t + \text{D\&A}_t - \text{CapEx}_t - \Delta NWC_t$$
$$PV(FCFF_t) = \frac{FCFF_t}{(1 + WACC)^t}$$

### 3. Terminal Value (Gordon Growth)
$$TV_{10} = \frac{FCFF_{10} \times (1 + g)}{WACC - g}$$
$$PV(TV_{10}) = \frac{TV_{10}}{(1 + WACC)^{10}}$$

### 4. Enterprise-to-Equity Value Bridge
$$\text{Enterprise Value} = \sum_{t=1}^{10} PV(FCFF_t) + PV(TV_{10})$$
$$\text{Equity Value} = \text{Enterprise Value} + \text{Cash} - \text{Total Debt} - \text{Minority Interest}$$
$$\text{Fair Value per Share} = \frac{\text{Equity Value} \times 1,000}{\text{Shares Outstanding (Billions)}}$$

---

## 5. Decision Rules & Recommendation Criteria

| Rating | Implied Upside / Downside Criteria | Academic Rationale |
| :--- | :--- | :--- |
| **BUY** | **Upside $> +15.0\%$** | Significant margin of safety; market price understates fundamental cash generation. |
| **HOLD** | **Upside between $-10.0\%$ and $+15.0\%$** | Trading within normal estimation error margin; fair fundamental value. |
| **SELL** | **Downside $< -10.0\%$** | Market price exceeds fundamental cash-generative power; capital loss risk. |

---

## 6. Known Limitations & Disclosures
1. **Financial Sector Exclusions**: The DCF-FCFF model is calibrated for non-financial corporations (industrials, automotive, telecoms, consumer goods). Commercial banks (e.g., `BBCA.JK`, `BBRI.JK`) require FCFE or Dividend Discount Models (DDM) due to regulatory capital reserves.
2. **Perpetual Growth Boundaries**: Terminal growth rates ($g$) must never equal or exceed WACC, and should not exceed long-term nominal Indonesian GDP growth ($4.0\%$).
3. **Data Availability**: The application connects to Yahoo Finance API in real time. In the event of network disruption, audited baseline data for `ASII.JK` is permanently cached to ensure zero presentation interruption.
