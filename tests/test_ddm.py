"""
Unit tests for DividendDiscountModel (DDM) and 4-way valuation triangulation.
"""

import io
import pytest
import openpyxl
from src.models.ddm import DividendDiscountModel
from src.models.ensemble import ValuationEnsemble
from src.models.pro_forma import ProFormaModel
from src.models.dcf import DCFModel
from src.models.multiples import RelativeValuationModel
from src.rules.recommendations import ValuationRecommender
from src.models.parameters import CapitalStructureModel
from src.analytics.exporter import ExcelModelExporter


def test_ddm_calculation_and_proofs():
    """Validates multi-stage dividend discounting mechanics and terminal perpetuity."""
    res = DividendDiscountModel.calculate_ddm(
        base_net_income=2.35,
        shares_outstanding=48.16,
        ke=0.120,
        growth_rates=[7.0, 6.5, 5.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5],
        terminal_g=0.015,
        payout_ratio=0.30
    )

    assert res["ddm_price"] > 100
    assert res["base_eps"] > 40.0
    assert res["base_dps"] == round(res["base_eps"] * 0.30, 2)
    assert len(res["schedule"]) == 10
    assert res["total_pv_dividends"] > 0
    assert res["terminal_value"] > res["total_pv_dividends"]
    assert "TV_{10}" in res["proofs"]["tv"]
    assert "P_{\\text{DDM}}" in res["proofs"]["total"]


def test_ensemble_with_ddm_triangulation():
    """Validates 4-method composite triangulation with auto-normalization."""
    dcf_p = 531.0
    comps_p = 341.0
    rim_p = 480.0
    ddm_p = 174.0

    res = ValuationEnsemble.calculate_composite_target(
        dcf_price=dcf_p,
        comps_price=comps_p,
        rim_price=rim_p,
        ddm_price=ddm_p,
        weight_dcf=0.50,
        weight_comps=0.25,
        weight_rim=0.15,
        weight_ddm=0.10,
        include_dcf=True,
        include_comps=True,
        include_rim=True,
        include_ddm=True
    )

    # 0.50*531 + 0.25*341 + 0.15*480 + 0.10*174 = 265.5 + 85.25 + 72.0 + 17.4 = 440.15 -> 440
    assert abs(res["composite_target"] - 440.0) <= 2.0
    norm_w = res["normalized_weights"]
    assert round(norm_w["dcf"] + norm_w["comps"] + norm_w["rim"] + norm_w["ddm"], 2) == 1.00
    assert "[DDM]" in res["proof"]

    # Test excluding DDM
    res_no_ddm = ValuationEnsemble.calculate_composite_target(
        dcf_price=dcf_p,
        comps_price=comps_p,
        rim_price=rim_p,
        ddm_price=ddm_p,
        weight_dcf=0.50,
        weight_comps=0.25,
        weight_rim=0.15,
        weight_ddm=0.10,
        include_ddm=False
    )
    assert res_no_ddm["normalized_weights"]["ddm"] == 0.0
    assert "[DDM]" not in res_no_ddm["proof"]


def test_excel_export_includes_ddm_triangulation():
    """Validates that the exported workbook contains the DDM row in Executive Dashboard."""
    company = {
        "name": "PT Pakuwon Jati Tbk",
        "ticker": "PWON.JK",
        "current_price": 270.0,
        "historical": {"revenue": [4.71, 5.99, 6.20, 6.67, 7.11]}
    }
    pf = ProFormaModel.generate_pro_forma(base_revenue=7.11, terminal_g=0.015, wacc=0.102)
    dcf = DCFModel.calculate_dcf(pf, cash=5.19, debt=5.58, minority_interest=4.15, shares_outstanding=48.16)
    comps = RelativeValuationModel.calculate_comps()
    ddm = DividendDiscountModel.calculate_ddm()
    ensemble = ValuationEnsemble.calculate_composite_target(
        dcf_price=dcf["dcf_price"], comps_price=comps["comps_target_price"], rim_price=480.0, ddm_price=ddm["ddm_price"]
    )
    rec = ValuationRecommender.evaluate_recommendation(
        current_price=270.0, central_target=ensemble["composite_target"], bear_target=250.0, bull_target=650.0
    )
    wacc_data = CapitalStructureModel.calculate_wacc()

    xlsx_bytes = ExcelModelExporter.export_workbook(
        company_data=company,
        pro_forma_result=pf,
        dcf_result=dcf,
        comps_result=comps,
        ensemble_result=ensemble,
        recommender_result=rec,
        wacc_data=wacc_data,
        ddm_result=ddm
    )

    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=False)
    ws_dash = wb["Executive Dashboard"]

    # Verify DDM row in Triangulation table (Row 18)
    assert "Dividend Discount Model (DDM)" in str(ws_dash["A18"].value)
    assert ws_dash["B18"].value == ddm["ddm_price"]
    # Verify SUMPRODUCT formula on Row 19 spans rows 15:18
    assert "=SUMPRODUCT(B15:B18, C15:C18)" in str(ws_dash["B19"].value)
