"""
Discounted Cash Flow (DCF-FCFF) Valuation Model.
Computes multi-stage explicit + terminal valuation and Enterprise-to-Equity reconciliation.
"""

from typing import Dict, Any, Optional
from src.models.pro_forma import ProFormaModel


class DCFModel:
    """Calculates intrinsic value per share using multi-stage DCF-FCFF."""

    @staticmethod
    def calculate_dcf(
        pro_forma_result: Dict[str, Any],
        cash: float = 64.9,
        debt: float = 58.2,
        minority_interest: float = 10.5,
        shares_outstanding: float = 40.48,  # Billions
        exit_multiple: float = 4.5
    ) -> Dict[str, Any]:
        """
        Reconciles Enterprise Value to Equity Value and share price:
        Equity = EV + Cash - Debt - Minority Interest
        Share Price = (Equity * 1000) / Shares (B)
        """
        total_pv_explicit = pro_forma_result["total_pv_explicit"]
        pv_tv_gordon = pro_forma_result["pv_tv_gordon"]
        tv_gordon = pro_forma_result["tv_gordon"]
        wacc = pro_forma_result["wacc"]
        terminal_g = pro_forma_result["terminal_g"]
        y10_fcff = pro_forma_result["y10_fcff"]
        y10_ebit = pro_forma_result["y10_ebit"]

        # Enterprise Value (Gordon Growth)
        ev_gordon = total_pv_explicit + pv_tv_gordon

        # Equity Value
        equity_gordon = ev_gordon + cash - debt - minority_interest
        shares_b = max(0.01, shares_outstanding)
        price_gordon = max(0.0, (equity_gordon * 1000.0) / shares_b)

        # Dual Terminal Cross-Check: Exit Multiple
        # Approx EBITDA_10 = EBIT_10 + Depr (~4.5% of rev)
        y10_depr = pro_forma_result["schedule"].iloc[-1]["depr"]
        y10_ebitda = y10_ebit + y10_depr
        tv_exit = y10_ebitda * exit_multiple
        pv_tv_exit = tv_exit / ((1.0 + wacc) ** 10)
        ev_exit = total_pv_explicit + pv_tv_exit
        equity_exit = ev_exit + cash - debt - minority_interest
        price_exit = max(0.0, (equity_exit * 1000.0) / shares_b)

        # Mathematical substituted proofs for Calculation Inspector
        tv_proof = (
            f"TV_10 = (FCFF_10 × (1 + g)) / (WACC - g) = "
            f"({y10_fcff:.2f} × (1 + {terminal_g*100:.2f}%)) / ({wacc*100:.2f}% - {terminal_g*100:.2f}%) = "
            f"Rp {tv_gordon:.2f}T (PV: Rp {pv_tv_gordon:.2f}T)"
        )

        bridge_proof = (
            f"Equity Value = Enterprise Value (Rp {ev_gordon:.2f}T) + Cash (Rp {cash:.2f}T) - "
            f"Debt (Rp {debt:.2f}T) - Minority Interest (Rp {minority_interest:.2f}T) = Rp {equity_gordon:.2f}T"
        )

        share_proof = (
            f"Fair Value per Share = (Equity Value Rp {equity_gordon:.2f}T × 1,000) / "
            f"{shares_b:.2f}B shares = IDR {price_gordon:,.0f}"
        )

        return {
            "dcf_price": round(price_gordon, 0),
            "exit_multiple_price": round(price_exit, 0),
            "enterprise_value": round(ev_gordon, 2),
            "equity_value": round(equity_gordon, 2),
            "pv_explicit": round(total_pv_explicit, 2),
            "tv_gordon": round(tv_gordon, 2),
            "pv_tv_gordon": round(pv_tv_gordon, 2),
            "tv_exit": round(tv_exit, 2),
            "pv_tv_exit": round(pv_tv_exit, 2),
            "cash": cash,
            "debt": debt,
            "minority_interest": minority_interest,
            "shares_outstanding": shares_b,
            "proofs": {
                "tv": tv_proof,
                "bridge": bridge_proof,
                "share_price": share_proof
            }
        }
