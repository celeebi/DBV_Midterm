import pytest
from src.models.eva import EVAModel


def test_eva_mathematical_identity():
    """Verifies that EVA = NOPAT - Capital Charge == Invested Capital * (ROIC - WACC)."""
    res = EVAModel.calculate_eva()
    schedule = res["schedule"]
    assert len(schedule) == 10

    for row in schedule:
        nopat = row["nopat"]
        cap_charge = row["capital_charge"]
        eva = row["eva"]
        ic = row["invested_capital_beg"]
        spread = row["economic_spread_pct"] / 100.0

        # EVA identity 1: NOPAT - Capital Charge
        assert abs(eva - (nopat - cap_charge)) < 0.05
        # EVA identity 2: Invested Capital * Spread
        assert abs(eva - (ic * spread)) < 0.05


def test_eva_10_year_schedule_and_mva():
    """Verifies MVA summation and enterprise value equation."""
    res = EVAModel.calculate_eva(
        base_revenue=7110.0,
        ebitda_margin=0.50,
        initial_invested_capital=24100.0,
        shares_outstanding=48.16,
        net_debt=390.0
    )

    assert res["initial_invested_capital"] == 24100.0
    assert res["total_mva"] == round(res["sum_pv_eva_10yr"] + res["pv_terminal_mva"], 2)
    assert res["enterprise_value"] == round(res["initial_invested_capital"] + res["total_mva"], 2)
    assert res["equity_value"] == round(res["enterprise_value"] - res["net_debt"], 2)
    assert res["target_share_price"] > 0


def test_eva_value_destruction_when_roic_below_wacc():
    """Verifies that when WACC exceeds ROIC, EVA is negative (destroying value)."""
    # Set high WACC of 25% where margin is low
    res = EVAModel.calculate_eva(
        ebitda_margin=0.15,
        wacc=0.25,
        initial_invested_capital=35000.0
    )

    for row in res["schedule"]:
        assert row["eva"] < 0.0
        assert row["economic_spread_pct"] < 0.0

    assert res["total_mva"] < 0.0
    # EV should be lower than initial invested capital when MVA is negative
    assert res["enterprise_value"] < res["initial_invested_capital"]
