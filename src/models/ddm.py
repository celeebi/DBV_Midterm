"""
Multi-Stage Dividend Discount Model (DDM / Gordon Growth Equity Model).
Values equity as the present value of explicit 10-year projected cash dividends per share
plus the present value of terminal perpetuity dividends, discounted at the Cost of Equity (Ke).
"""

from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np


class DividendDiscountModel:
    """Calculates intrinsic equity share price using Multi-Stage Dividend Discounting."""

    @staticmethod
    def calculate_ddm(
        base_net_income: float = 2.35,  # Rp T
        shares_outstanding: float = 48.16,  # Billions
        ke: float = 0.1200,  # Cost of Equity
        growth_rates: Optional[List[float]] = None,
        terminal_g: float = 0.015,
        payout_ratio: float = 0.30,
        terminal_payout_ratio: Optional[float] = None,
        start_year: int = 2026
    ) -> Dict[str, Any]:
        """
        Projects explicit 10-year per-share dividends and terminal dividend perpetuity.
        Returns:
            - ddm_price: Intrinsic value per share (IDR)
            - total_pv_dividends: PV of 10-year explicit dividends (IDR)
            - terminal_value: TV_10 per share (IDR)
            - pv_terminal_value: PV of TV_10 (IDR)
            - dividend_schedule: DataFrame of Year, EPS, DPS, Discount Factor, and PV of DPS
            - proofs: LaTeX mathematical derivations for the Calculation Inspector
        """
        g_list = growth_rates if growth_rates is not None else [7.0, 6.5, 5.5, 5.0, 4.5, 3.9, 3.3, 2.7, 2.1, 1.5]
        term_payout = terminal_payout_ratio if terminal_payout_ratio is not None else payout_ratio

        # Base EPS in IDR
        base_eps = (base_net_income * 1000.0) / shares_outstanding
        base_dps = base_eps * payout_ratio

        schedule_rows = []
        total_pv_dividends = 0.0
        curr_eps = base_eps

        for t in range(1, 11):
            year = start_year + t - 1
            g = float(g_list[t - 1]) / 100.0
            curr_eps = curr_eps * (1.0 + g)
            dps = curr_eps * payout_ratio
            df = 1.0 / ((1.0 + ke) ** t)
            pv_dps = dps * df
            total_pv_dividends += pv_dps

            schedule_rows.append({
                "year": year,
                "period": f"{year}E (Y{t})",
                "growth_pct": round(g * 100.0, 2),
                "eps": round(curr_eps, 2),
                "payout_ratio_pct": round(payout_ratio * 100.0, 1),
                "dps": round(dps, 2),
                "discount_factor": round(df, 4),
                "pv_dps": round(pv_dps, 2)
            })

        df_schedule = pd.DataFrame(schedule_rows)
        y10_dps = schedule_rows[-1]["dps"]

        # Terminal Value Gordon Growth: TV_10 = (DPS_10 * (1 + g)) / (Ke - g)
        if ke > terminal_g:
            tv_numerator = y10_dps * (1.0 + terminal_g) * (term_payout / payout_ratio if payout_ratio > 0 else 1.0)
            tv_10 = tv_numerator / (ke - terminal_g)
        else:
            tv_numerator = y10_dps * (1.0 + terminal_g)
            tv_10 = tv_numerator / 0.05

        df_10 = 1.0 / ((1.0 + ke) ** 10)
        pv_tv = tv_10 * df_10
        ddm_price = total_pv_dividends + pv_tv

        # LaTeX mathematical derivations for the Calculation Inspector
        step1_dps_proof = (
            f"DPS_1 = EPS_0 \\times (1 + g_1) \\times Payout = "
            f"\\text{{Rp }} {base_eps:.2f} \\times (1 + {g_list[0]:.1f}\\%) \\times {payout_ratio*100:.1f}\\% = "
            f"\\text{{Rp }} {schedule_rows[0]['dps']:.2f}"
        )
        step2_tv_proof = (
            f"TV_{{10}} = \\frac{{DPS_{{10}} \\times (1 + g)}}{{K_e - g}} = "
            f"\\frac{{{y10_dps:.2f} \\times (1 + {terminal_g*100:.1f}\\%)}}{{{ke*100:.2f}\\% - {terminal_g*100:.1f}\\%}} = "
            f"\\text{{IDR }} {tv_10:,.2f}"
        )
        step3_bridge_proof = (
            f"P_{{\\text{{DDM}}}} = \\sum_{{t=1}}^{{10}} \\frac{{DPS_t}}{{(1 + K_e)^t}} + \\frac{{TV_{{10}}}}{{(1 + K_e)^{{10}}}} = "
            f"\\text{{IDR }} {total_pv_dividends:,.2f} + \\text{{IDR }} {pv_tv:,.2f} = "
            f"\\mathbf{{\\text{{IDR }} {ddm_price:,.0f}}}"
        )

        return {
            "ddm_price": round(ddm_price, 0),
            "base_eps": round(base_eps, 2),
            "base_dps": round(base_dps, 2),
            "total_pv_dividends": round(total_pv_dividends, 2),
            "terminal_value": round(tv_10, 2),
            "pv_terminal_value": round(pv_tv, 2),
            "schedule": df_schedule,
            "ke": ke,
            "terminal_g": terminal_g,
            "payout_ratio": payout_ratio,
            "proofs": {
                "dps": step1_dps_proof,
                "tv": step2_tv_proof,
                "total": step3_bridge_proof
            }
        }
