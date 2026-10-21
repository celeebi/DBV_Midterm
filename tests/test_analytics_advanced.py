import pytest
from src.analytics.tornado import TornadoEngine
from src.analytics.dupont import DuPontEngine


def test_tornado_calculation_and_sorting():
    """Verifies that the Tornado Engine computes sensitivities and sorts them descending by swing."""
    res = TornadoEngine.calculate_tornado()
    assert "base_share_price" in res
    assert res["base_share_price"] > 0

    items = res["items"]
    assert len(items) >= 5

    # Check descending order of swing
    for i in range(len(items) - 1):
        assert items[i]["swing"] >= items[i + 1]["swing"]

    # Top drivers should include WACC or EBITDA margin
    top_keys = [items[0]["key"], items[1]["key"]]
    assert "wacc" in top_keys or "ebitda_margin" in top_keys


def test_dupont_identity_verification():
    """Verifies that the product of the 5 DuPont stages matches direct ROE."""
    res = DuPontEngine.calculate_5stage(
        revenue=7110.0,
        ebit=3199.5,
        ebt=2750.0,
        net_income=2350.0,
        total_assets=33800.0,
        total_equity=22800.0,
        ticker="PWON.JK"
    )

    assert res["identity_verified"] is True
    assert abs(res["calculated_roe_pct"] - res["direct_roe_pct"]) < 0.05
    assert res["calculated_roe_pct"] > 8.0


def test_dupont_peer_benchmarking():
    """Verifies comparison against property peer median."""
    res = DuPontEngine.calculate_5stage(ticker="PWON.JK")
    assert "peer_median_roe_pct" in res
    assert "spread_vs_peer_median_pct" in res
    assert len(res["stages"]) == 5
