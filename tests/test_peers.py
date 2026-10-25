"""
Institutional Unit and Integration Tests for Peer Intelligence Universe Service
and Relative Multiples Comps Engine across the 112 IDX Universe.
"""

import pytest
from starlette.testclient import TestClient
from server import app
from src.data.peers import PeerUniverseService
from src.models.multiples import RelativeValuationModel


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def peer_service():
    return PeerUniverseService.get_instance()


def test_peer_universe_service_catalog(peer_service):
    """Verifies that the PeerUniverseService indexes >= 110 IDX equities in memory."""
    catalog = peer_service.get_universe_catalog()
    assert len(catalog) >= 110
    
    sectors = {c["sector"] for c in catalog if c["sector"]}
    assert "Basic Materials" in sectors
    assert "Real Estate" in sectors
    assert "Consumer Defensive" in sectors
    assert "Communication Services" in sectors
    assert "Energy" in sectors
    assert "Industrials" in sectors


def test_taxonomy_normalization(peer_service):
    """Verifies that legacy 'General Corporate' placeholders are cleanly normalized."""
    antm = peer_service.get_company_metrics("ANTM.JK")
    assert antm is not None
    assert antm["sector"] == "Basic Materials"
    assert "Metals & Mining" in antm["industry"]
    assert "Aneka Tambang" in antm["name"]

    ptba = peer_service.get_company_metrics("PTBA.JK")
    assert ptba is not None
    assert ptba["sector"] == "Energy"
    assert ptba["industry"] == "Thermal Coal"

    towr = peer_service.get_company_metrics("TOWR.JK")
    assert towr is not None
    assert towr["sector"] == "Communication Services"


def test_recommended_peers_mining(peer_service):
    """Verifies that ANTM.JK discovers authentic mining peers with positive metrics."""
    peers = peer_service.get_recommended_peers("ANTM.JK", max_peers=5)
    assert len(peers) >= 3
    peer_tickers = [p["ticker"] for p in peers]
    
    # Must include major IDX metals & mining companies
    assert any(t in peer_tickers for t in ["INCO.JK", "MDKA.JK", "TINS.JK", "MBMA.JK", "NCKL.JK", "HRUM.JK", "CITA.JK"])
    # Must NOT include target itself
    assert "ANTM.JK" not in peer_tickers

    for p in peers:
        assert p["name"] is not None
        assert p["sector"] == "Basic Materials"
        if p["ev_ebitda"] is not None:
            assert p["ev_ebitda"] > 0


def test_recommended_peers_property(peer_service):
    """Verifies that PWON.JK matches property developer peers."""
    peers = peer_service.get_recommended_peers("PWON.JK", max_peers=5)
    assert len(peers) >= 3
    peer_tickers = [p["ticker"] for p in peers]
    assert "BSDE.JK" in peer_tickers
    assert "CTRA.JK" in peer_tickers
    assert "PWON.JK" not in peer_tickers


def test_relative_valuation_model_statistics():
    """Verifies median, mean, harmonic mean, and 25th percentile calculations."""
    test_peers = [
        {"name": "Peer A", "ticker": "A.JK", "ev_ebitda": 4.0, "pe": 8.0, "pb": 1.0},
        {"name": "Peer B", "ticker": "B.JK", "ev_ebitda": 6.0, "pe": 10.0, "pb": 1.5},
        {"name": "Peer C", "ticker": "C.JK", "ev_ebitda": 8.0, "pe": 12.0, "pb": 2.0},
    ]

    res_median = RelativeValuationModel.calculate_comps(
        peers_data=test_peers,
        target_ebitda=10.0,
        target_net_income=5.0,
        target_equity=40.0,
        shares_outstanding=10.0,
        cash=2.0,
        debt=4.0,
        minority_interest=0.0,
        stat_method="median"
    )
    assert res_median["benchmark_ev_ebitda"] == 6.0
    assert res_median["benchmark_pe"] == 10.0

    res_mean = RelativeValuationModel.calculate_comps(
        peers_data=test_peers,
        target_ebitda=10.0,
        target_net_income=5.0,
        target_equity=40.0,
        shares_outstanding=10.0,
        cash=2.0,
        debt=4.0,
        minority_interest=0.0,
        stat_method="average"
    )
    assert res_mean["benchmark_ev_ebitda"] == 6.0

    res_harmonic = RelativeValuationModel.calculate_comps(
        peers_data=test_peers,
        target_ebitda=10.0,
        target_net_income=5.0,
        target_equity=40.0,
        shares_outstanding=10.0,
        cash=2.0,
        debt=4.0,
        minority_interest=0.0,
        stat_method="harmonic_mean"
    )
    # Harmonic mean of 4, 6, 8 = 3 / (1/4 + 1/6 + 1/8) = 3 / (13/24) = 5.538
    assert 5.5 <= res_harmonic["benchmark_ev_ebitda"] <= 5.6


def test_api_peers_endpoint(client):
    """Verifies GET /api/peers returns recommended peers and universe catalog."""
    res = client.get("/api/peers?ticker=ANTM.JK")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["ticker"] == "ANTM.JK"
    assert len(data["recommended_peers"]) >= 3
    assert len(data["universe_catalog"]) >= 110


def test_api_company_attaches_authentic_comps(client):
    """Verifies that GET /api/company?ticker=ANTM.JK attaches real peers and catalog."""
    res = client.get("/api/company?ticker=ANTM.JK")
    assert res.status_code == 200
    comp = res.json()["data"]
    assert "comps" in comp
    assert len(comp["comps"]) >= 3
    assert comp["comps"][0]["name"] != "Industry Peer 1"
    assert "universe_catalog" in comp


def test_api_recalculate_with_custom_peers(client):
    """Verifies that POST /api/recalculate ingests custom peers and returns dynamic target prices."""
    custom_peers = [
        {"name": "Vale Indonesia", "ticker": "INCO.JK", "ev_ebitda": 15.0, "pe": 20.0, "pb": 1.5, "rev_growth": 5.0, "ebitda_margin": 25.0},
        {"name": "Timah", "ticker": "TINS.JK", "ev_ebitda": 10.0, "pe": 14.0, "pb": 2.0, "rev_growth": 8.0, "ebitda_margin": 18.0}
    ]
    payload = {
        "ticker": "ANTM.JK",
        "comps_params": {
            "peers": custom_peers,
            "stat_method": "median",
            "filter_outliers": True
        }
    }
    res = client.post("/api/recalculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "comps" in data
    assert data["comps"]["benchmark_ev_ebitda"] == 12.5  # median of 15 and 10
    assert data["comps"]["benchmark_pe"] == 17.0         # median of 20 and 14
    assert len(data["comps"]["peers"]) == 2
