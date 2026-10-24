"""
Economic Value Added (EVA®) and Market Value Added (MVA) Valuation Engine.
Stern Stewart & Co. institutional framework measuring true economic profit created
in excess of the firm's total cost of capital.

Calculates NOPAT, Invested Capital, Return on Invested Capital (ROIC), Economic Spread (ROIC - WACC),
annual EVA projections, PV of EVA, Market Value Added (MVA), and implied equity fair value.
"""

from typing import Dict, List, Any, Optional


class EVAModel:
    """Institutional Economic Value Added (EVA®) Valuation Engine."""

    @staticmethod
    def calculate_eva(
        base_revenue: float = 6670.0,
        ebitda_margin: float = 0.507,
        da_percent_rev: float = 0.072,
        tax_rate: float = 0.22,
        wacc: float = 0.1042,
        initial_invested_capital: float = 21980.0,
        growth_rates: Optional[List[float]] = None,
        terminal_growth: float = 0.015,
        reinvestment_rate: float = 0.20,
        net_debt: float = -2760.0,
        shares_outstanding: float = 48.16,
        current_market_price: float = 280.0
    ) -> Dict[str, Any]:
        """
        Calculates 10-year EVA schedule, MVA, and implied equity fair value.

        All monetary amounts in IDR Billions unless specified.
        """
        if growth_rates is None or len(growth_rates) < 10:
            growth_rates = [0.12, 0.14, 0.10, 0.08, 0.07, 0.059, 0.048, 0.037, 0.026, 0.015]

        schedule = []
        curr_rev = base_revenue
        curr_ic = initial_invested_capital
        pv_eva_sum = 0.0

        for yr in range(1, 11):
            g = growth_rates[yr - 1]
            curr_rev = curr_rev * (1.0 + g)
            ebitda = curr_rev * ebitda_margin
            da = curr_rev * da_percent_rev
            ebit = max(0.0, ebitda - da)
            taxes = ebit * tax_rate
            nopat = ebit - taxes

            # ROIC on beginning of period invested capital
            roic = (nopat / curr_ic) if curr_ic > 0 else 0.0
            capital_charge = curr_ic * wacc
            eva = nopat - capital_charge
            economic_spread = roic - wacc

            discount_factor = (1.0 + wacc) ** yr
            pv_eva = eva / discount_factor
            pv_eva_sum += pv_eva

            # Net reinvestment increases invested capital for next period
            net_reinvestment = nopat * reinvestment_rate
            next_ic = curr_ic + net_reinvestment

            schedule.append({
                "year": f"20{25 + yr}E",
                "period": yr,
                "revenue": round(curr_rev, 2),
                "ebit": round(ebit, 2),
                "nopat": round(nopat, 2),
                "invested_capital_beg": round(curr_ic, 2),
                "roic_pct": round(roic * 100.0, 4),
                "wacc_pct": round(wacc * 100.0, 4),
                "economic_spread_pct": round(economic_spread * 100.0, 4),
                "capital_charge": round(capital_charge, 2),
                "eva": round(eva, 2),
                "discount_factor": round(discount_factor, 4),
                "pv_eva": round(pv_eva, 2),
                "cumulative_pv_eva": round(pv_eva_sum, 2)
            })

            curr_ic = next_ic

        # Terminal EVA & Market Value Added (MVA)
        last_eva = schedule[-1]["eva"]
        terminal_eva = last_eva * (1.0 + terminal_growth)
        terminal_mva = terminal_eva / max(0.005, wacc - terminal_growth)
        pv_terminal_mva = terminal_mva / ((1.0 + wacc) ** 10)

        # Total Market Value Added (MVA) = Explicit PV(EVA) + PV(Terminal MVA)
        total_mva = pv_eva_sum + pv_terminal_mva

        # Total Enterprise Value = Initial Invested Capital + MVA
        enterprise_value = initial_invested_capital + total_mva

        # Equity Value & Target Price per Share
        equity_value = enterprise_value - net_debt
        safe_shares = max(0.001, shares_outstanding)
        eva_share_price = round((equity_value * 1e9) / (safe_shares * 1e9), 0)

        # Base year ROIC & Spread
        base_nopat = (base_revenue * (ebitda_margin - da_percent_rev)) * (1.0 - tax_rate)
        base_roic = (base_nopat / initial_invested_capital) if initial_invested_capital > 0 else 0.0

        return {
            "model": "Economic Value Added (EVA®)",
            "initial_invested_capital": round(initial_invested_capital, 2),
            "base_nopat": round(base_nopat, 2),
            "base_roic_pct": round(base_roic * 100.0, 2),
            "wacc_pct": round(wacc * 100.0, 2),
            "base_economic_spread_pct": round((base_roic - wacc) * 100.0, 2),
            "sum_pv_eva_10yr": round(pv_eva_sum, 2),
            "terminal_eva": round(terminal_eva, 2),
            "pv_terminal_mva": round(pv_terminal_mva, 2),
            "total_mva": round(total_mva, 2),
            "enterprise_value": round(enterprise_value, 2),
            "net_debt": round(net_debt, 2),
            "equity_value": round(equity_value, 2),
            "target_share_price": int(eva_share_price),
            "current_market_price": round(current_market_price, 1),
            "implied_upside_pct": round(((eva_share_price / max(1.0, current_market_price)) - 1.0) * 100.0, 1),
            "schedule": schedule
        }
