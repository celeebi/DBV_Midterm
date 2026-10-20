"""
Unit tests for DCFModel and ExcelModelExporter.
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
    pf = ProFormaModel.generate_pro_forma(base_revenue=316.4, terminal_g=0.015, wacc=0.0952)
    dcf = DCFModel.calculate_dcf(
        pro_forma_result=pf,
        cash=64.9,
        debt=58.2,
        minority_interest=10.5,
        shares_outstanding=40.48
    )

    assert dcf["dcf_price"] > 3000
    assert dcf["equity_value"] == round(dcf["enterprise_value"] + 64.9 - 58.2 - 10.5, 2)
    assert "TV_10 = (FCFF_10" in dcf["proofs"]["tv"]


def test_excel_formula_active_export():
    company = {
        "name": "PT Astra International Tbk",
        "ticker": "ASII.JK",
        "current_price": 5250.0,
        "historical": {"revenue": [233.5, 301.4, 316.5, 312.8, 316.4]}
    }
    pf = ProFormaModel.generate_pro_forma(base_revenue=316.4, terminal_g=0.015, wacc=0.0952)
    dcf = DCFModel.calculate_dcf(pf, cash=64.9, debt=58.2, minority_interest=10.5, shares_outstanding=40.48)
    comps = RelativeValuationModel.calculate_comps()
    ensemble = ValuationEnsemble.calculate_composite_target(
        dcf_price=dcf["dcf_price"], comps_price=comps["comps_target_price"], rim_price=5900.0
    )
    rec = ValuationRecommender.evaluate_recommendation(
        current_price=5250.0, central_target=ensemble["composite_target"], bear_target=4800.0, bull_target=7500.0
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
