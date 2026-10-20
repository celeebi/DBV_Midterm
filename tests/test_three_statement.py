"""
Comprehensive unit tests for the 10-year integrated 3-statement financial modeling engine
and formula-active 6-sheet Excel export.
"""

import io
import pytest
import openpyxl
from src.models.three_statement import ThreeStatementModel
from src.analytics.exporter import ExcelModelExporter
from src.models.pro_forma import ProFormaModel
from src.models.dcf import DCFModel
from src.models.multiples import RelativeValuationModel
from src.models.ensemble import ValuationEnsemble
from src.rules.recommendations import ValuationRecommender
from src.models.parameters import CapitalStructureModel


def test_three_statement_engine_articulation_and_balance():
    """Validates that Assets = Liabilities + Equity (balance_check == 0.0) across all 10 years."""
    res = ThreeStatementModel.generate_three_statements(
        growth_rates=[6.0, 3.0, 2.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5],
        margins=[14.0, 13.5, 13.5, 14.0, 14.0, 13.9, 13.8, 13.8, 13.8, 13.8],
        tax_rate=0.22,
        dividend_payout=0.45
    )

    bs = res["balance_sheet"]
    cfs = res["cash_flow_statement"]
    is_df = res["income_statement"]
    dcf_df = res["dcf_schedule"]

    assert len(bs) == 10
    assert len(cfs) == 10
    assert len(is_df) == 10
    assert len(dcf_df) == 10

    # 1. Balance sheet must balance to 0.00 in every single period
    for idx, row in bs.iterrows():
        assert abs(row["balance_check"]) < 1e-3, f"Balance sheet does not balance in year {row['year']}: diff={row['balance_check']}"

    # 2. Articulation check: Ending Cash on CFS equals Cash on BS
    for idx in range(10):
        cfs_cash = cfs.iloc[idx]["ending_cash"]
        bs_cash = bs.iloc[idx]["cash"]
        assert abs(cfs_cash - bs_cash) < 1e-2, f"Cash mismatch at period {idx}: CFS={cfs_cash}, BS={bs_cash}"

    # 3. Articulation check: Net Income on IS equals Net Income on CFS
    for idx in range(10):
        is_ni = is_df.iloc[idx]["net_income"]
        cfs_ni = cfs.iloc[idx]["net_income"]
        assert abs(is_ni - cfs_ni) < 1e-2, f"Net income mismatch at period {idx}: IS={is_ni}, CFS={cfs_ni}"

    # 4. Retained earnings roll-forward: RE_t = RE_t-1 + Addition to RE
    act_re = res["historical_actuals"]["retained_earnings"]
    prev_re = act_re
    for idx in range(10):
        curr_re = bs.iloc[idx]["retained_earnings"]
        add_re = is_df.iloc[idx]["retained_addition"]
        expected_re = prev_re + add_re
        assert abs(curr_re - expected_re) <= 0.05, f"Retained earnings mismatch at period {idx}: BS={curr_re}, Expected={expected_re}"
        prev_re = curr_re


def test_excel_export_six_sheets_and_formulas():
    """Validates that the exported workbook has all 6 sheets and contains live Excel formulas."""
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

    xlsx_bytes = ExcelModelExporter.export_workbook(
        company_data=company,
        pro_forma_result=pf,
        dcf_result=dcf,
        comps_result=comps,
        ensemble_result=ensemble,
        recommender_result=rec,
        wacc_data=wacc_data
    )

    # Load workbook from memory bytes
    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=False)

    expected_sheets = [
        "Executive Dashboard",
        "Income Statement",
        "Balance Sheet",
        "Cash Flow Statement",
        "Schedules & DCF",
        "Assumptions & Notes"
    ]
    for s in expected_sheets:
        assert s in wb.sheetnames, f"Missing sheet: {s}"

    # Verify Sheet 2: Income Statement has live revenue & gross profit formulas
    ws_is = wb["Income Statement"]
    assert str(ws_is["C6"].value).startswith("="), f"Expected formula in C6 (Revenue), got {ws_is['C6'].value}"
    assert str(ws_is["C8"].value).startswith("="), f"Expected formula in C8 (Gross Profit), got {ws_is['C8'].value}"
    assert str(ws_is["C15"].value).startswith("="), f"Expected formula in C15 (Net Income), got {ws_is['C15'].value}"

    # Verify Sheet 3: Balance Sheet has live Cash formula linking to CFS (row 5), and green balance check row (row 28)
    ws_bs = wb["Balance Sheet"]
    assert "='Cash Flow Statement'!" in str(ws_bs["C5"].value), f"Expected CFS cash link in BS C5, got {ws_bs['C5'].value}"
    assert str(ws_bs["C28"].value).startswith("="), f"Expected balance check formula in C28, got {ws_bs['C28'].value}"
    assert "C12" in str(ws_bs["C28"].value) and "C26" in str(ws_bs["C28"].value), f"Balance check formula unexpected: {ws_bs['C28'].value}"

    # Verify Sheet 4: Cash Flow Statement has link to Net Income (row 5) and Depreciation (row 6)
    ws_cfs = wb["Cash Flow Statement"]
    assert "='Income Statement'!" in str(ws_cfs["C5"].value), f"Expected IS link in CFS Net Income C5, got {ws_cfs['C5'].value}"
    assert "='Schedules & DCF'!" in str(ws_cfs["C6"].value), f"Expected Schedules link in CFS Depr C6, got {ws_cfs['C6'].value}"

    # Verify Sheet 5: Schedules & DCF has live formulas for FCFF and TV
    ws_dcf = wb["Schedules & DCF"]
    assert str(ws_dcf["C24"].value).startswith("="), f"Expected formula in FCFF row C24, got {ws_dcf['C24'].value}"
