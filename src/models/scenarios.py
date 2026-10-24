"""
Multi-Stage Scenario Forecasting Engine (Bear / Base / Bull).
Projects 10-year pro forma statements across 3 macroeconomic scenarios.
"""

from typing import Dict, Any, List
from src.models.pro_forma import ProFormaModel
from src.models.dcf import DCFModel


class ScenarioForecaster:
    """Computes Bear, Base, and Bull valuations and combines scenario probabilities."""

    @staticmethod
    def run_scenarios(
        base_revenue: float = 316.4,
        base_growth: Optional[List[float]] = None,
        base_margins: Optional[List[float]] = None,
        base_wacc: float = 0.0952,
        base_terminal_g: float = 0.015,
        cash: float = 64.9,
        debt: float = 58.2,
        minority_interest: float = 10.5,
        shares_outstanding: float = 40.48,
        bear_weight: float = 0.20,
        base_weight: float = 0.60,
        bull_weight: float = 0.20,
        tax_rate: float = 0.22,
        has_tax_holiday: bool = False,
        capex_pct: float = 0.080,
        nwc_pct: float = 0.050,
        exit_multiple: float = 6.0
    ) -> Dict[str, Any]:
        """
        Calculates Bear, Base, and Bull multi-stage projections.
        """
        bg = base_growth if base_growth is not None else ProFormaModel.DEFAULT_GROWTH_RATES
        bm = base_margins if base_margins is not None else ProFormaModel.DEFAULT_MARGINS

        # 1. Base Case
        pf_base = ProFormaModel.generate_pro_forma(
            base_revenue=base_revenue,
            growth_rates=bg,
            margins=bm,
            wacc=base_wacc,
            terminal_g=base_terminal_g,
            tax_rate=tax_rate,
            has_tax_holiday=has_tax_holiday,
            capex_pct=capex_pct,
            nwc_pct=nwc_pct
        )
        dcf_base = DCFModel.calculate_dcf(
            pro_forma_result=pf_base,
            cash=cash,
            debt=debt,
            minority_interest=minority_interest,
            shares_outstanding=shares_outstanding,
            exit_multiple=exit_multiple
        )

        # 2. Bear Case: -2.5% growth, -20% proportional margin (floored at 1.0%), +1.0% WACC, terminal g = 1.0%
        bear_growth = [max(0.5, round(g - 2.5, 2)) for g in bg]
        bear_margins = [max(1.0, round(m * 0.80, 2)) for m in bm]
        bear_wacc = base_wacc + 0.010
        bear_terminal_g = max(0.005, round(base_terminal_g - 0.005, 4))

        pf_bear = ProFormaModel.generate_pro_forma(
            base_revenue=base_revenue,
            growth_rates=bear_growth,
            margins=bear_margins,
            wacc=bear_wacc,
            terminal_g=bear_terminal_g,
            tax_rate=tax_rate,
            has_tax_holiday=has_tax_holiday,
            capex_pct=capex_pct,
            nwc_pct=nwc_pct
        )
        dcf_bear = DCFModel.calculate_dcf(
            pro_forma_result=pf_bear,
            cash=cash,
            debt=debt,
            minority_interest=minority_interest,
            shares_outstanding=shares_outstanding,
            exit_multiple=exit_multiple
        )

        # 3. Bull Case: +2.5% growth, +18% proportional margin (capped at 85%), -0.5% WACC, terminal g = 2.5%
        bull_growth = [min(15.0, round(g + 2.5, 2)) for g in bg]
        bull_margins = [min(85.0, round(m * 1.18, 2)) for m in bm]
        bull_wacc = max(0.065, base_wacc - 0.005)
        bull_terminal_g = min(0.040, round(base_terminal_g + 0.010, 4))

        pf_bull = ProFormaModel.generate_pro_forma(
            base_revenue=base_revenue,
            growth_rates=bull_growth,
            margins=bull_margins,
            wacc=bull_wacc,
            terminal_g=bull_terminal_g,
            tax_rate=tax_rate,
            has_tax_holiday=has_tax_holiday,
            capex_pct=capex_pct,
            nwc_pct=nwc_pct
        )
        dcf_bull = DCFModel.calculate_dcf(
            pro_forma_result=pf_bull,
            cash=cash,
            debt=debt,
            minority_interest=minority_interest,
            shares_outstanding=shares_outstanding,
            exit_multiple=exit_multiple
        )

        # Normalize scenario weights
        tot_w = bear_weight + base_weight + bull_weight
        if tot_w <= 0: tot_w = 1.0
        w_bear = bear_weight / tot_w
        w_base = base_weight / tot_w
        w_bull = bull_weight / tot_w

        p_base = dcf_base["dcf_price"]
        p_bear = min(dcf_bear["dcf_price"], round(p_base * 0.95))
        p_bull = max(dcf_bull["dcf_price"], round(p_base * 1.05))

        blended_scenario_price = round(
            (w_bear * p_bear) + (w_base * p_base) + (w_bull * p_bull), 0
        )

        return {
            "bear": {
                "price": p_bear,
                "weight": w_bear,
                "wacc": bear_wacc,
                "terminal_g": bear_terminal_g,
                "schedule": pf_bear["schedule"]
            },
            "base": {
                "price": p_base,
                "weight": w_base,
                "wacc": base_wacc,
                "terminal_g": base_terminal_g,
                "schedule": pf_base["schedule"]
            },
            "bull": {
                "price": p_bull,
                "weight": w_bull,
                "wacc": bull_wacc,
                "terminal_g": bull_terminal_g,
                "schedule": pf_bull["schedule"]
            },
            "blended_scenario_price": blended_scenario_price
        }
