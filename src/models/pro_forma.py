"""
Pro Forma 10-Year Dynamic Financial Statement Generator.
Supports year-by-year manual growth/margin adjustments, thesis notes,
and granular assumption levers (terminal g, CapEx %, NWC %, tax holidays).
"""

from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np


class ProFormaModel:
    """Generates 10-year multi-stage pro forma statements and FCFF schedules."""

    DEFAULT_GROWTH_RATES = [6.0, 3.0, 2.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5]
    DEFAULT_MARGINS = [14.0, 13.5, 13.5, 14.0, 14.0, 13.9, 13.8, 13.8, 13.8, 13.8]
    DEFAULT_NOTES = [
        "Consensus auto recovery and heavy equipment volume steady",
        "Conservative 3.0% growth due to EV competition and price discounting",
        "Macro consolidation phase; capital discipline and inventory optimization",
        "New EV/hybrid model rollout and mining equipment replacement cycle",
        "Phase 1 maturation; operating margin stabilizes near 14.0%",
        "Transition Fade Year 1: High growth fades toward macroeconomic equilibrium",
        "Transition Fade Year 2: Automotive electrification penetration deepens",
        "Transition Fade Year 3: Margins stabilize at industry steady-state",
        "Transition Fade Year 4: Reinvestment equals steady maintenance replacement",
        "Terminal Year 10: Equilibrium growth (g = 1.5%) reached for Gordon Growth Model"
    ]

    @staticmethod
    def generate_pro_forma(
        base_revenue: float = 316.4,
        growth_rates: Optional[List[float]] = None,
        margins: Optional[List[float]] = None,
        wacc: float = 0.0952,
        terminal_g: float = 0.015,
        tax_rate: float = 0.22,
        has_tax_holiday: bool = False,
        capex_pct: float = 0.055,
        expansion_capex_y2: float = 0.0,
        nwc_pct: float = 0.080,
        depr_pct: float = 0.045,
        notes: Optional[List[str]] = None,
        start_year: int = 2026
    ) -> Dict[str, Any]:
        """
        Builds the 10-Year Pro Forma Financial Statement Schedule.
        All currency figures are in Trillion IDR.
        """
        g_list = growth_rates if growth_rates is not None else ProFormaModel.DEFAULT_GROWTH_RATES
        m_list = margins if margins is not None else ProFormaModel.DEFAULT_MARGINS
        n_list = notes if notes is not None else ProFormaModel.DEFAULT_NOTES

        # Ensure exact 10 periods
        if len(g_list) < 10:
            g_list = list(g_list) + [terminal_g * 100] * (10 - len(g_list))
        if len(m_list) < 10:
            m_list = list(m_list) + [m_list[-1]] * (10 - len(m_list))
        if len(n_list) < 10:
            n_list = list(n_list) + ["Ongoing operations"] * (10 - len(n_list))

        rows = []
        prev_rev = base_revenue
        total_pv_explicit = 0.0

        for t in range(1, 11):
            year_num = start_year + t - 1
            period_label = f"{year_num}E (Y{t})"
            
            g = float(g_list[t - 1]) / 100.0
            m = float(m_list[t - 1]) / 100.0
            note = str(n_list[t - 1])

            # Revenue roll-forward
            rev = prev_rev * (1.0 + g)
            delta_rev = rev - prev_rev

            # Operating Income (EBIT)
            ebit = rev * m

            # Dynamic tax rate (applies pioneer 10% holiday if toggled)
            t_rate = 0.10 if (has_tax_holiday and t <= 3) else tax_rate
            nopat = ebit * (1.0 - t_rate)

            # Depreciation & Amortization
            depr = rev * depr_pct

            # CapEx = Maintenance CapEx + Expansion CapEx in Y2
            capex = (rev * capex_pct) + (expansion_capex_y2 if t == 2 else 0.0)

            # Change in Net Working Capital
            delta_nwc = max(0.0, delta_rev * nwc_pct)

            # Free Cash Flow to Firm (FCFF)
            fcff = nopat + depr - capex - delta_nwc

            # Discount Factor & Present Value
            df = 1.0 / ((1.0 + wacc) ** t)
            pv_fcff = fcff * df
            total_pv_explicit += pv_fcff

            rows.append({
                "period": period_label,
                "year": year_num,
                "t": t,
                "growth_pct": round(g * 100.0, 2),
                "margin_pct": round(m * 100.0, 2),
                "revenue": round(rev, 2),
                "ebit": round(ebit, 2),
                "tax_rate": round(t_rate * 100.0, 1),
                "nopat": round(nopat, 2),
                "depr": round(depr, 2),
                "capex": round(capex, 2),
                "delta_nwc": round(delta_nwc, 2),
                "fcff": round(fcff, 2),
                "discount_factor": round(df, 4),
                "pv_fcff": round(pv_fcff, 2),
                "thesis_note": note
            })

            prev_rev = rev

        df_pro_forma = pd.DataFrame(rows)

        # Year 10 FCFF and Terminal Value Calculation
        y10_fcff = df_pro_forma.iloc[-1]["fcff"]
        y10_ebit = df_pro_forma.iloc[-1]["ebit"]
        y10_rev = df_pro_forma.iloc[-1]["revenue"]

        # Terminal Gordon Growth
        denom = max(0.001, wacc - terminal_g)
        tv_gordon = (y10_fcff * (1.0 + terminal_g)) / denom
        pv_tv_gordon = tv_gordon / ((1.0 + wacc) ** 10)

        # Enterprise Value
        ev = total_pv_explicit + pv_tv_gordon

        return {
            "schedule": df_pro_forma,
            "total_pv_explicit": round(total_pv_explicit, 2),
            "tv_gordon": round(tv_gordon, 2),
            "pv_tv_gordon": round(pv_tv_gordon, 2),
            "enterprise_value": round(ev, 2),
            "y10_fcff": round(y10_fcff, 2),
            "y10_ebit": round(y10_ebit, 2),
            "terminal_g": terminal_g,
            "wacc": wacc
        }

    @staticmethod
    def apply_auto_fade(y5_growth: float, terminal_g: float) -> List[float]:
        """Linearly fades growth from Year 5 to Terminal g across Years 6-10."""
        step = (y5_growth - terminal_g * 100) / 5.0
        return [round(y5_growth - step * (i + 1), 2) for i in range(5)]
