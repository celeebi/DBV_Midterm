"""
Integrated 3-Statement Financial Modeling Engine (IS, BS, CFS).
Generates fully articulated, dynamically balanced financial statements across the 10-year horizon:
- Income Statement (Revenue -> EBIT -> EBT -> Net Income)
- Balance Sheet (Assets = Liabilities + Equity balance check = 0)
- Cash Flow Statement (CFO + CFI + CFF -> Ending Cash)
- Working Capital, PP&E, and Debt schedules
"""

from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np


class ThreeStatementModel:
    """Builds an integrated 10-year 3-statement financial model."""

    # Default calibrated baseline for ASII.JK (Audited 2025 Actuals in IDR Trillion)
    BASE_2025_ACTUALS: Dict[str, float] = {
        # Income Statement
        "revenue": 316.4,
        "cogs": 245.2,
        "gross_profit": 71.2,
        "sga": 26.9,
        "ebit": 44.3,
        "interest_expense": 4.1,
        "interest_income": 2.3,
        "ebt": 42.5,
        "tax": 9.35,
        "net_income": 33.15,
        # Balance Sheet - Assets
        "cash": 64.9,
        "ar": 48.2,
        "inventory": 32.4,
        "other_current_assets": 15.2,
        "net_ppe": 105.8,
        "other_non_current_assets": 180.5,
        "total_assets": 447.0,
        # Balance Sheet - Liabilities
        "ap": 38.6,
        "short_term_debt": 24.1,
        "other_current_liabilities": 22.3,
        "long_term_debt": 34.1,
        "total_debt": 58.2,
        "other_non_current_liabilities": 19.3,
        "total_liabilities": 138.4,
        # Balance Sheet - Equity
        "share_capital": 52.0,
        "retained_earnings": 189.6,
        "minority_interest": 67.0,
        "total_equity": 308.6,
        # Operating Drivers
        "dso_days": 55.6,
        "dio_days": 48.2,
        "dpo_days": 57.4,
        "depr_rate_ppe": 0.134,
        "effective_tax_rate": 0.22,
        "dividend_payout_ratio": 0.45
    }

    @staticmethod
    def generate_three_statements(
        base_actuals: Optional[Dict[str, float]] = None,
        growth_rates: Optional[List[float]] = None,
        margins: Optional[List[float]] = None,
        tax_rate: float = 0.22,
        dividend_payout: float = 0.45,
        interest_rate_debt: float = 0.058,
        interest_rate_cash: float = 0.035,
        dso_days: float = 55.0,
        dio_days: float = 48.0,
        dpo_days: float = 57.0,
        capex_pct: float = 0.055,
        depr_pct_ppe: float = 0.125,
        start_year: int = 2026
    ) -> Dict[str, Any]:
        """
        Projects 10 years of integrated statements and validates that
        Balance Sheet Check: Assets - (Liabilities + Equity) == 0 in every year.
        """
        act = base_actuals if base_actuals is not None else ThreeStatementModel.BASE_2025_ACTUALS.copy()
        g_list = growth_rates if growth_rates is not None else [6.0, 3.0, 2.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5]
        m_list = margins if margins is not None else [14.0, 13.5, 13.5, 14.0, 14.0, 13.9, 13.8, 13.8, 13.8, 13.8]

        # Prior period balances (2025 actuals)
        prev_rev = act["revenue"]
        prev_cash = act["cash"]
        prev_ar = act["ar"]
        prev_inv = act["inventory"]
        prev_other_ca = act["other_current_assets"]
        prev_ppe = act["net_ppe"]
        prev_other_nca = act["other_non_current_assets"]

        prev_ap = act["ap"]
        prev_st_debt = act["short_term_debt"]
        prev_lt_debt = act["long_term_debt"]
        prev_other_cl = act["other_current_liabilities"]
        prev_other_ncl = act["other_non_current_liabilities"]

        prev_share_cap = act["share_capital"]
        prev_re = act["retained_earnings"]
        prev_mi = act["minority_interest"]

        is_rows = []
        bs_rows = []
        cfs_rows = []
        dcf_schedule_rows = []

        for t in range(1, 11):
            year = start_year + t - 1
            g = float(g_list[t - 1]) / 100.0
            ebit_m = float(m_list[t - 1]) / 100.0

            # -------------------------------------------------------------
            # 1. INCOME STATEMENT
            # -------------------------------------------------------------
            rev = prev_rev * (1.0 + g)
            ebit = rev * ebit_m
            
            # Gross profit assumes ~22.5% gross margin; SG&A is difference
            cogs = rev * (1.0 - 0.225)
            gross_profit = rev - cogs
            sga = gross_profit - ebit

            # Debt & Cash interest estimations based on beginning balances
            tot_debt_beg = prev_st_debt + prev_lt_debt
            interest_expense = tot_debt_beg * interest_rate_debt
            interest_income = prev_cash * interest_rate_cash
            net_finance_cost = interest_expense - interest_income

            ebt = ebit - net_finance_cost
            tax = max(0.0, ebt * tax_rate)
            net_income = ebt - tax

            # Dividend distribution
            dividends = net_income * dividend_payout
            retained_addition = net_income - dividends

            is_rows.append({
                "year": year,
                "period": f"{year}E (Y{t})",
                "revenue": round(rev, 2),
                "growth_pct": round(g * 100.0, 2),
                "cogs": round(cogs, 2),
                "gross_profit": round(gross_profit, 2),
                "sga": round(sga, 2),
                "ebit": round(ebit, 2),
                "ebit_margin_pct": round(ebit_m * 100.0, 2),
                "interest_expense": round(interest_expense, 2),
                "interest_income": round(interest_income, 2),
                "ebt": round(ebt, 2),
                "tax": round(tax, 2),
                "net_income": round(net_income, 2),
                "dividends": round(dividends, 2),
                "retained_addition": round(retained_addition, 2)
            })

            # -------------------------------------------------------------
            # 2. WORKING CAPITAL & CAPITAL EXPENDITURE SCHEDULES
            # -------------------------------------------------------------
            ar = (rev * dso_days) / 365.0
            inv = (cogs * dio_days) / 365.0
            ap = (cogs * dpo_days) / 365.0
            other_ca = prev_other_ca * (1.0 + g * 0.5)
            other_cl = prev_other_cl * (1.0 + g * 0.5)
            other_nca = prev_other_nca
            other_ncl = prev_other_ncl

            delta_ar = ar - prev_ar
            delta_inv = inv - prev_inv
            delta_ap = ap - prev_ap
            delta_other_ca = other_ca - prev_other_ca
            delta_other_cl = other_cl - prev_other_cl

            # PP&E Roll-forward
            depr = prev_ppe * depr_pct_ppe
            capex = rev * capex_pct
            net_ppe = prev_ppe + capex - depr

            # Debt Roll-forward (maintains moderate debt replacement)
            st_debt = prev_st_debt * (1.0 + g * 0.2)
            lt_debt = prev_lt_debt * (1.0 + g * 0.2)
            tot_debt = st_debt + lt_debt
            delta_debt = tot_debt - tot_debt_beg

            # -------------------------------------------------------------
            # 3. CASH FLOW STATEMENT
            # -------------------------------------------------------------
            # Cash Flow from Operating Activities (CFO)
            cfo = net_income + depr - delta_ar - delta_inv + delta_ap - delta_other_ca + delta_other_cl
            # Cash Flow from Investing Activities (CFI)
            cfi = -capex
            # Cash Flow from Financing Activities (CFF)
            cff = delta_debt - dividends
            # Net change in cash
            net_change_cash = cfo + cfi + cff
            ending_cash = prev_cash + net_change_cash

            cfs_rows.append({
                "year": year,
                "period": f"{year}E (Y{t})",
                "net_income": round(net_income, 2),
                "depr": round(depr, 2),
                "delta_ar": round(-delta_ar, 2),
                "delta_inv": round(-delta_inv, 2),
                "delta_ap": round(delta_ap, 2),
                "delta_other_wc": round(-delta_other_ca + delta_other_cl, 2),
                "cfo": round(cfo, 2),
                "capex": round(-capex, 2),
                "cfi": round(cfi, 2),
                "delta_debt": round(delta_debt, 2),
                "dividends_paid": round(-dividends, 2),
                "cff": round(cff, 2),
                "net_change_cash": round(net_change_cash, 2),
                "beginning_cash": round(prev_cash, 2),
                "ending_cash": round(ending_cash, 2)
            })

            # -------------------------------------------------------------
            # 4. BALANCE SHEET & EXACT ZERO-BALANCE CHECK
            # -------------------------------------------------------------
            total_current_assets = ending_cash + ar + inv + other_ca
            total_assets = total_current_assets + net_ppe + other_nca

            total_current_liabilities = ap + st_debt + other_cl
            total_liabilities = total_current_liabilities + lt_debt + other_ncl

            retained_earnings = prev_re + retained_addition
            share_capital = prev_share_cap
            minority_interest = prev_mi
            total_equity = share_capital + retained_earnings + minority_interest

            total_liabilities_equity = total_liabilities + total_equity
            balance_check = total_assets - total_liabilities_equity

            bs_rows.append({
                "year": year,
                "period": f"{year}E (Y{t})",
                # Assets
                "cash": round(ending_cash, 2),
                "ar": round(ar, 2),
                "inventory": round(inv, 2),
                "other_current_assets": round(other_ca, 2),
                "total_current_assets": round(total_current_assets, 2),
                "net_ppe": round(net_ppe, 2),
                "other_non_current_assets": round(other_nca, 2),
                "total_assets": round(total_assets, 2),
                # Liabilities
                "ap": round(ap, 2),
                "short_term_debt": round(st_debt, 2),
                "other_current_liabilities": round(other_cl, 2),
                "total_current_liabilities": round(total_current_liabilities, 2),
                "long_term_debt": round(lt_debt, 2),
                "other_non_current_liabilities": round(other_ncl, 2),
                "total_liabilities": round(total_liabilities, 2),
                # Equity
                "share_capital": round(share_capital, 2),
                "retained_earnings": round(retained_earnings, 2),
                "minority_interest": round(minority_interest, 2),
                "total_equity": round(total_equity, 2),
                "total_liabilities_equity": round(total_liabilities_equity, 2),
                "balance_check": round(balance_check, 4)
            })

            # -------------------------------------------------------------
            # 5. FCFF RECONCILIATION SCHEDULE
            # FCFF = NOPAT + Depr - CapEx - Delta NWC
            # -------------------------------------------------------------
            nopat = ebit * (1.0 - tax_rate)
            delta_nwc = (delta_ar + delta_inv) - delta_ap
            fcff = nopat + depr - capex - delta_nwc

            dcf_schedule_rows.append({
                "year": year,
                "period": f"{year}E (Y{t})",
                "ebit": round(ebit, 2),
                "nopat": round(nopat, 2),
                "depr": round(depr, 2),
                "capex": round(capex, 2),
                "delta_nwc": round(delta_nwc, 2),
                "fcff": round(fcff, 2)
            })

            # Advance state for next period
            prev_rev = rev
            prev_cash = ending_cash
            prev_ar = ar
            prev_inv = inv
            prev_other_ca = other_ca
            prev_ppe = net_ppe
            prev_other_nca = other_nca
            prev_ap = ap
            prev_st_debt = st_debt
            prev_lt_debt = lt_debt
            prev_other_cl = other_cl
            prev_other_ncl = other_ncl
            prev_re = retained_earnings

        return {
            "income_statement": pd.DataFrame(is_rows),
            "balance_sheet": pd.DataFrame(bs_rows),
            "cash_flow_statement": pd.DataFrame(cfs_rows),
            "dcf_schedule": pd.DataFrame(dcf_schedule_rows),
            "historical_actuals": act
        }
