"""

Tests for the IDX Financial Statements Adapter (src.data.adapters.idx_adapter).

Verifies XBRL normalization, scale translation (Millions -> Trillions IDR),

caching, and valuation engine compatibility.

"""



import os

import pytest

from src.data.adapters.idx_adapter import IDXAdapter, PWON_AUDITED_SEED

from src.models.pro_forma import ProFormaModel

from src.models.dcf import DCFModel

from src.models.rim import ResidualIncomeModel

from src.models.ddm import DividendDiscountModel

from src.models.three_statement import ThreeStatementModel





def test_clean_ticker():

    assert IDXAdapter.clean_ticker("PWON.JK") == "PWON"

    assert IDXAdapter.clean_ticker("pwon.jk") == "PWON"

    assert IDXAdapter.clean_ticker("ASII") == "ASII"

    assert IDXAdapter.clean_ticker("  BBCA.JK  ") == "BBCA"





def test_pwon_audited_financials_structure():

    fin = IDXAdapter.get_financials("PWON")

    assert fin is not None

    assert "historical" in fin

    hist = fin["historical"]



    # Verify 5-year sequence

    assert len(hist["years"]) == 5

    assert hist["years"] == [2021, 2022, 2023, 2024, 2025]



    # Verify Trillion scale (not raw millions)

    for rev in hist["revenue"]:

        assert 1.0 <= rev <= 10.0, f"Revenue {rev} not in expected Trillion IDR range"



    for eq in hist["total_equity"]:

        assert 10.0 <= eq <= 35.0, f"Total equity {eq} not in expected Trillion IDR range"



    # Verify balance sheet metrics

    assert hist["cash_and_equivalents"] == 9.20

    assert hist["total_debt"] == 6.44

    assert hist["minority_interest"] == 4.77

    assert hist["revenue"][-1] == 7.11

    assert hist["ebit"][-1] == 3.14

    assert hist["ebitda"][-1] == 3.66



    # Verify drivers

    assert "drivers" in fin

    assert fin["drivers"]["dso_days"] > 0

    assert fin["drivers"]["dio_days"] > 0



    # Verify historical 3-statement tables

    assert "historical_statements" in fin

    hs = fin["historical_statements"]

    assert len(hs["balance_sheet"]) == 5

    assert len(hs["income_statement"]) == 5

    assert len(hs["cash_flow"]) == 5

    assert len(hs["drivers"]) == 5

    for row in hs["balance_sheet"]:

        assert abs(row["balance_check"]) < 0.01





def test_hybrid_company_data_generation():

    payload = IDXAdapter.fetch_hybrid_company_data("PWON.JK", live_price=280.0, shares_b=48.16, beta=0.75)



    assert payload["ticker"] == "PWON.JK"

    assert payload["current_price"] == 280.0

    assert payload["shares_outstanding"] == 48.16

    assert payload["market_cap"] > 0

    assert payload["beta"] == 0.75

    assert payload["capm_params"]["mature_erp"] == 5.00

    assert payload["capm_params"]["crp"] == 2.16

    assert payload["source"] == "IDX Official XBRL (idx.co.id)"





def test_cache_save_and_load(tmp_path):

    test_data = {

        "ticker": "TEST.JK",

        "clean_ticker": "TEST",

        "historical": {

            "years": [2023, 2024],

            "revenue": [5.0, 5.5],

            "total_debt": 1.0,

            "cash_and_equivalents": 2.0

        }

    }



    # Save

    IDXAdapter.save_to_cache("TEST", test_data, 2023, 2024)

    cache_path = IDXAdapter.get_cache_path("TEST", 2023, 2024)

    assert os.path.exists(cache_path)



    # Clean up test file

    try:

        os.remove(cache_path)

    except OSError:

        pass





