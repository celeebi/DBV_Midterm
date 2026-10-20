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
        bull_weight: float = 0.20
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
            terminal_g=base_terminal_g
        )
        dcf_base = DCFModel.calculate_dcf(
            pro_forma_result=pf_base,
            cash=cash,
            debt=debt,
            minority_interest=minority_interest,
            shares_outstanding=shares_outstanding
        )

        # 2. Bear Case: -2.5% growth, -2.0% margin, +1.0% WACC, terminal g = 1.0%
        bear_growth = [max(0.5, g - 2.5) for g in bg]
        bear_margins = [max(8.0, m - 2.0) for m in bm]
        bear_wacc = base_wacc + 0.010
        bear_terminal_g = max(0.005, base_terminal_g - 0.005)

        pf_bear = ProFormaModel.generate_pro_forma(
            base_revenue=base_revenue,
            growth_rates=bear_growth,
            margins=bear_margins,
            wacc=bear_wacc,
            terminal_g=bear_terminal_g
        )
        dcf_bear = DCFModel.calculate_dcf(
            pro_forma_result=pf_bear,
            cash=cash,
            debt=debt,
            minority_interest=minority_interest,
            shares_outstanding=shares_outstanding
        )

        # 3. Bull Case: +2.5% growth, +1.5% margin, -0.5% WACC, terminal g = 2.5%
        bull_growth = [min(15.0, g + 2.5) for g in bg]
        bull_margins = [min(22.0, m + 1.5) for m in bm]
        bull_wacc = max(0.065, base_wacc - 0.005)
        bull_terminal_g = min(0.040, base_terminal_g + 0.010)

        pf_bull = ProFormaModel.generate_pro_forma(
            base_revenue=base_revenue,
            growth_rates=bull_growth,
            margins=bull_margins,
            wacc=bull_wacc,
            terminal_g=bull_terminal_g
        )
        dcf_bull = DCFModel.calculate_dcf(
            pro_forma_result=pf_bull,
            cash=cash,
            debt=debt,
            minority_interest=minority_interest,
            shares_outstanding=shares_outstanding
        )

        # Normalize scenario weights
        tot_w = bear_weight + base_weight + bull_weight
        if tot_w <= 0: tot_w = 1.0
        w_bear = bear_weight / tot_w
        w_base = base_weight / tot_w
        w_bull = bull_weight / tot_w

        p_bear = dcf_bear["dcf_price"]
        p_base = dcf_base["dcf_price"]
        p_bull = dcf_bull["dcf_price"]

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
