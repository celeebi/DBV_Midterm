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
    pf_sched = data["pro_forma_schedule"]
    assert len(pf_sched) == 10
    assert pf_sched[0]["growth_pct"] == 18.0
    assert pf_sched[0]["margin_pct"] == 45.0
    assert pf_sched[0]["revenue"] == round(7.11 * 1.18, 2)

    # Verify 3-statement model Income Statement matches custom growth
    is_rows = data["three_statement"]["income_statement"]
    assert len(is_rows) == 10
    assert round(is_rows[0]["growth_pct"], 1) == 18.0
    assert round(is_rows[0]["revenue"], 2) == round(7.11 * 1.18, 2)
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