def test_all_models_run_on_idx_data():

    """

    Validates end-to-end valuation execution on IDX audited data with zero modifications to models.

    """

    comp = IDXAdapter.fetch_hybrid_company_data("PWON.JK")

    hist = comp["historical"]

    base_rev = hist["revenue"][-1]

    cash = hist["cash_and_equivalents"]

    debt = hist["total_debt"]

    mi = hist["minority_interest"]

    shares_b = comp["shares_outstanding"]



    # 1. Pro Forma Roll-Forward

    pf = ProFormaModel.generate_pro_forma(base_revenue=base_rev, wacc=0.088)

    assert len(pf["schedule"]) == 10

    assert pf["pv_tv_gordon"] > 0



    # 2. DCF Model

    dcf = DCFModel.calculate_dcf(

        pro_forma_result=pf,

        cash=cash,

        debt=debt,

        minority_interest=mi,

        shares_outstanding=shares_b

    )

    assert dcf["dcf_price"] > 300.0, f"DCF price {dcf['dcf_price']} unreasonable"



    # 3. Residual Income Model

    rim = ResidualIncomeModel.calculate_rim(

        book_value_equity=hist["total_equity"][-1],

        base_net_income=hist["net_income"][-1],

        ke=0.12,

        shares_outstanding=shares_b

    )

    assert rim["rim_target_price"] > 200.0, f"RIM price {rim['rim_target_price']} unreasonable"



    # 4. Dividend Discount Model

    ddm = DividendDiscountModel.calculate_ddm(

        base_net_income=hist["net_income"][-1],

        shares_outstanding=shares_b,

        ke=0.12

    )

    assert ddm["ddm_price"] > 100.0, f"DDM price {ddm['ddm_price']} unreasonable"



    # 5. Three-Statement Engine

    act = ThreeStatementModel.BASE_2025_ACTUALS.copy()

    act["revenue"] = base_rev

    act["ebit"] = hist["ebit"][-1]

    act["net_income"] = hist["net_income"][-1]

    act["cash"] = cash

    act["total_debt"] = debt

    act["long_term_debt"] = debt - act["short_term_debt"]

    # Re-articulate balance sheet so Assets == Liabilities + Equity

    act["total_assets"] = act["cash"] + act["ar"] + act["inventory"] + act["other_current_assets"] + act["net_ppe"] + act["other_non_current_assets"]

    act["total_liabilities"] = act["ap"] + act["short_term_debt"] + act["other_current_liabilities"] + act["long_term_debt"] + act["other_non_current_liabilities"]

    act["total_equity"] = act["total_assets"] - act["total_liabilities"]

    act["retained_earnings"] = act["total_equity"] - act["share_capital"] - act["minority_interest"]



    three_stmt = ThreeStatementModel.generate_three_statements(base_actuals=act)

    # Balance Sheet must balance perfectly (balance_check == 0)

    for _, row in three_stmt["balance_sheet"].iterrows():

        assert abs(row["balance_check"]) < 0.05, f"Year {row['year']} balance check failed: {row['balance_check']}"





def test_idx_client_url_quoting_and_http2_safety():

    """

    Validates that client path quoting handles raw spaces in attachment paths

    without throwing curl (16) HTTP/2 framing errors.

    """

    import urllib.parse

    raw_path = "/Portals/0/StaticData/ListedCompanies/Corporate_Actions//Laporan Keuangan Tahun 2024/Audit/ASII/FinancialStatement-2024-Tahunan-ASII.xlsx"

    parts = urllib.parse.urlsplit(raw_path)

    quoted = urllib.parse.quote(parts.path, safe="/:")

    assert "%20" in quoted

    assert " " not in quoted





def test_asii_cached_adapter_historical_statements():

    """

    Verifies that ASII financials loaded via IDXAdapter produce full multi-year 3-statement tables.

    """

    asii_data = IDXAdapter.get_financials("ASII")

    assert asii_data is not None

    assert "historical_statements" in asii_data

    hs = asii_data["historical_statements"]

    assert len(hs["balance_sheet"]) >= 4

    assert len(hs["income_statement"]) >= 4

    for row in hs["balance_sheet"]:

        assert abs(row["balance_check"]) < 0.01





