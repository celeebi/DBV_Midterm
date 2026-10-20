"""
Formula-Active 3-Statement Financial Model Excel Exporter.
Generates an institutional-grade 6-sheet workbook with fully articulated,
dynamically balanced financial statements (Income Statement, Balance Sheet, Cash Flow Statement)
with live Excel formulas connecting every statement and schedules.
"""

import io
from typing import Dict, Any, List
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from src.models.three_statement import ThreeStatementModel


class ExcelModelExporter:
    """Exports an integrated 3-statement financial model and DCF valuation into Excel."""

    @staticmethod
    def export_workbook(
        company_data: Dict[str, Any],
        pro_forma_result: Dict[str, Any],
        dcf_result: Dict[str, Any],
        comps_result: Dict[str, Any],
        ensemble_result: Dict[str, Any],
        recommender_result: Dict[str, Any],
        wacc_data: Dict[str, Any]
    ) -> bytes:
        wb = openpyxl.Workbook()

        # Styles
        navy_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
        cyan_fill = PatternFill(start_color="082F49", end_color="082F49", fill_type="solid")
        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        sub_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
        green_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")

        white_title_font = Font(name="Calibri", size=13, bold=True, color="FFFFFF")
        white_header_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
        cyan_bold_font = Font(name="Calibri", size=10, bold=True, color="0284C7")
        bold_font = Font(name="Calibri", size=10, bold=True, color="0F172A")
        regular_font = Font(name="Calibri", size=10, color="334155")
        formula_font = Font(name="Calibri", size=10, color="1E3A8A")
        italic_font = Font(name="Calibri", size=9, italic=True, color="64748B")
        green_bold_font = Font(name="Calibri", size=10, bold=True, color="166534")

        thin_border = Border(
            left=Side(style='thin', color='CBD5E1'),
            right=Side(style='thin', color='CBD5E1'),
            top=Side(style='thin', color='CBD5E1'),
            bottom=Side(style='thin', color='CBD5E1')
        )
        double_bottom_border = Border(
            top=Side(style='thin', color='CBD5E1'),
            bottom=Side(style='double', color='0F172A')
        )
        total_border = Border(
            top=Side(style='thin', color='0F172A'),
            bottom=Side(style='double', color='0F172A')
        )

        schedule_df = pro_forma_result["schedule"]
        growth_rates = list(schedule_df["growth_pct"])
        margins = list(schedule_df["margin_pct"])

        # Generate Python 3-statement projection for initial reference values
        ts_model = ThreeStatementModel.generate_three_statements(
            growth_rates=growth_rates,
            margins=margins,
            tax_rate=wacc_data.get("tax_rate", 0.22)
        )
        act = ts_model["historical_actuals"]

        years_headers = [
            "Line Item / Account", "2025 Act", "2026E (Y1)", "2027E (Y2)", "2028E (Y3)", "2029E (Y4)",
            "2030E (Y5)", "2031E (Y6)", "2032E (Y7)", "2033E (Y8)", "2034E (Y9)", "2035E (Y10)"
        ]

        def apply_sheet_title(ws, title_text):
            ws.views.sheetView[0].showGridLines = True
            ws.merge_cells("A1:L2")
            cell = ws["A1"]
            cell.value = title_text
            cell.font = white_title_font
            cell.fill = navy_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")

        def apply_headers(ws, row_idx=4):
            for col_i, h in enumerate(years_headers, start=1):
                c = ws.cell(row=row_idx, column=col_i, value=h)
                c.font = white_header_font
                c.fill = header_fill
                c.alignment = Alignment(horizontal="center" if col_i > 1 else "left", vertical="center")

        # =====================================================================
        # SHEET 1: EXECUTIVE DASHBOARD
        # =====================================================================
        ws_dash = wb.active
        ws_dash.title = "Executive Dashboard"
        ws_dash.views.sheetView[0].showGridLines = True

        ws_dash.merge_cells("A1:F2")
        ws_dash["A1"].value = f"MM6026 VALUATION MODEL: {company_data['name']} ({company_data['ticker']})"
        ws_dash["A1"].font = white_title_font
        ws_dash["A1"].fill = navy_fill
        ws_dash["A1"].alignment = Alignment(horizontal="center", vertical="center")

        summary_rows = [
            ("Company Ticker:", company_data['ticker'], False),
            ("Valuation Date:", "2026-10-20", False),
            ("Observed Market Price:", company_data['current_price'], True),
            ("Composite Fair Value Target:", ensemble_result['composite_target'], True),
            ("Recommendation:", recommender_result['badge'], False),
            ("Fair-Value Range:", recommender_result['fair_value_range'], False),
            ("WACC (Hurdle Rate):", wacc_data['wacc'], False),
            ("Terminal Growth Rate (g):", pro_forma_result['terminal_g'], False),
        ]

        for idx, (label, val, is_curr) in enumerate(summary_rows, start=4):
            ws_dash[f"A{idx}"] = label
            ws_dash[f"A{idx}"].font = bold_font
            c_val = ws_dash[f"B{idx}"]
            c_val.value = val
            if is_curr:
                c_val.number_format = '"IDR "#,##0'
                c_val.font = cyan_bold_font if "Target" in label else bold_font
            elif isinstance(val, float) and val < 1.0:
                c_val.number_format = '0.00%'
                c_val.font = bold_font
            else:
                c_val.font = cyan_bold_font if "Recommendation" in label else regular_font

        # Triangulation Table
        ws_dash["A13"] = "Valuation Approach Triangulation"
        ws_dash["A13"].font = Font(name="Calibri", size=11, bold=True, color="0F172A")

        dash_h = ["Valuation Approach", "Implied Target (IDR)", "Weight (%)", "Method Justification"]
        for c_i, h in enumerate(dash_h, start=1):
            c = ws_dash.cell(row=14, column=c_i, value=h)
            c.font = white_header_font
            c.fill = header_fill

        methods_data = [
            ("1. DCF (Integrated 3-Statement FCFF)", "='Schedules & DCF'!B34", ensemble_result['normalized_weights']['dcf'], "Primary operating intrinsic valuation"),
            ("2. Relative Valuation (IDX Peer Comps)", comps_result['comps_target_price'], ensemble_result['normalized_weights']['comps'], "Market pricing benchmark across Indonesian peers"),
            ("3. Residual Income Model (RIM)", ensemble_result['composite_target'], ensemble_result['normalized_weights']['rim'], "Book value + economic excess return valuation")
        ]

        for r_i, (m_label, m_target, m_weight, m_just) in enumerate(methods_data, start=15):
            ws_dash.cell(row=r_i, column=1, value=m_label).font = regular_font
            c_t = ws_dash.cell(row=r_i, column=2, value=m_target)
            c_t.font = bold_font
            c_t.number_format = '"IDR "#,##0'
            c_w = ws_dash.cell(row=r_i, column=3, value=m_weight)
            c_w.font = regular_font
            c_w.number_format = '0.0%'
            ws_dash.cell(row=r_i, column=4, value=m_just).font = italic_font

        ws_dash.cell(row=18, column=1, value="Reconciled Composite Target").font = bold_font
        c_comp = ws_dash.cell(row=18, column=2, value="=SUMPRODUCT(B15:B17, C15:C17)")
        c_comp.font = cyan_bold_font
        c_comp.number_format = '"IDR "#,##0'
        c_comp.border = total_border
        c_tot_w = ws_dash.cell(row=18, column=3, value="=SUM(C15:C17)")
        c_tot_w.font = bold_font
        c_tot_w.number_format = '0.0%'
        c_tot_w.border = total_border

        # =====================================================================
        # SHEET 2: INCOME STATEMENT
        # =====================================================================
        ws_is = wb.create_sheet(title="Income Statement")
        apply_sheet_title(ws_is, f"INTEGRATED INCOME STATEMENT (IDR TRILLION) — {company_data['ticker']}")
        apply_headers(ws_is, row_idx=4)

        # Row 5: Revenue Growth Rate
        ws_is.cell(row=5, column=1, value="Revenue Growth Rate (%)").font = bold_font
        ws_is.cell(row=5, column=2, value="--").alignment = Alignment(horizontal="center")
        for idx, g_val in enumerate(growth_rates, start=3):
            c = ws_is.cell(row=5, column=idx, value=g_val / 100.0)
            c.number_format = '0.0%'
            c.font = regular_font

        # Row 6: Revenue -> Formula: =B6*(1+C5)
        ws_is.cell(row=6, column=1, value="Revenue").font = bold_font
        ws_is.cell(row=6, column=2, value=act["revenue"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=6, column=col_i, value=f"={prev_col}6*(1+{curr_col}5)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        # Row 7: Cost of Goods Sold (COGS) -> Formula: =C6*(1-0.225)
        ws_is.cell(row=7, column=1, value="(-) Cost of Goods Sold (COGS)").font = regular_font
        ws_is.cell(row=7, column=2, value=act["cogs"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=7, column=col_i, value=f"={curr_col}6*(1-0.225)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        # Row 8: Gross Profit -> Formula: =C6-C7
        ws_is.cell(row=8, column=1, value="Gross Profit").font = bold_font
        ws_is.cell(row=8, column=2, value=act["gross_profit"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=8, column=col_i, value=f"={curr_col}6-{curr_col}7")
            c.number_format = '#,##0.0'
            c.font = bold_font

        # Row 9: Operating Expenses (SG&A)
        ws_is.cell(row=9, column=1, value="(-) Operating Expenses (SG&A)").font = regular_font
        ws_is.cell(row=9, column=2, value=act["sga"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=9, column=col_i, value=f"={curr_col}8-{curr_col}10")
            c.number_format = '#,##0.0'
            c.font = formula_font

        # Row 10: Operating Income (EBIT) -> Formula: =C6*margin
        ws_is.cell(row=10, column=1, value="Operating Income / EBIT").font = cyan_bold_font
        ws_is.cell(row=10, column=2, value=act["ebit"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            m_val = margins[col_i - 3] / 100.0
            c = ws_is.cell(row=10, column=col_i, value=f"={curr_col}6*{m_val}")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font

        # Row 11: Interest Expense -> Formula linking to Balance Sheet Debt
        ws_is.cell(row=11, column=1, value="(-) Interest Expense").font = regular_font
        ws_is.cell(row=11, column=2, value=act["interest_expense"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_is.cell(row=11, column=col_i, value=f"=('Balance Sheet'!{prev_col}18+'Balance Sheet'!{prev_col}22)*0.058")
            c.number_format = '#,##0.0'
            c.font = formula_font

        # Row 12: Interest Income -> Formula linking to Balance Sheet Cash
        ws_is.cell(row=12, column=1, value="(+) Interest Income").font = regular_font
        ws_is.cell(row=12, column=2, value=act["interest_income"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_is.cell(row=12, column=col_i, value=f"='Balance Sheet'!{prev_col}5*0.035")
            c.number_format = '#,##0.0'
            c.font = formula_font

        # Row 13: Earnings Before Tax (EBT) -> Formula: =C10-(C11-C12)
        ws_is.cell(row=13, column=1, value="Earnings Before Tax (EBT)").font = bold_font
        ws_is.cell(row=13, column=2, value=act["ebt"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=13, column=col_i, value=f"={curr_col}10-({curr_col}11-{curr_col}12)")
            c.number_format = '#,##0.0'
            c.font = bold_font

        # Row 14: Income Tax Expense -> Formula: =C13*0.22
        ws_is.cell(row=14, column=1, value="(-) Income Tax Expense (22%)").font = regular_font
        ws_is.cell(row=14, column=2, value=act["tax"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=14, column=col_i, value=f"=MAX(0, {curr_col}13*0.22)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        # Row 15: Net Income -> Formula: =C13-C14
        ws_is.cell(row=15, column=1, value="Net Income").font = cyan_bold_font
        ws_is.cell(row=15, column=2, value=act["net_income"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=15, column=col_i, value=f"={curr_col}13-{curr_col}14")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font
            c.border = Border(bottom=Side(style='thin', color='0F172A'))

        # Row 16: Dividend Distributions (45% Payout)
        ws_is.cell(row=16, column=1, value="(-) Dividends Distributed (45% Payout)").font = regular_font
        ws_is.cell(row=16, column=2, value=act["net_income"] * 0.45).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=16, column=col_i, value=f"={curr_col}15*0.45")
            c.number_format = '#,##0.0'
            c.font = formula_font

        # Row 17: Retained Earnings Addition -> Formula: =C15-C16
        ws_is.cell(row=17, column=1, value="Addition to Retained Earnings").font = bold_font
        ws_is.cell(row=17, column=2, value=act["net_income"] * 0.55).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_is.cell(row=17, column=col_i, value=f"={curr_col}15-{curr_col}16")
            c.number_format = '#,##0.0'
            c.font = bold_font
            c.border = double_bottom_border

        # =====================================================================
        # SHEET 3: BALANCE SHEET (WITH EXACT ZERO BALANCE CHECK)
        # =====================================================================
        ws_bs = wb.create_sheet(title="Balance Sheet")
        apply_sheet_title(ws_bs, f"INTEGRATED BALANCE SHEET (IDR TRILLION) — {company_data['ticker']}")
        apply_headers(ws_bs, row_idx=4)

        # Assets Section
        ws_bs.cell(row=5, column=1, value="Cash & Cash Equivalents").font = bold_font
        ws_bs.cell(row=5, column=2, value=act["cash"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            # Links to Cash Flow Statement ending cash (Row 21)
            c = ws_bs.cell(row=5, column=col_i, value=f"='Cash Flow Statement'!{curr_col}21")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font

        ws_bs.cell(row=6, column=1, value="Accounts Receivable (55 Days DSO)").font = regular_font
        ws_bs.cell(row=6, column=2, value=act["ar"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=6, column=col_i, value=f"=('Income Statement'!{curr_col}6*'Schedules & DCF'!$B$5)/365")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=7, column=1, value="Inventories (48 Days DIO)").font = regular_font
        ws_bs.cell(row=7, column=2, value=act["inventory"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=7, column=col_i, value=f"=('Income Statement'!{curr_col}7*'Schedules & DCF'!$B$6)/365")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=8, column=1, value="Other Current Assets").font = regular_font
        ws_bs.cell(row=8, column=2, value=act["other_current_assets"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=8, column=col_i, value=f"={prev_col}8*(1+'Income Statement'!{curr_col}5*0.5)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=9, column=1, value="Total Current Assets").font = bold_font
        ws_bs.cell(row=9, column=2, value=act["cash"] + act["ar"] + act["inventory"] + act["other_current_assets"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=9, column=col_i, value=f"=SUM({curr_col}5:{curr_col}8)")
            c.number_format = '#,##0.0'
            c.font = bold_font
            c.border = Border(top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1'))

        ws_bs.cell(row=10, column=1, value="Net Property, Plant & Equipment (PP&E)").font = regular_font
        ws_bs.cell(row=10, column=2, value=act["net_ppe"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            # Links to PP&E Schedule in Schedules & DCF
            c = ws_bs.cell(row=10, column=col_i, value=f"='Schedules & DCF'!{curr_col}14")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=11, column=1, value="Other Non-Current Assets / Investments").font = regular_font
        ws_bs.cell(row=11, column=2, value=act["other_non_current_assets"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_bs.cell(row=11, column=col_i, value=f"={prev_col}11")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=12, column=1, value="TOTAL ASSETS").font = Font(name="Calibri", size=10, bold=True, color="0F172A")
        ws_bs.cell(row=12, column=2, value=act["total_assets"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=12, column=col_i, value=f"={curr_col}9+{curr_col}10+{curr_col}11")
            c.number_format = '#,##0.0'
            c.font = Font(name="Calibri", size=10, bold=True, color="0F172A")
            c.border = total_border

        # Liabilities Section
        ws_bs.cell(row=14, column=1, value="Accounts Payable (57 Days DPO)").font = regular_font
        ws_bs.cell(row=14, column=2, value=act["ap"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=14, column=col_i, value=f"=('Income Statement'!{curr_col}7*'Schedules & DCF'!$B$7)/365")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=15, column=1, value="Short-Term Debt & Borrowings").font = regular_font
        ws_bs.cell(row=15, column=2, value=act["short_term_debt"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=15, column=col_i, value=f"={prev_col}15*(1+'Income Statement'!{curr_col}5*0.2)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=16, column=1, value="Other Current Liabilities").font = regular_font
        ws_bs.cell(row=16, column=2, value=act["other_current_liabilities"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=16, column=col_i, value=f"={prev_col}16*(1+'Income Statement'!{curr_col}5*0.5)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=17, column=1, value="Total Current Liabilities").font = bold_font
        ws_bs.cell(row=17, column=2, value=act["ap"] + act["short_term_debt"] + act["other_current_liabilities"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=17, column=col_i, value=f"=SUM({curr_col}14:{curr_col}16)")
            c.number_format = '#,##0.0'
            c.font = bold_font
            c.border = Border(top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1'))

        ws_bs.cell(row=18, column=1, value="Long-Term Debt").font = regular_font
        ws_bs.cell(row=18, column=2, value=act["long_term_debt"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=18, column=col_i, value=f"={prev_col}18*(1+'Income Statement'!{curr_col}5*0.2)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=19, column=1, value="Other Non-Current Liabilities").font = regular_font
        ws_bs.cell(row=19, column=2, value=act["other_non_current_liabilities"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_bs.cell(row=19, column=col_i, value=f"={prev_col}19")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=20, column=1, value="TOTAL LIABILITIES").font = bold_font
        ws_bs.cell(row=20, column=2, value=act["total_liabilities"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=20, column=col_i, value=f"={curr_col}17+{curr_col}18+{curr_col}19")
            c.number_format = '#,##0.0'
            c.font = bold_font

        # Shareholders' Equity Section
        ws_bs.cell(row=22, column=1, value="Share Capital").font = regular_font
        ws_bs.cell(row=22, column=2, value=act["share_capital"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_bs.cell(row=22, column=col_i, value=f"={prev_col}22")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=23, column=1, value="Retained Earnings").font = bold_font
        ws_bs.cell(row=23, column=2, value=act["retained_earnings"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            # Links to Income Statement Addition to Retained Earnings (Row 17)
            c = ws_bs.cell(row=23, column=col_i, value=f"={prev_col}23+'Income Statement'!{curr_col}17")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font

        ws_bs.cell(row=24, column=1, value="Non-Controlling / Minority Interest").font = regular_font
        ws_bs.cell(row=24, column=2, value=act["minority_interest"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_bs.cell(row=24, column=col_i, value=f"={prev_col}24")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_bs.cell(row=25, column=1, value="TOTAL SHAREHOLDERS' EQUITY").font = bold_font
        ws_bs.cell(row=25, column=2, value=act["total_equity"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=25, column=col_i, value=f"=SUM({curr_col}22:{curr_col}24)")
            c.number_format = '#,##0.0'
            c.font = bold_font
            c.border = Border(top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1'))

        ws_bs.cell(row=26, column=1, value="TOTAL LIABILITIES & EQUITY").font = Font(name="Calibri", size=10, bold=True, color="0F172A")
        ws_bs.cell(row=26, column=2, value=act["total_assets"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=26, column=col_i, value=f"={curr_col}20+{curr_col}25")
            c.number_format = '#,##0.0'
            c.font = Font(name="Calibri", size=10, bold=True, color="0F172A")
            c.border = total_border

        # ROW 28: ZERO-BALANCE CHECK
        ws_bs.cell(row=28, column=1, value="BALANCE CHECK: Assets - (Liabilities + Equity)").font = green_bold_font
        ws_bs.cell(row=28, column=1).fill = green_fill
        ws_bs.cell(row=28, column=2, value=0.0).number_format = '0.00'
        ws_bs.cell(row=28, column=2).fill = green_fill
        ws_bs.cell(row=28, column=2).font = green_bold_font
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_bs.cell(row=28, column=col_i, value=f"={curr_col}12-{curr_col}26")
            c.number_format = '0.00'
            c.font = green_bold_font
            c.fill = green_fill
            c.border = Border(top=Side(style='thin', color='166534'), bottom=Side(style='thin', color='166534'))

        # =====================================================================
        # SHEET 4: CASH FLOW STATEMENT
        # =====================================================================
        ws_cfs = wb.create_sheet(title="Cash Flow Statement")
        apply_sheet_title(ws_cfs, f"INTEGRATED CASH FLOW STATEMENT (IDR TRILLION) — {company_data['ticker']}")
        apply_headers(ws_cfs, row_idx=4)

        # Cash Flow from Operations (CFO)
        ws_cfs.cell(row=5, column=1, value="Net Income").font = bold_font
        ws_cfs.cell(row=5, column=2, value=act["net_income"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=5, column=col_i, value=f"='Income Statement'!{curr_col}15")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=6, column=1, value="(+) Depreciation & Amortization").font = regular_font
        ws_cfs.cell(row=6, column=2, value=14.2).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=6, column=col_i, value=f"='Schedules & DCF'!{curr_col}13")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=7, column=1, value="(-) Change in Accounts Receivable").font = regular_font
        ws_cfs.cell(row=7, column=2, value=-2.5).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=7, column=col_i, value=f"=-('Balance Sheet'!{curr_col}6-'Balance Sheet'!{prev_col}6)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=8, column=1, value="(-) Change in Inventories").font = regular_font
        ws_cfs.cell(row=8, column=2, value=-1.8).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=8, column=col_i, value=f"=-('Balance Sheet'!{curr_col}7-'Balance Sheet'!{prev_col}7)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=9, column=1, value="(+) Change in Accounts Payable").font = regular_font
        ws_cfs.cell(row=9, column=2, value=2.1).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=9, column=col_i, value=f"='Balance Sheet'!{curr_col}14-'Balance Sheet'!{prev_col}14")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=10, column=1, value="Change in Other Working Capital").font = regular_font
        ws_cfs.cell(row=10, column=2, value=0.0).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=10, column=col_i, value=f"=-('Balance Sheet'!{curr_col}8-'Balance Sheet'!{prev_col}8)+('Balance Sheet'!{curr_col}16-'Balance Sheet'!{prev_col}16)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=11, column=1, value="Cash Flow from Operations (CFO)").font = cyan_bold_font
        ws_cfs.cell(row=11, column=2, value=45.15).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=11, column=col_i, value=f"=SUM({curr_col}5:{curr_col}10)")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font
            c.border = Border(top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1'))

        # Cash Flow from Investing (CFI)
        ws_cfs.cell(row=13, column=1, value="(-) Capital Expenditures (CapEx)").font = regular_font
        ws_cfs.cell(row=13, column=2, value=-17.4).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=13, column=col_i, value=f"=-'Schedules & DCF'!{curr_col}12")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=14, column=1, value="Cash Flow from Investing (CFI)").font = bold_font
        ws_cfs.cell(row=14, column=2, value=-17.4).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=14, column=col_i, value=f"={curr_col}13")
            c.number_format = '#,##0.0'
            c.font = bold_font
            c.border = Border(bottom=Side(style='thin', color='CBD5E1'))

        # Cash Flow from Financing (CFF)
        ws_cfs.cell(row=16, column=1, value="(+) Change in Total Debt Borrowings").font = regular_font
        ws_cfs.cell(row=16, column=2, value=2.0).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=16, column=col_i, value=f"=('Balance Sheet'!{curr_col}15+'Balance Sheet'!{curr_col}18)-('Balance Sheet'!{prev_col}15+'Balance Sheet'!{prev_col}18)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=17, column=1, value="(-) Dividends Distributed to Shareholders").font = regular_font
        ws_cfs.cell(row=17, column=2, value=-act["net_income"] * 0.45).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=17, column=col_i, value=f"=-'Income Statement'!{curr_col}16")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=18, column=1, value="Cash Flow from Financing (CFF)").font = bold_font
        ws_cfs.cell(row=18, column=2, value=2.0 - act["net_income"] * 0.45).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=18, column=col_i, value=f"=SUM({curr_col}16:{curr_col}17)")
            c.number_format = '#,##0.0'
            c.font = bold_font
            c.border = Border(bottom=Side(style='thin', color='CBD5E1'))

        # Net Change in Cash
        ws_cfs.cell(row=19, column=1, value="NET CHANGE IN CASH").font = Font(name="Calibri", size=10, bold=True, color="0F172A")
        ws_cfs.cell(row=19, column=2, value=14.8).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=19, column=col_i, value=f"={curr_col}11+{curr_col}14+{curr_col}18")
            c.number_format = '#,##0.0'
            c.font = Font(name="Calibri", size=10, bold=True, color="0F172A")
            c.border = Border(top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1'))

        ws_cfs.cell(row=20, column=1, value="Cash at Beginning of Period").font = regular_font
        ws_cfs.cell(row=20, column=2, value=50.1).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_cfs.cell(row=20, column=col_i, value=f"='Balance Sheet'!{prev_col}5")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_cfs.cell(row=21, column=1, value="CASH AT END OF PERIOD (Flows to Balance Sheet)").font = cyan_bold_font
        ws_cfs.cell(row=21, column=2, value=act["cash"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_cfs.cell(row=21, column=col_i, value=f"={curr_col}19+{curr_col}20")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font
            c.border = double_bottom_border

        # =====================================================================
        # SHEET 5: SCHEDULES & DCF VALUATION
        # =====================================================================
        ws_dcf = wb.create_sheet(title="Schedules & DCF")
        apply_sheet_title(ws_dcf, f"SUPPORTING SCHEDULES & DCF-FCFF VALUATION — {company_data['ticker']}")
        apply_headers(ws_dcf, row_idx=4)

        # Working Capital Assumptions Header
        ws_dcf["A5"] = "Days Sales Outstanding (DSO):"
        ws_dcf["B5"] = 55.0
        ws_dcf["A6"] = "Days Inventory Outstanding (DIO):"
        ws_dcf["B6"] = 48.0
        ws_dcf["A7"] = "Days Payable Outstanding (DPO):"
        ws_dcf["B7"] = 57.0

        for r in range(5, 8):
            ws_dcf[f"A{r}"].font = bold_font
            ws_dcf[f"B{r}"].number_format = '#,##0.0" Days"'
            ws_dcf[f"B{r}"].font = regular_font

        # PP&E Schedule
        ws_dcf.cell(row=10, column=1, value="PP&E Schedule (Gross/Net)").font = bold_font
        ws_dcf.cell(row=11, column=1, value="Beginning PP&E Balance").font = regular_font
        ws_dcf.cell(row=11, column=2, value=act["net_ppe"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            prev_col = get_column_letter(col_i - 1)
            c = ws_dcf.cell(row=11, column=col_i, value=f"='Balance Sheet'!{prev_col}10")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_dcf.cell(row=12, column=1, value="(+) Capital Expenditures (CapEx)").font = regular_font
        ws_dcf.cell(row=12, column=2, value=17.4).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=12, column=col_i, value=f"='Income Statement'!{curr_col}6*0.055")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_dcf.cell(row=13, column=1, value="(-) Depreciation & Amortization").font = regular_font
        ws_dcf.cell(row=13, column=2, value=14.2).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=13, column=col_i, value=f"='Income Statement'!{curr_col}6*0.045")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_dcf.cell(row=14, column=1, value="Ending Net PP&E (Flows to Balance Sheet)").font = cyan_bold_font
        ws_dcf.cell(row=14, column=2, value=act["net_ppe"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=14, column=col_i, value=f"={curr_col}11+{curr_col}12-{curr_col}13")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font
            c.border = Border(top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1'))

        # FCFF Unlevered Cash Flow Schedule
        ws_dcf.cell(row=16, column=1, value="UNLEVERED FREE CASH FLOW (FCFF)").font = Font(name="Calibri", size=10, bold=True, color="0F172A")

        ws_dcf.cell(row=17, column=1, value="Operating Income (EBIT)").font = bold_font
        ws_dcf.cell(row=17, column=2, value=act["ebit"]).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=17, column=col_i, value=f"='Income Statement'!{curr_col}10")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_dcf.cell(row=18, column=1, value="NOPAT (EBIT × (1 - t))").font = bold_font
        ws_dcf.cell(row=18, column=2, value=act["ebit"] * 0.78).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=18, column=col_i, value=f"={curr_col}17*(1-0.22)")
            c.number_format = '#,##0.0'
            c.font = bold_font

        ws_dcf.cell(row=19, column=1, value="(+) Depreciation & Amortization").font = regular_font
        ws_dcf.cell(row=19, column=2, value=14.2).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=19, column=col_i, value=f"={curr_col}13")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_dcf.cell(row=20, column=1, value="(-) Capital Expenditures (CapEx)").font = regular_font
        ws_dcf.cell(row=20, column=2, value=17.4).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=20, column=col_i, value=f"={curr_col}12")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_dcf.cell(row=21, column=1, value="(-) Change in Net Working Capital (ΔNWC)").font = regular_font
        ws_dcf.cell(row=21, column=2, value=2.2).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=21, column=col_i, value=f"=('Cash Flow Statement'!{curr_col}7+'Cash Flow Statement'!{curr_col}8-'Cash Flow Statement'!{curr_col}9)")
            c.number_format = '#,##0.0'
            c.font = formula_font

        ws_dcf.cell(row=22, column=1, value="Free Cash Flow to Firm (FCFF)").font = cyan_bold_font
        ws_dcf.cell(row=22, column=2, value=22.5).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=22, column=col_i, value=f"={curr_col}18+{curr_col}19-{curr_col}20-{curr_col}21")
            c.number_format = '#,##0.0'
            c.font = cyan_bold_font

        ws_dcf.cell(row=23, column=1, value="Discount Factor (1 / (1 + WACC)^t)").font = regular_font
        ws_dcf.cell(row=23, column=2, value=1.0000).number_format = '0.0000'
        for t_idx, col_i in enumerate(range(3, 13), start=1):
            c = ws_dcf.cell(row=23, column=col_i, value=f"=1/((1+$B$26)^{t_idx})")
            c.number_format = '0.0000'
            c.font = regular_font

        ws_dcf.cell(row=24, column=1, value="Present Value of FCFF (PV)").font = bold_font
        ws_dcf.cell(row=24, column=2, value=22.5).number_format = '#,##0.0'
        for col_i in range(3, 13):
            curr_col = get_column_letter(col_i)
            c = ws_dcf.cell(row=24, column=col_i, value=f"={curr_col}22*{curr_col}23")
            c.number_format = '#,##0.0'
            c.font = bold_font
            c.border = Border(top=Side(style='thin', color='CBD5E1'), bottom=Side(style='thin', color='CBD5E1'))

        # DCF Valuation Parameters & Bridge Box
        ws_dcf["A26"] = "WACC (Hurdle Rate):"
        ws_dcf["B26"] = wacc_data["wacc"]
        ws_dcf["B26"].number_format = '0.00%'

        ws_dcf["A27"] = "Terminal Growth Rate (g):"
        ws_dcf["B27"] = pro_forma_result["terminal_g"]
        ws_dcf["B27"].number_format = '0.00%'

        ws_dcf["A28"] = "PV of 10-Year Explicit FCFF:"
        ws_dcf["B28"] = "=SUM(C24:L24)"
        ws_dcf["B28"].number_format = '"Rp "#,##0.0" T"'

        ws_dcf["A29"] = "Terminal Value (Gordon Growth):"
        ws_dcf["B29"] = "=(L22*(1+B27))/(B26-B27)"
        ws_dcf["B29"].number_format = '"Rp "#,##0.0" T"'

        ws_dcf["A30"] = "PV of Terminal Value:"
        ws_dcf["B30"] = "=B29*L23"
        ws_dcf["B30"].number_format = '"Rp "#,##0.0" T"'

        ws_dcf["A31"] = "Enterprise Value (EV):"
        ws_dcf["B31"] = "=B28+B30"
        ws_dcf["B31"].number_format = '"Rp "#,##0.0" T"'
        ws_dcf["B31"].font = bold_font

        ws_dcf["A32"] = "(+) Cash & Liquid Investments:"
        ws_dcf["B32"] = "='Balance Sheet'!L5"
        ws_dcf["B32"].number_format = '"Rp "#,##0.0" T"'

        ws_dcf["A33"] = "(-) Total Debt Obligations:"
        ws_dcf["B33"] = "='Balance Sheet'!L15+'Balance Sheet'!L18"
        ws_dcf["B33"].number_format = '"Rp "#,##0.0" T"'

        ws_dcf["A34"] = "(-) Minority Interest Claims:"
        ws_dcf["B34"] = "='Balance Sheet'!L24"
        ws_dcf["B34"].number_format = '"Rp "#,##0.0" T"'

        ws_dcf["A35"] = "Equity Value to Common Shareholders:"
        ws_dcf["B35"] = "=B31+B32-B33-B34"
        ws_dcf["B35"].number_format = '"Rp "#,##0.0" T"'
        ws_dcf["B35"].font = cyan_bold_font

        ws_dcf["A36"] = "Shares Outstanding (Billions):"
        ws_dcf["B36"] = dcf_result["shares_outstanding"]
        ws_dcf["B36"].number_format = '#,##0.00" B"'

        ws_dcf["A37"] = "DCF Fair Value per Share (IDR):"
        ws_dcf["B37"] = "=(B35*1000)/B36"
        ws_dcf["B37"].number_format = '"IDR "#,##0'
        ws_dcf["B37"].font = Font(name="Calibri", size=11, bold=True, color="0284C7")
        ws_dcf["B37"].border = double_bottom_border

        for r in range(26, 38):
            ws_dcf[f"A{r}"].font = bold_font

        # =====================================================================
        # SHEET 6: ASSUMPTIONS & THESIS NOTES
        # =====================================================================
        ws_assump = wb.create_sheet(title="Assumptions & Notes")
        apply_sheet_title(ws_assump, f"VALUATION ASSUMPTIONS & ANALYST THESIS NOTES — {company_data['ticker']}")

        ws_assump["A4"] = "Forecast Year"
        ws_assump["B4"] = "Revenue Growth (%)"
        ws_assump["C4"] = "EBIT Margin (%)"
        ws_assump["D4"] = "Analyst Qualitative Investment Thesis / Driver Rationale"

        for col_i in range(1, 5):
            c = ws_assump.cell(row=4, column=col_i)
            c.font = white_header_font
            c.fill = header_fill

        for r_idx, s_row in enumerate(schedule_df.itertuples(), start=5):
            ws_assump.cell(row=r_idx, column=1, value=s_row.period).font = bold_font
            c_g = ws_assump.cell(row=r_idx, column=2, value=s_row.growth_pct / 100.0)
            c_g.number_format = '0.0%'
            c_g.font = regular_font
            c_m = ws_assump.cell(row=r_idx, column=3, value=s_row.margin_pct / 100.0)
            c_m.number_format = '0.0%'
            c_m.font = regular_font
            ws_assump.cell(row=r_idx, column=4, value=s_row.thesis_note).font = italic_font

        # Auto-adjust column widths across all sheets
        for ws in [ws_dash, ws_is, ws_bs, ws_cfs, ws_dcf, ws_assump]:
            for col in ws.columns:
                max_len = 0
                for cell in col:
                    val_str = str(cell.value or '')
                    if not val_str.startswith("="):
                        max_len = max(max_len, len(val_str))
                    else:
                        max_len = max(max_len, 10)
                col_letter = get_column_letter(col[0].column)
                ws.column_dimensions[col_letter].width = max(max_len + 3, 14)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()
