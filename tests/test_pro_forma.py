"""
Unit tests for CapitalStructureModel and ProFormaModel.
"""

import pytest
from src.models.parameters import CapitalStructureModel
from src.models.pro_forma import ProFormaModel


def test_wacc_calculation_accuracy():
    # Rf=6.6%, Beta=0.85, ERP=7.2% -> Ke = 6.6% + 0.85 * 7.2% = 12.72%
    # Kd_pre=5.8%, t=22% -> Kd_after = 5.8% * 0.78 = 4.524%
    # Wd=21.5%, We=78.5%
    # WACC = (0.785 * 12.72%) + (0.215 * 4.524%) = 9.9852% + 0.97266% = 10.96%
    res = CapitalStructureModel.calculate_wacc(
        rf=0.066,
        beta=0.85,
        erp=0.072,
        kd_pre=0.058,
        tax_rate=0.22,
        wd=0.215
    )
    assert 0.10 <= res["wacc"] <= 0.12
    assert "Ke = Rf + (β × ERP)" in res["proofs"]["ke"]
    assert "WACC = (We × Ke) + (Wd × Kd)" in res["proofs"]["wacc"]


def test_capm_mature_erp_and_crp_decomposition():
    # Rf=6.6%, Beta=0.75, Mature ERP=5.0%, CRP=2.16% -> Total ERP = 7.16%
    # Ke = 6.6% + 0.75 * 7.16% = 11.97%
    # Kd_pre=6.5%, t=22% -> Kd_after = 6.5% * 0.78 = 5.07%
    # Wd=20.0%, We=80.0%
    # WACC = (0.80 * 11.97%) + (0.20 * 5.07%) = 9.576% + 1.014% = 10.59%
    res = CapitalStructureModel.calculate_wacc(
        rf=0.0660,
        beta=0.75,
        mature_erp=0.0500,
        crp=0.0216,
        kd_pre=0.0650,
        tax_rate=0.22,
        wd=0.200
    )
    assert abs(res["erp"] - 0.0716) < 0.0001
    assert abs(res["ke"] - 0.1197) < 0.0005
    assert abs(res["kd_after"] - 0.0507) < 0.0005
    assert abs(res["wacc"] - 0.1059) < 0.0005
    assert "Total ERP = Mature ERP + CRP" in res["proofs"]["erp"]


def test_pro_forma_10_year_roll_forward():
    # Test that year-by-year growth rolls forward correctly
    custom_growth = [6.0, 3.0, 2.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5]
    res = ProFormaModel.generate_pro_forma(
        base_revenue=300.0,
        growth_rates=custom_growth,
        wacc=0.0952,
        terminal_g=0.015
    )
    df = res["schedule"]
    assert len(df) == 10
    
    # Year 1 revenue: 300 * 1.06 = 318.0
    assert abs(df.iloc[0]["revenue"] - 318.0) < 0.1
    # Year 2 revenue: 318 * 1.03 = 327.54
    assert abs(df.iloc[1]["revenue"] - 327.54) < 0.2
    
    # Check that FCFF = NOPAT + Depr - CapEx - Delta NWC
    y1 = df.iloc[0]
    expected_fcff = y1["nopat"] + y1["depr"] - y1["capex"] - y1["delta_nwc"]
    assert abs(y1["fcff"] - expected_fcff) < 0.05

    # Check terminal value
    assert res["tv_gordon"] > 0
    assert res["enterprise_value"] > res["total_pv_explicit"]


def test_auto_fade_helper():
    faded = ProFormaModel.apply_auto_fade(y5_growth=4.5, terminal_g=0.015)
    assert len(faded) == 5
    assert faded[0] < 4.5
    assert abs(faded[-1] - 1.5) < 0.1