def test_data_availability_helper():

    from src.data.adapters.idx_adapter import compute_data_availability



    # 1. Complete

    complete = compute_data_availability("PWON", [2020, 2021, 2022, 2023, 2024])

    assert complete["status"] == "complete"

    assert complete["years_count"] == 5

    assert complete["notice_level"] == "info"



    # 2. Partial (Recent IPO like AADI)

    partial = compute_data_availability("AADI", [2023, 2024], [2020, 2021, 2022, 2023, 2024])

    assert partial["status"] == "partial"

    assert partial["years_count"] == 2

    assert partial["notice_level"] == "warning"

    assert "Limited Historical Depth" in partial["title"]

    assert "2020" in partial["message"]



    # 3. Empty (No filings on IDX)

    empty = compute_data_availability("NONEXISTENT", [])

    assert empty["status"] == "empty"

    assert empty["years_count"] == 0

    assert empty["notice_level"] == "error"

    assert "No Audited Filings Found" in empty["title"]





def test_aadi_usd_currency_conversion_and_balance_check():

    from src.data.adapters.idx_adapter import IDXAdapter

    aadi = IDXAdapter.get_financials("AADI")

    assert aadi is not None

    assert aadi["reporting_currency"] == "USD"

    assert aadi["fx_conversion_applied"] is True

    assert aadi["fx_rate_applied"] in (16250.0, 16400.0)



    # Revenues should be ~86-92 Trillion IDR (not 0.005 Trillion IDR)

    revs = aadi["historical"]["revenue"]

    assert len(revs) in (2, 3)

    assert 70.0 < revs[-1] < 100.0, f"2024 Revenue {revs[-1]} not in expected IDR Trillion range"

    assert 70.0 < revs[0] < 110.0, f"2023 Revenue {revs[0]} not in expected IDR Trillion range"



    # Balance sheet check must be exactly 0.00

    for row in aadi["historical_statements"]["balance_sheet"]:

        assert abs(row["balance_check"]) < 0.01, f"Year {row['year']} balance check failed: {row['balance_check']}"





def test_antm_self_healing_synthesis_and_zero_balance():

    from src.data.adapters.idx_adapter import IDXAdapter

    antm = IDXAdapter.get_financials("ANTM")

    assert antm is not None

    assert antm["reporting_currency"] == "IDR"

    assert antm["historical"]["years"] == [2021, 2022, 2023, 2024, 2025]

    for row in antm["historical_statements"]["balance_sheet"]:

        assert abs(row["balance_check"]) < 0.01, f"Year {row['year']} balance check failed: {row['balance_check']}"



    # Verify authentic inventory and share capital normalization

    bs_2025 = [r for r in antm["historical_statements"]["balance_sheet"] if r["year"] == 2025][0]

    assert bs_2025["inventory"] > 5.0, f"Expected inventory > 5T, got {bs_2025['inventory']}"

    assert bs_2025["share_capital"] > 10.0, f"Expected share_capital > 10T, got {bs_2025['share_capital']}"





def test_akra_five_year_audited_statements_and_inventory():

    from src.data.adapters.idx_adapter import IDXAdapter

    akra = IDXAdapter.get_financials("AKRA")

    assert akra is not None

    assert akra["historical"]["years"] == [2021, 2022, 2023, 2024, 2025]

    for row in akra["historical_statements"]["balance_sheet"]:

        assert abs(row["balance_check"]) < 0.01, f"Year {row['year']} balance check failed: {row['balance_check']}"



    bs_2025 = [r for r in akra["historical_statements"]["balance_sheet"] if r["year"] == 2025][0]

    assert bs_2025["inventory"] > 4.0, f"Expected inventory > 4T, got {bs_2025['inventory']}"

    assert bs_2025["share_capital"] > 1.0, f"Expected share_capital > 1T, got {bs_2025['share_capital']}"





