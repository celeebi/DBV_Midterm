"""
Tornado Sensitivity Diagram Engine.
Calculates two-sided valuation sensitivities across key operational and macro drivers,
sorting variables by total fair-value swing to produce institutional tornado charts.
"""

from typing import Dict, List, Any, Optional


class TornadoEngine:
    """Institutional Tornado Sensitivity Engine."""

    @staticmethod
    def calculate_tornado(
        base_revenue: float = 6670.0,
        base_wacc: float = 0.1042,
        base_terminal_g: float = 0.015,
        base_ebitda_margin: float = 0.507,
        base_rev_growth: float = 0.10,
        base_capex_percent_rev: float = 0.085,
        base_exit_multiple: float = 6.5,
        tax_rate: float = 0.22,
        da_percent_rev: float = 0.072,
        net_debt: float = -2760.0,
        shares_outstanding: float = 48.16,
        custom_ranges: Optional[Dict[str, Dict[str, float]]] = None
    ) -> Dict[str, Any]:
        """
        Computes two-sided sensitivity impacts on fair share price and sorts descending by swing.
        """
        def run_dcf(w, tg, margin, growth, capex, exit_m):
            pv_fcf = 0.0
            curr_rev = base_revenue
            last_fcff = 0.0
            for yr in range(1, 11):
                curr_rev = curr_rev * (1.0 + growth)
                ebitda = curr_rev * margin
                da = curr_rev * da_percent_rev
                ebit = max(0.0, ebitda - da)
                taxes = ebit * tax_rate
                nopat = ebit - taxes
                c = curr_rev * capex
                nwc = curr_rev * growth * 0.04
                last_fcff = nopat + da - c - nwc
                pv_fcf += last_fcff / ((1.0 + w) ** yr)

            # Terminal Value
            terminal_fcff = last_fcff * (1.0 + tg)
            tv = terminal_fcff / max(0.005, w - tg)
            pv_tv = tv / ((1.0 + w) ** 10)

            ev = pv_fcf + pv_tv
            equity = ev - net_debt
            safe_shares = max(0.001, shares_outstanding)
            return max(0.0, (equity * 1e9) / (safe_shares * 1e9))

        base_price = run_dcf(
            base_wacc, base_terminal_g, base_ebitda_margin,
            base_rev_growth, base_capex_percent_rev, base_exit_multiple
        )

        # Default sensitivity test intervals
        intervals = {
            "wacc": {
                "label": "Cost of Capital (WACC)",
                "base": base_wacc,
                "low": base_wacc - 0.01,
                "high": base_wacc + 0.01,
                "format": "pct",
                "unit": "%"
            },
            "ebitda_margin": {
                "label": "EBITDA Margin",
                "base": base_ebitda_margin,
                "low": base_ebitda_margin - 0.03,
                "high": base_ebitda_margin + 0.03,
                "format": "pct",
                "unit": "%"
            },
            "rev_growth": {
                "label": "Revenue Growth (CAGR)",
                "base": base_rev_growth,
                "low": base_rev_growth - 0.02,
                "high": base_rev_growth + 0.02,
                "format": "pct",
                "unit": "%"
            },
            "terminal_growth": {
                "label": "Terminal Growth Rate (g)",
                "base": base_terminal_g,
                "low": max(0.005, base_terminal_g - 0.005),
                "high": min(base_wacc - 0.005, base_terminal_g + 0.005),
                "format": "pct",
                "unit": "%"
            },
            "capex_percent_rev": {
                "label": "CapEx (% of Revenue)",
                "base": base_capex_percent_rev,
                "low": base_capex_percent_rev - 0.015,
                "high": base_capex_percent_rev + 0.015,
                "format": "pct",
                "unit": "%"
            },
            "exit_multiple": {
                "label": "Terminal Exit Multiple",
                "base": base_exit_multiple,
                "low": max(3.0, base_exit_multiple - 1.5),
                "high": base_exit_multiple + 1.5,
                "format": "mult",
                "unit": "x"
            }
        }

        if custom_ranges:
            for k, v in custom_ranges.items():
                if k in intervals:
                    intervals[k].update(v)

        items = []
        for key, p in intervals.items():
            if key == "wacc":
                p_low = run_dcf(p["low"], base_terminal_g, base_ebitda_margin, base_rev_growth, base_capex_percent_rev, base_exit_multiple)
                p_high = run_dcf(p["high"], base_terminal_g, base_ebitda_margin, base_rev_growth, base_capex_percent_rev, base_exit_multiple)
            elif key == "ebitda_margin":
                p_low = run_dcf(base_wacc, base_terminal_g, p["low"], base_rev_growth, base_capex_percent_rev, base_exit_multiple)
                p_high = run_dcf(base_wacc, base_terminal_g, p["high"], base_rev_growth, base_capex_percent_rev, base_exit_multiple)
            elif key == "rev_growth":
                p_low = run_dcf(base_wacc, base_terminal_g, base_ebitda_margin, p["low"], base_capex_percent_rev, base_exit_multiple)
                p_high = run_dcf(base_wacc, base_terminal_g, base_ebitda_margin, p["high"], base_capex_percent_rev, base_exit_multiple)
            elif key == "terminal_growth":
                p_low = run_dcf(base_wacc, p["low"], base_ebitda_margin, base_rev_growth, base_capex_percent_rev, base_exit_multiple)
                p_high = run_dcf(base_wacc, p["high"], base_ebitda_margin, base_rev_growth, base_capex_percent_rev, base_exit_multiple)
            elif key == "capex_percent_rev":
                p_low = run_dcf(base_wacc, base_terminal_g, base_ebitda_margin, base_rev_growth, p["low"], base_exit_multiple)
                p_high = run_dcf(base_wacc, base_terminal_g, base_ebitda_margin, base_rev_growth, p["high"], base_exit_multiple)
            elif key == "exit_multiple":
                p_low = base_price * (1.0 - 0.05)  # proxy exit multiple sensitivity
                p_high = base_price * (1.0 + 0.05)

            # Swing is absolute difference between high and low impact
            min_p = min(p_low, p_high)
            max_p = max(p_low, p_high)
            swing = max_p - min_p

            items.append({
                "key": key,
                "label": p["label"],
                "unit": p["unit"],
                "format": p["format"],
                "base_val": round(p["base"] * 100, 2) if p["format"] == "pct" else round(p["base"], 2),
                "low_val": round(p["low"] * 100, 2) if p["format"] == "pct" else round(p["low"], 2),
                "high_val": round(p["high"] * 100, 2) if p["format"] == "pct" else round(p["high"], 2),
                "price_at_low_param": round(p_low, 0),
                "price_at_high_param": round(p_high, 0),
                "min_price": round(min_p, 0),
                "max_price": round(max_p, 0),
                "swing": round(swing, 0),
                "swing_pct": round((swing / max(1.0, base_price)) * 100.0, 1),
                "downside_delta": round(min_p - base_price, 0),
                "upside_delta": round(max_p - base_price, 0)
            })

        # Sort descending by swing to create the classic institutional Tornado shape
        items.sort(key=lambda x: x["swing"], reverse=True)

        return {
            "model": "Tornado Sensitivity Analysis",
            "base_share_price": round(base_price, 0),
            "items": items
        }
