# MM6026 Digital Business Valuation: AI Disclosure Statement
**Course:** MM6026 Digital Business Valuation  
**Candidate Submission:** Deliverable 1 Supporting Documentation  
**Date:** October 20, 2026  

---

## 1. AI Tools Utilized

In accordance with the MM6026 Mid-Term Exam directive on transparency and originality, the following AI systems and environments were utilized during project development:

1. **Antigravity AI Agentic Coding Assistant (Google DeepMind)**:
   - Used as an interactive pair-programming environment to design, scaffold, and refine Python code, Streamlit UI components, and unit test suites.
2. **Deterministic Corporate Finance Python Engine (`src/`)**:
   - Built to execute all financial valuation calculations deterministically. **No external black-box LLM API was embedded inside the runtime application**, ensuring 100% mathematical auditability, offline resilience, and zero API quota costs.

---

## 2. Tasks Supported by AI

AI tools meaningfully assisted across five structured engineering tasks:

| Development Task | Specific AI Role | Human Analyst Ownership |
| :--- | :--- | :--- |
| **System Architecture Design** | Scaffolding the modular separation of Data Ingestion (`src/data`), Rule Engines (`src/rules`), Financial Models (`src/models`), and Analytics (`src/analytics`). | Defined valuation methodology (DCF-FCFF multi-stage with fade, relative peer multiples, and RIM). |
| **Data Normalization & Scaling** | Assisted in parsing and standardizing irregular line-item naming across Yahoo Finance API statements. | Validated audited Indonesian balance sheet figures (ASII 2021–2025 actuals in Trillion IDR). |
| **Pro Forma Statement Engine** | Generated vectorized pandas arithmetic for dynamic 10-year pro forma schedules and linear fade logic. | Formulated explicit investment thesis notes, growth expectations, and operating margin assumptions. |
| **Interactive UI Construction** | Implemented Streamlit tab layout, collapsible parameter drawers, custom Tailwind CSS styling, and Plotly interactive chart specifications. | Directed user experience priorities, including year-by-year manual flexibility and transparent LaTeX proofs. |
| **Automated Verification Suites** | Generated comprehensive `pytest` test suites verifying calculation consistency, discounting math, and guardrails. | Audited all test fixtures and formulas against corporate finance textbooks (Damodaran, McKinsey). |

---

## 3. Verification & Quality Assurance of AI-Generated Outputs

All code and mathematical logic generated during development underwent rigorous manual verification:

1. **Textbook Mathematical Verification**:
   - Every formula implemented in the backend (WACC, NOPAT, FCFF, Terminal Value, Enterprise-to-Equity Bridge) was manually reconciled against formula specifications from *Damodaran on Valuation* and *McKinsey Valuation: Measuring and Managing the Value of Companies*.
2. **Automated Unit Test Verification**:
   - An automated test suite (`tests/`) containing 10 targeted test cases was executed locally using `pytest`. The test suite verified:
     - Boundary conditions for Terminal Growth ($g \ge \text{WACC}$).
     - Exact Enterprise-to-Equity bridge arithmetic ($\text{EV} + \text{Cash} - \text{Debt} - \text{MI} = \text{Equity}$).
     - Correct multi-year roll-forward and discounting of explicit cash flows.
     - Formula-active Excel export validity.
3. **Calculation Inspector Verification**:
   - The application includes a dedicated **Calculation Inspector** tab displaying exact substituted balance sheet numbers and LaTeX formulas for every intermediate metric, eliminating opaque black-box outputs.

---

## 4. Important Limitations, Corrections & Human Responsibility

1. **Correction of Hallucinations**:
   - Early automated drafts attempted to model cyclical working capital using a single flat percentage of revenue. This was manually corrected to incremental working capital intensity ($\Delta NWC$ % of $\Delta \text{Revenue}$), preventing severe working capital distortion during periods of high revenue growth.
2. **Academic Independence**:
   - The candidate remains fully knowledgeable of and responsible for every calculation, assumption, macro parameter, and investment recommendation presented in this submission. The candidate is prepared to defend all model outputs without relying on AI-generated explanations.
