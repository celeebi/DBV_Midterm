import pytest
from src.models.rnav import RNAVModel


def test_rnav_calculation_baseline():
    """Verifies baseline RNAV calculation against institutional property metrics."""
    result = RNAVModel.calculate_rnav(
        investment_properties_noi=2450.0,
        cap_rate=0.08,
        land_bank_hectares=285.0,
        land_market_price_per_sqm=5500000.0,
        unbilled_presales=1850.0,
        presales_ebit_margin=0.35,
        cash_and_equivalents=5190.0,
        total_debt=5580.0,
        other_liabilities=2100.0,
        shares_outstanding=48.16,
        target_nav_discount=0.25
    )

    # Check GAV components
    assert result["revalued_investment_properties"] == 30625.0  # 2450 / 0.08
    assert result["revalued_land_bank"] == 15675.0            # 285 * 10000 * 5.5m / 1e9
    assert result["unbilled_presales_contribution"] == 647.5   # 1850 * 0.35
    assert result["cash_and_equivalents"] == 5190.0

    # Total GAV
    expected_gav = 30625.0 + 15675.0 + 647.5 + 5190.0
    assert result["gross_asset_value"] == expected_gav

    # Obligations & NAV
    assert result["total_obligations"] == 5580.0 + 2100.0
    expected_nav = expected_gav - 7680.0
    assert result["net_asset_value"] == expected_nav

    # 25% Target NAV Discount
    assert result["target_nav_discount_pct"] == 25.0
    expected_target_equity = expected_nav * 0.75
    assert abs(result["target_equity_value"] - expected_target_equity) < 0.01

    # Per Share Target
    expected_target_price = round(expected_target_equity / 48.16)
    assert result["target_share_price"] == expected_target_price
    assert result["target_share_price"] > 0
    assert result["undiscounted_nav_per_share"] > result["target_share_price"]


def test_rnav_portfolio_assets_detail():
    """Verifies itemized portfolio and land bank breakdowns."""
    portfolio = [
        {"name": "Kota Kasablanka", "noi": 850.0, "cap_rate": 0.08, "city": "Jakarta"},
        {"name": "Gandaria City", "noi": 620.0, "cap_rate": 0.08, "city": "Jakarta"}
    ]
    land = [
        {"location": "Pakuwon City", "hectares": 120.0, "market_idr_sqm": 7000000}
    ]

    res = RNAVModel.calculate_rnav(
        portfolio_assets=portfolio,
        land_assets=land,
        shares_outstanding=48.16,
        target_nav_discount=0.20
    )

    assert len(res["properties_detail"]) == 2
    assert len(res["land_detail"]) == 1
    assert res["total_noi"] == 1470.0
    assert res["total_hectares"] == 120.0
    assert res["target_nav_discount_pct"] == 20.0


def test_rnav_zero_discount():
    """Verifies behavior when discount is 0%."""
    res = RNAVModel.calculate_rnav(target_nav_discount=0.0)
    assert res["target_nav_discount_pct"] == 0.0
    assert res["discount_amount"] == 0.0
    assert res["target_equity_value"] == res["net_asset_value"]
    assert res["target_share_price"] == res["undiscounted_nav_per_share"]
