"""
Residual Income Model (RIM / Edwards-Bell-Ohlson) Valuation.
Values equity as current Book Value plus the present value of expected residual income:
V_0 = B_0 + Sum[ (ROE_t - Ke) * B_{t-1} / (1 + Ke)^t ].
"""

from typing import Dict, Any


class ResidualIncomeModel:
    """Calculates intrinsic value of equity using Residual Income / Economic Value Added."""

    @staticmethod
    def calculate_rim(
        book_value_equity: float = 22.47,  # Rp T (PWON default)
        base_net_income: float = 2.35,     # Rp T (PWON default)
        ke: float = 0.1200,                # Cost of Equity
        growth_rate: float = 0.050,        # Earnings growth
        retention_ratio: float = 0.70,     # Ploughed back into equity
        horizon_years: int = 10,
        shares_outstanding: float = 48.16, # Billions
        terminal_persistence: float = 0.60 # Fade factor in residual income
    ) -> Dict[str, Any]:
        """
        Projects Residual Income across horizon and computes equity target.
        """
        b_prev = book_value_equity
        ni_prev = base_net_income
        pv_residual_income = 0.0

        for t in range(1, horizon_years + 1):
            ni_t = ni_prev * (1.0 + growth_rate)
            equity_charge = b_prev * ke
            ri_t = ni_t - equity_charge

            df = 1.0 / ((1.0 + ke) ** t)
            pv_residual_income += ri_t * df

            # Book value accretion = Prior BV + (Net Income * Retention)
            b_prev = b_prev + (ni_t * retention_ratio)
            ni_prev = ni_t

        # Terminal Residual Income Value
        last_ri = ni_prev - (b_prev * ke)
        terminal_ri_val = (last_ri * terminal_persistence) / (ke - 0.015)
        pv_terminal_ri = terminal_ri_val / ((1.0 + ke) ** horizon_years)

        # Total Equity Value = Initial Book Value + PV of Explicit RI + PV of Terminal RI
        equity_val = book_value_equity + pv_residual_income + pv_terminal_ri
        price_per_share = max(0.0, (equity_val * 1000.0) / shares_outstanding)

        proof = (
            f"V_0 = Initial Book Value (Rp {book_value_equity:.1f}T) + "
            f"PV of 10Y Excess Earnings (Rp {pv_residual_income:.1f}T) + "
            f"PV of Terminal RI (Rp {pv_terminal_ri:.1f}T) = Rp {equity_val:.1f}T"
        )

        return {
            "rim_target_price": round(price_per_share, 0),
            "equity_value": round(equity_val, 2),
            "initial_book_value": book_value_equity,
            "pv_residual_income": round(pv_residual_income, 2),
            "pv_terminal_ri": round(pv_terminal_ri, 2),
            "ke": ke,
            "proof": proof
        }
