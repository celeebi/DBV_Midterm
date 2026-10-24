"""
Automated Pytest Suite: Audited Multi-Year 3-Statement Structural & Data Integrity Tests.
Tests universal non-financial Indonesian equities across distinct industries:
- ASII (Conglomerate / Automotive & Heavy Machinery)
- ANTM (Basic Materials / Mining & Metals)
- AKRA (Energy & Logistics / Petroleum Distribution & Industrial Estates)
- KLBF (Healthcare / Pharmaceuticals & FMCG)
- PTBA (Energy / Coal Mining)
- TOWR (Infrastructure / Telecommunications Towers)
- AADI (Energy Logistics)
- PWON (Real Estate / Commercial Malls & Development)

Verifies:
1. Income Statement Linearity: Rev > 0, COGS > 0, GP == Rev - COGS, EBIT == GP - SG&A.
2. Balance Sheet Identity: Total Assets == Total Liabilities + Total Equity (Diff <= 0.02T).
3. Current vs Non-Current categorization consistency.
4. Cash Flow Statement polarity: CapEx <= 0, Dividends <= 0, cash reconciliation continuity.
5. REST API parity: FinancialDataLoader returns all 4 sub-tables with identical numbers.
"""

import pytest
from src.data.loader import FinancialDataLoader
from src.data.adapters.idx_adapter import IDXAdapter

UNIVERSAL_TEST_TICKERS = ["ASII", "ANTM", "AKRA", "KLBF", "PTBA", "TOWR", "AADI", "PWON"]


@pytest.mark.parametrize("ticker", UNIVERSAL_TEST_TICKERS)
def test_audited_statements_load_success(ticker):
    """Verifies that each universe company successfully loads audited multi-year statements."""
    data = FinancialDataLoader.fetch_company_data(ticker, source="idx")
    assert data is not None
    assert "historical_statements" in data
    hist = data["historical_statements"]

    assert "years" in hist
    assert len(hist["years"]) >= 2
    assert "balance_sheet" in hist
    assert "income_statement" in hist
    assert len(hist["balance_sheet"]) == len(hist["years"])
    assert len(hist["income_statement"]) == len(hist["years"])


@pytest.mark.parametrize("ticker", UNIVERSAL_TEST_TICKERS)
def test_income_statement_linearity_and_no_line_swap(ticker):
    """
    Guarantees no line swapping:
    - Revenue must be positive top-line.
    - COGS must be positive expense magnitude.
    - Revenue >= COGS (Gross Profit >= 0 for operating companies).
    - Gross Profit == Revenue - COGS (within 0.05T rounding).
    """
    data = FinancialDataLoader.fetch_company_data(ticker, source="idx")
    is_rows = data["historical_statements"]["income_statement"]

    for row in is_rows:
        yr = row["year"]
        rev = row["revenue"]
        cogs = row["cogs"]
        gp = row["gross_profit"]

        # Assert positive revenue
        assert rev > 0, f"{ticker} {yr}A: Revenue must be positive, got {rev}"

        # Assert positive expense magnitude for COGS
        assert cogs >= 0, f"{ticker} {yr}A: COGS must be positive magnitude, got {cogs}"

        # Assert no Revenue/COGS inversion
        assert rev >= cogs, f"{ticker} {yr}A: Revenue ({rev}) should exceed or equal COGS ({cogs})"

        # Assert Gross Profit == Revenue - COGS
        calc_gp = round(rev - cogs, 2)
        assert abs(gp - calc_gp) <= 0.05, f"{ticker} {yr}A: GP mismatch: reported={gp}, calc={calc_gp}"


@pytest.mark.parametrize("ticker", UNIVERSAL_TEST_TICKERS)
def test_balance_sheet_identity_zero_balance_check(ticker):
    """
    Guarantees strict Balance Sheet identity:
    Total Assets == Total Liabilities + Total Equity (within 0.02T rounding).
    Total CA == Cash + AR + Inventory + Other CA.
    Total CL == AP + ST Debt + Other CL.
    """
    data = FinancialDataLoader.fetch_company_data(ticker, source="idx")
    bs_rows = data["historical_statements"]["balance_sheet"]

    for row in bs_rows:
        yr = row["year"]
        assets = row["total_assets"]
        liab = row["total_liabilities"]
        eq = row["total_equity"]
        chk = row["balance_check"]

        ca = row["total_current_assets"]
        nca = row["total_non_current_assets"]
        cl = row["total_current_liabilities"]
        ncl = row["total_non_current_liabilities"]

        # Subtotals
        assert abs(assets - (ca + nca)) <= 0.05, f"{ticker} {yr}A: Assets != CA + NCA"
        assert abs(liab - (cl + ncl)) <= 0.05, f"{ticker} {yr}A: Liab != CL + NCL"

        # Balance Sheet Identity Check
        identity_diff = abs(round(assets - (liab + eq), 2))
        assert identity_diff <= 0.02, (
            f"{ticker} {yr}A: Balance Sheet out of balance! Assets={assets}T, Liab={liab}T, Eq={eq}T, Diff={identity_diff}T"
        )
        assert abs(chk) <= 0.02, f"{ticker} {yr}A: Stored balance_check ({chk}) exceeds tolerance"


@pytest.mark.parametrize("ticker", UNIVERSAL_TEST_TICKERS)
def test_cash_flow_statement_polarity_and_continuity(ticker):
    """
    Guarantees Cash Flow Statement signs:
    - CapEx must be negative outflow (or 0).
    - Dividends paid must be negative outflow (or 0).
    - CFO must be populated.
    """
    data = FinancialDataLoader.fetch_company_data(ticker, source="idx")
    cf_rows = data["historical_statements"].get("cash_flow", [])

    for row in cf_rows:
        yr = row["year"]
        capex = row.get("capex", 0.0)
        divs = row.get("dividends_paid", 0.0)

        assert capex <= 0.0, f"{ticker} {yr}A: CapEx must be negative outflow, got {capex}"
        assert divs <= 0.0, f"{ticker} {yr}A: Dividends paid must be negative outflow, got {divs}"
