import pytest
from starlette.testclient import TestClient
from server import app

client = TestClient(app)


def test_api_coverage_endpoint():
    res = client.get("/api/coverage")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert len(data["data"]) >= 5


def test_api_recalculate_includes_option_a_models():
    res = client.post("/api/recalculate", json={"ticker": "PWON.JK"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"

    # Verify Option A models are present in payload
    assert "rnav" in data
    assert data["rnav"]["target_share_price"] > 0
    assert "monte_carlo" in data
    assert data["monte_carlo"]["simulations_count"] == 10000
    assert "eva" in data
    assert data["eva"]["enterprise_value"] > 0
    assert "tornado" in data
    assert len(data["tornado"]["items"]) >= 5
    assert "dupont" in data
    assert data["dupont"]["identity_verified"] is True

    # Verify DCF bridge and EBITDA strictly originate from audited IDX statements
    assert data["company"]["historical"]["ebitda"][-1] in (3.38, 3.66)
    assert data["dcf"]["cash"] == 9.20
    assert data["dcf"]["debt"] == 6.44
    assert data["dcf"]["minority_interest"] == 4.77


def test_standalone_api_endpoints():
    # RNAV
    r1 = client.get("/api/rnav?noi=2450.0&cap_rate=0.08")
    assert r1.status_code == 200
    assert r1.json()["data"]["target_share_price"] > 0

    # Monte Carlo
    r2 = client.post("/api/monte-carlo", json={"num_simulations": 1000})
    assert r2.status_code == 200
    assert r2.json()["data"]["simulations_count"] == 1000

    # EVA
    r3 = client.get("/api/eva")
    assert r3.status_code == 200
    assert r3.json()["data"]["total_mva"] != 0

    # Tornado
    r4 = client.get("/api/tornado")
    assert r4.status_code == 200
    assert len(r4.json()["data"]["items"]) >= 5

    # DuPont
    r5 = client.get("/api/dupont?ticker=PWON.JK")
    assert r5.status_code == 200
    assert r5.json()["data"]["calculated_roe_pct"] > 0

    # WACC & Provenance
    r6 = client.get("/api/wacc?beta=0.80&rf=6.60&mature_erp=5.00&crp=2.16&kd_pre=6.50&wd=25.0&tax_rate=22.0")
    assert r6.status_code == 200
    w_data = r6.json()
    assert w_data["status"] == "success"
    assert "data" in w_data
    assert "provenance" in w_data
    assert "beta" in w_data["provenance"]
    assert "country_risk_premium" in w_data["provenance"]
    assert w_data["data"]["beta"] == 0.80
    assert w_data["data"]["ke"] > 0
    assert w_data["data"]["wacc"] > 0
    assert "Total ERP" in w_data["data"]["proofs"]["erp"]


def test_api_recalculate_with_custom_growth_and_margins():
    """Verify /api/recalculate dynamically updates 10-year pro forma and 3-statement models."""
    custom_growth = [18.0, 15.0, 12.0, 9.0, 7.0, 5.9, 4.8, 3.7, 2.6, 1.5]
    custom_margins = [45.0] * 10
    payload = {
        "ticker": "PWON.JK",
        "growth_rates": custom_growth,
        "margins": custom_margins,
        "terminal_g": 1.5,
        "capex_pct": 9.0,
        "nwc_pct": 6.0,
        "wacc_params": {
            "beta": 0.85,
            "rf": 6.60,
            "mature_erp": 5.00,
            "crp": 2.16,
            "kd_pre": 6.50,
            "wd": 25.0,
            "tax_rate": 22.0
        }
    }
    res = client.post("/api/recalculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"

    # Verify Pro Forma schedule matches custom growth rates
    base_rev = data["company"]["historical"]["revenue"][-1]
    pf_sched = data["pro_forma_schedule"]
    assert len(pf_sched) == 10
    assert pf_sched[0]["growth_pct"] == 18.0
    assert pf_sched[0]["margin_pct"] == 45.0
    assert pf_sched[0]["revenue"] == round(base_rev * 1.18, 2)

    # Verify 3-statement model Income Statement matches custom growth
    is_rows = data["three_statement"]["income_statement"]
    assert len(is_rows) == 10
    assert round(is_rows[0]["growth_pct"], 1) == 18.0
    assert round(is_rows[0]["revenue"], 2) == round(base_rev * 1.18, 2)
    assert data["three_statement"]["is_balanced"] is True


def test_api_export_excel_with_custom_assumptions_parity():
    """Verify /api/export-excel accepts custom assumptions payload and generates .xlsx."""
    custom_growth = [18.0, 15.0, 12.0, 9.0, 7.0, 5.9, 4.8, 3.7, 2.6, 1.5]
    custom_margins = [45.0] * 10
    payload = {
        "ticker": "PWON.JK",
        "growth_rates": custom_growth,
        "margins": custom_margins,
        "terminal_g": 1.5,
        "capex_pct": 9.0,
        "nwc_pct": 6.0,
        "wacc_params": {
            "beta": 0.85,
            "rf": 6.60,
            "mature_erp": 5.00,
            "crp": 2.16,
            "kd_pre": 6.50,
            "wd": 25.0,
            "tax_rate": 22.0
        }
    }
    res = client.post("/api/export-excel", json=payload)
    assert res.status_code == 200
    assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in res.headers["content-type"]
    assert len(res.content) > 10000  # Valid Excel binary payload


def test_api_company_with_idx_source():
    """Verify /api/company returns authentic audited IDX XBRL data when source=idx."""
    res = client.get("/api/company?ticker=PWON.JK&source=idx")
    assert res.status_code == 200
    payload = res.json()
    assert payload["status"] == "success"
    data = payload["data"]
    assert data["source"] == "IDX Official XBRL (idx.co.id)"
    assert data["clean_ticker"] == "PWON"
    assert "drivers" in data
    assert data["drivers"]["dso_days"] > 0


def test_api_recalculate_with_idx_source():
    """Verify /api/recalculate computes full multi-stage valuation over IDX XBRL statements."""
    res = client.post("/api/recalculate", json={"ticker": "PWON.JK", "source": "idx"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["dcf"]["dcf_price"] > 300.0
    assert data["rim"]["rim_target_price"] > 200.0
    assert data["ddm"]["ddm_price"] > 100.0

    # Verify historical 3-statement tables are present in three_statement payload
    assert "historical" in data["three_statement"]
    hist = data["three_statement"]["historical"]
    assert len(hist["balance_sheet"]) >= 4
    assert len(hist["income_statement"]) >= 4
    assert len(hist["cash_flow"]) >= 4
    assert len(hist["drivers"]) >= 4
    assert hist["balance_sheet"][0]["period"] == "2021A"

def test_api_rejects_banking_tickers_with_clear_disclosure():
    """Verify /api/company and /api/recalculate reject commercial banks with clear ALM disclosures."""
    # 1. BBCA GET /api/company
    res1 = client.get("/api/company?ticker=BBCA.JK")
    assert res1.status_code == 400
    p1 = res1.json()
    assert p1["status"] == "error"
    assert p1["error_type"] == "banking_unsupported"
    assert "Asset-Liability Management" in p1["message"] or "ALM" in p1["message"]
    assert "recommended_alternatives" in p1
    assert any(a["ticker"] == "ASII.JK" for a in p1["recommended_alternatives"])

    # 2. BBRI without .JK suffix
    res2 = client.get("/api/company?ticker=BBRI")
    assert res2.status_code == 400
    p2 = res2.json()
    assert p2["error_type"] == "banking_unsupported"

    # 3. BMRI POST /api/recalculate
    res3 = client.post("/api/recalculate", json={"ticker": "BMRI.JK"})
    assert res3.status_code == 400
    p3 = res3.json()
    assert p3["error_type"] == "banking_unsupported"
    assert "Methodology Scope Limitation" in p3["message"]



def test_provenance_source_urls_and_frontend_parity():
    """Verify authoritative external source URLs exist in backend provenance and frontend registry."""
    res = client.get("/api/wacc?beta=0.80&rf=6.60&mature_erp=5.00&crp=2.16&kd_pre=6.50&wd=25.0&tax_rate=22.0")
    assert res.status_code == 200
    prov = res.json()["provenance"]

    # Check every backend provenance entry has a valid HTTPS source_url and source_domain
    for key, meta in prov.items():
        assert "source_url" in meta, f"Missing source_url in provenance[{key}]"
        assert meta["source_url"].startswith("https://"), f"Invalid URL in provenance[{key}]: {meta['source_url']}"
        assert "source_domain" in meta and len(meta["source_domain"]) > 3

    # Specifically verify Damodaran ctryprem dataset URL
    assert prov["mature_equity_risk_premium"]["source_url"] == "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html"
    assert prov["country_risk_premium"]["source_url"] == "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html"

    # Verify frontend JSX includes clickable provenance URLs and NewsWireProvenanceTooltip
    with open("static/app_react.jsx", "r", encoding="utf-8") as f:
        jsx = f.read()
    assert "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html" in jsx
    assert "https://pajak.go.id/id/tarif-pajak-penghasilan-pph-badan" in jsx
    assert "NewsWireProvenanceTooltip" in jsx



def test_search_first_zero_default_architecture():
    """Verify search-first platform architecture has zero pre-seeded default tickers at boot."""
    # 1. Verify coverage_data.js defines empty INITIAL_COVERAGE
    with open("static/coverage_data.js", "r", encoding="utf-8") as f:
        cov_js = f.read()
    assert "window.INITIAL_COVERAGE = [];" in cov_js

    # 2. Verify static/app_react.jsx initializes empty coverage and has search-first empty prompt
    with open("static/app_react.jsx", "r", encoding="utf-8") as f:
        app_jsx = f.read()
    assert "const defaultCoverage = [];" in app_jsx
    assert "const [coverageCompanies, setCoverageCompanies] = useState([]);" in app_jsx
    assert "No Active Universe" in app_jsx
    assert "Enter any non-banking IDX ticker above" in app_jsx

    # 3. Verify arbitrary multi-sector tickers can be fetched on-demand
    for test_ticker in ["ASII.JK"]:
        res = client.get(f"/api/company?ticker={test_ticker}&source=idx")
        assert res.status_code == 200
        d = res.json()["data"]
        assert d["ticker"] == test_ticker
        assert "historical" in d
        assert len(d["historical"]["revenue"]) >= 3
