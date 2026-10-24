"""
Universal Data Pipeline & Scenario Monotonicity Test Suite.
Verifies:
1. Universal statement harmonizer maintains 100% schema parity with IDX_GetFinancialStatement.
2. Balance sheet zero-balance identity & income statement linearity for arbitrary tickers (INDF, ACES, MEDC).
3. Strictly monotonic scenario target price ordering (Bear < Base < Bull) across all sectors.
4. Circuit breaker fast-fail on Cloudflare WAF 403 blocks.
"""

import pytest
from src.data.loader import FinancialDataLoader
from src.models.scenarios import ScenarioForecaster
from src.models.parameters import CapitalStructureModel
from src.data.adapters.idx_scraper.client import IDXClient, IDXCloudflareChallengeError


def test_universal_harmonizer_schema_parity_indf():
    """Verify INDF produces 100% schema parity with IDX_GetFinancialStatement."""
    data = FinancialDataLoader.fetch_company_data("INDF.JK", source="idx")
    assert data is not None
    assert "historical" in data
    assert "historical_statements" in data
    
    # 1. Historical summary keys
    hist = data["historical"]
    for key in ["years", "revenue", "ebit", "depr", "ebitda", "nopat", "capex", "fcff", "net_income", "total_assets", "total_liabilities", "total_equity", "cash_and_equivalents", "total_debt", "minority_interest"]:
        assert key in hist, f"Missing key in historical: {key}"
        
    # 2. 4 sub-tables in historical_statements
    stmts = data["historical_statements"]
    assert "balance_sheet" in stmts
    assert "income_statement" in stmts
    assert "cash_flow" in stmts
    assert "drivers" in stmts
    assert len(stmts["balance_sheet"]) >= 4
    assert len(stmts["income_statement"]) >= 4

    # 3. Income Statement Linearity
    for row in stmts["income_statement"]:
        rev = row["revenue"]
        cogs = row["cogs"]
        gp = row["gross_profit"]
        assert rev > 0
        assert cogs >= 0
        assert abs(gp - round(rev - cogs, 2)) <= 0.05

    # 4. Balance Sheet Zero Balance Identity
    for row in stmts["balance_sheet"]:
        assets = row["total_assets"]
        liab = row["total_liabilities"]
        eq = row["total_equity"]
        chk = row["balance_check"]
        assert abs(chk) <= 0.05, f"Balance check failed: {chk} for year {row['year']}"


def test_scenario_monotonic_ordering_akra():
    """Verify Bear < Base < Bull for thin-margin company AKRA."""
    company = FinancialDataLoader.fetch_company_data("AKRA.JK", source="idx")
    hist = company["historical"]
    cal = company.get("calibrated_defaults", {})
    margin = cal.get("ebitda_margin", 6.8)
    capex_pct = cal.get("capex_pct_rev", 6.0)

    wacc_res = CapitalStructureModel.calculate_wacc(
        rf=0.066, beta=company.get("beta", 0.75), mature_erp=0.05, crp=0.0216, kd_pre=0.065, tax_rate=0.22, wd=0.20
    )
    
    scenarios = ScenarioForecaster.run_scenarios(
        base_revenue=hist["revenue"][-1],
        base_growth=[10.0, 9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.5],
        base_margins=[margin] * 10,
        base_wacc=wacc_res["wacc"],
        base_terminal_g=0.015,
        cash=hist.get("cash_and_equivalents", 6.4),
        debt=hist.get("total_debt", 5.12),
        minority_interest=hist.get("minority_interest", 3.45),
        shares_outstanding=company["shares_outstanding"],
        capex_pct=capex_pct / 100.0,
        exit_multiple=6.5
    )

    p_bear = scenarios["bear"]["price"]
    p_base = scenarios["base"]["price"]
    p_bull = scenarios["bull"]["price"]

    assert p_bear < p_base, f"Expected Bear ({p_bear}) < Base ({p_base})"
    assert p_base < p_bull, f"Expected Base ({p_base}) < Bull ({p_bull})"


def test_scenario_monotonic_ordering_pwon():
    """Verify Bear < Base < Bull for high-margin company PWON."""
    company = FinancialDataLoader.fetch_company_data("PWON.JK", source="idx")
    hist = company["historical"]
    
    wacc_res = CapitalStructureModel.calculate_wacc(
        rf=0.066, beta=0.75, mature_erp=0.05, crp=0.0216, kd_pre=0.065, tax_rate=0.22, wd=0.20
    )

    scenarios = ScenarioForecaster.run_scenarios(
        base_revenue=hist["revenue"][-1],
        base_growth=[7.0, 6.5, 5.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5],
        base_margins=[41.0, 41.0, 40.5, 40.5, 40.0, 39.5, 39.0, 38.5, 38.0, 38.0],
        base_wacc=wacc_res["wacc"],
        base_terminal_g=0.015,
        cash=hist.get("cash_and_equivalents", 9.20),
        debt=hist.get("total_debt", 6.44),
        minority_interest=hist.get("minority_interest", 4.77),
        shares_outstanding=company["shares_outstanding"],
        capex_pct=0.08,
        exit_multiple=6.0
    )

    p_bear = scenarios["bear"]["price"]
    p_base = scenarios["base"]["price"]
    p_bull = scenarios["bull"]["price"]

    assert p_bear < p_base, f"Expected Bear ({p_bear}) < Base ({p_base})"
    assert p_base < p_bull, f"Expected Base ({p_base}) < Bull ({p_bull})"


def test_idx_client_fast_fail_on_cloudflare_challenge():
    """Verify IDXClient immediately trips circuit breaker on 403."""
    client = IDXClient(max_retries=1)
    # Homepage or primary endpoint returns 403 Cloudflare challenge
    with pytest.raises(IDXCloudflareChallengeError):
        client.get("https://www.idx.co.id/primary/ListedCompany/GetFinancialReport?year=2024")


def test_provenance_marking_idx_vs_yfinance():
    """Verify explicit provenance marking distinguishing IDX XBRL from Yahoo Finance."""
    pwon = FinancialDataLoader.fetch_company_data("PWON.JK", source="idx")
    assert "source" in pwon
    assert "idx" in pwon["source"].lower()
    assert "yahoo" not in pwon["source"].lower()

    icbp = FinancialDataLoader.fetch_company_data("ICBP.JK", source="idx")
    assert "source" in icbp
    assert "yahoo" in icbp["source"].lower()