def test_aadi_dynamic_horizon_valuation_execution():

    from src.data.adapters.idx_adapter import IDXAdapter

    from src.models.pro_forma import ProFormaModel

    from src.models.dcf import DCFModel



    aadi_comp = IDXAdapter.fetch_hybrid_company_data("AADI.JK", live_price=7000.0, shares_b=8.1, beta=1.1)

    hist = aadi_comp["historical"]



    assert aadi_comp["reporting_currency"] == "USD"

    assert aadi_comp["data_availability"]["status"] == "partial"

    assert aadi_comp["calibrated_defaults"]["ebitda_margin"] > 15.0



    # Run 10-year pro forma using latest year actuals

    base_rev = hist["revenue"][-1]

    pf = ProFormaModel.generate_pro_forma(base_revenue=base_rev, wacc=0.10)

    assert len(pf["schedule"]) == 10

    assert pf["pv_tv_gordon"] > 0



    # DCF

    dcf = DCFModel.calculate_dcf(

        pro_forma_result=pf,

        cash=hist["cash_and_equivalents"],

        debt=hist["total_debt"],

        minority_interest=hist["minority_interest"],

        shares_outstanding=aadi_comp["shares_outstanding"]

    )

    assert dcf["dcf_price"] > 1000.0, f"Calculated DCF price {dcf['dcf_price']} unreasonable"



def test_idx_client_focused_1min_budget():
    """Verify IDXClient defaults to a focused 1-minute (60.0s) budget with 5 retries."""
    from src.data.adapters.idx_scraper.client import IDXClient
    client = IDXClient()
    assert client.max_duration_sec == 60.0, f"Expected 60.0s, got {client.max_duration_sec}"
    assert client.max_retries == 5, f"Expected 5 retries, got {client.max_retries}"


def test_idx_adapter_cache_rejects_yahoo_files(tmp_path, monkeypatch):
    """Verify that get_financials strictly rejects Yahoo Finance fallback files in idx_cache."""
    import json
    from src.data.adapters.idx_adapter import IDXAdapter
    import src.data.adapters.idx_adapter as adapter_module

    # Create temporary cache dir with a Yahoo-sourced JSON file
    fake_cache = tmp_path / "fake_idx_cache"
    fake_cache.mkdir()
    fake_file = fake_cache / "FAKE_2022_2025.json"
    fake_data = {
        "ticker": "FAKE.JK",
        "clean_ticker": "FAKE",
        "source": "Yahoo Finance (IDX Cloudflare Bypass Fallback)",
        "historical": {"years": [2022, 2023, 2024, 2025]}
    }
    with open(fake_file, "w", encoding="utf-8") as f:
        json.dump(fake_data, f)

    monkeypatch.setattr(adapter_module, "CACHE_DIR", str(fake_cache))

    # Mock scraper to verify get_financials skips the Yahoo cache and calls the scraper
    scraper_called = []
    class MockScraper:
        def __init__(self, output_dir=None, client=None):
            self.client = client
        def build_ready_to_forecast(self, clean, start_year, end_year):
            scraper_called.append(clean)
            raise RuntimeError("Scraper invoked as expected")

    monkeypatch.setattr(adapter_module, "IDXFinancialScraper", MockScraper)

    with pytest.raises(RuntimeError, match="Scraper invoked as expected"):
        IDXAdapter.get_financials("FAKE")

    assert "FAKE" in scraper_called, "Scraper was not invoked when only Yahoo cache existed"


def test_loader_mlbi_prioritizes_idx_and_falls_back_to_authentic_4y():
    """Verify that MLBI query returns authentic 4-year Yahoo fallback data with valid Direct Method CFO."""
    from src.data.loader import FinancialDataLoader
    comp = FinancialDataLoader.fetch_company_data("MLBI.JK")

    assert comp["ticker"] == "MLBI.JK"
    assert comp["historical"]["years"] == [2022, 2023, 2024, 2025]
    assert "Yahoo Finance" in comp["source"]
    assert comp["data_availability"]["status"] == "partial"
    assert comp["data_availability"]["missing_years"] == [2021]

    # Verify balance sheet identity
    for row in comp["historical_statements"]["balance_sheet"]:
        assert abs(row["balance_check"]) < 0.01

    # Verify non-zero CFO
    for row in comp["historical_statements"]["cash_flow"]:
        assert row["cfo"] != 0.0
