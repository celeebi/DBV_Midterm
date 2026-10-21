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
