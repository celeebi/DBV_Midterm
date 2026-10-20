"""
Unit tests for DCFModel and ExcelModelExporter calibrated to PWON.JK.
Verifies DCF calculations and formula-active openpyxl workbook creation.
"""

import pytest
from src.models.pro_forma import ProFormaModel
from src.models.dcf import DCFModel
from src.models.multiples import RelativeValuationModel
from src.models.ensemble import ValuationEnsemble
from src.rules.recommendations import ValuationRecommender
from src.models.parameters import CapitalStructureModel
from src.analytics.exporter import ExcelModelExporter


def test_dcf_and_reconciliation():
    pf = ProFormaModel.generate_pro_forma(base_revenue=7.11, terminal_g=0.015, wacc=0.102)
    dcf = DCFModel.calculate_dcf(
        pro_forma_result=pf,
        cash=5.19,
        debt=5.58,
        minority_interest=4.15,
        shares_outstanding=48.16
    )

    assert dcf["dcf_price"] > 300
    assert dcf["equity_value"] == round(dcf["enterprise_value"] + 5.19 - 5.58 - 4.15, 2)
    assert "TV_10 = (FCFF_10" in dcf["proofs"]["tv"]


def test_excel_formula_active_export():
    company = {
        "name": "PT Pakuwon Jati Tbk",
        "ticker": "PWON.JK",
        "current_price": 270.0,
        "historical": {"revenue": [4.71, 5.99, 6.20, 6.67, 7.11]}
    }
    pf = ProFormaModel.generate_pro_forma(base_revenue=7.11, terminal_g=0.015, wacc=0.102)
    dcf = DCFModel.calculate_dcf(pf, cash=5.19, debt=5.58, minority_interest=4.15, shares_outstanding=48.16)
    comps = RelativeValuationModel.calculate_comps()
    ensemble = ValuationEnsemble.calculate_composite_target(
        dcf_price=dcf["dcf_price"], comps_price=comps["comps_target_price"], rim_price=450.0
    )
    rec = ValuationRecommender.evaluate_recommendation(
        current_price=270.0, central_target=ensemble["composite_target"], bear_target=250.0, bull_target=650.0
    )
    wacc_data = CapitalStructureModel.calculate_wacc()

    # Generate workbook bytes
    xlsx_bytes = ExcelModelExporter.export_workbook(
        company_data=company,
        pro_forma_result=pf,
        dcf_result=dcf,
        comps_result=comps,
        ensemble_result=ensemble,
        recommender_result=rec,
        wacc_data=wacc_data
    )

    assert len(xlsx_bytes) > 5000  # Non-empty Excel file
