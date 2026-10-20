"""
Model sanity checks and material error validation rules.
Complies with MM6026 exam requirements for automated material error detection.
"""

from typing import List, Dict, Any, Tuple


class ModelSanityChecker:
    """Validates financial valuation parameters and flags fatal or warning errors."""

    @staticmethod
    def validate_terminal_growth(g: float, wacc: float, gdp_cap: float = 0.040) -> Dict[str, Any]:
        """
        Validates terminal growth rate against WACC and long-term GDP.
        Returns status ('safe', 'warning', 'fatal') and academic message.
        """
        if g >= wacc:
            return {
                "status": "fatal",
                "severity": "CRITICAL",
                "code": "ERR_G_GE_WACC",
                "message": f"Fatal Material Error: Terminal growth ({g*100:.2f}%) ≥ WACC ({wacc*100:.2f}%). Denominator (WACC - g) is non-positive, resulting in an infinite or mathematically invalid valuation.",
                "remedy": f"Reduce terminal growth rate below WACC. Academic standard is g ≤ {gdp_cap*100:.1f}%."
            }
        elif g > gdp_cap:
            return {
                "status": "warning",
                "severity": "HIGH",
                "code": "WARN_G_GT_GDP",
                "message": f"Warning: Terminal growth ({g*100:.2f}%) exceeds sustainable Indonesian nominal GDP growth ceiling ({gdp_cap*100:.1f}%). In the terminal state, no company can outgrow the broader macro economy in perpetuity.",
                "remedy": f"Cap terminal growth g at or below long-term GDP growth ({gdp_cap*100:.1f}%)."
            }
        elif g <= 0.0:
            return {
                "status": "warning",
                "severity": "MEDIUM",
                "code": "WARN_G_NON_POSITIVE",
                "message": f"Caution: Terminal growth ({g*100:.2f}%) assumes permanent operational contraction in nominal terms.",
                "remedy": "Consider 1.0% - 2.5% to reflect minimum steady-state capital maintenance."
            }
        else:
            return {
                "status": "safe",
                "severity": "OK",
                "code": "OK_G_VALID",
                "message": f"Terminal growth ({g*100:.2f}%) satisfies Damodaran boundary conditions (0% < g < WACC and g ≤ GDP {gdp_cap*100:.1f}%).",
                "remedy": None
            }

    @staticmethod
    def validate_ev_to_equity_bridge(ev: float, cash: float, debt: float, 
                                     minority_interest: float, equity: float) -> Dict[str, Any]:
        """
        Verifies exact arithmetic reconciliation of Enterprise Value to Equity Value:
        Equity = EV + Cash - Debt - Minority Interest.
        """
        expected_equity = ev + cash - debt - minority_interest
        discrepancy = abs(expected_equity - equity)

        if discrepancy > 0.01:
            return {
                "status": "fatal",
                "severity": "CRITICAL",
                "code": "ERR_BRIDGE_MISMATCH",
                "message": f"Material Error: Enterprise-to-Equity reconciliation mismatch! Expected: Rp {expected_equity:.2f}T, Model Output: Rp {equity:.2f}T (Discrepancy: Rp {discrepancy:.2f}T).",
                "remedy": "Recalculate Equity Value = Enterprise Value + Cash - Debt - Minority Interest."
            }
        
        return {
            "status": "safe",
            "severity": "OK",
            "code": "OK_BRIDGE_RECONCILED",
            "message": f"Bridge reconciled: Enterprise Value (Rp {ev:.1f}T) + Cash (Rp {cash:.1f}T) - Debt (Rp {debt:.1f}T) - Minority Interest (Rp {minority_interest:.1f}T) = Equity Value (Rp {equity:.1f}T).",
            "remedy": None
        }

    @staticmethod
    def validate_peer_multiples(multiples: Dict[str, float]) -> List[Dict[str, Any]]:
        """Checks for negative or economically meaningless peer multiples."""
        issues = []
        for metric, val in multiples.items():
            if val is not None and val <= 0:
                issues.append({
                    "metric": metric,
                    "value": val,
                    "status": "warning",
                    "code": "WARN_NEGATIVE_MULTIPLE",
                    "message": f"Warning: Multiple {metric} is negative ({val:.2f}x). Negative multiples distort sector medians and should be excluded from relative valuation comps."
                })
        return issues

    @staticmethod
    def run_all_checks(g: float, wacc: float, ev: float, cash: float, 
                       debt: float, minority_interest: float, 
                       equity: float, peer_multiples: Dict[str, float]) -> List[Dict[str, Any]]:
        """Runs the complete MM6026 validation suite."""
        results = []
        results.append(ModelSanityChecker.validate_terminal_growth(g, wacc))
        results.append(ModelSanityChecker.validate_ev_to_equity_bridge(ev, cash, debt, minority_interest, equity))
        
        for p_issue in ModelSanityChecker.validate_peer_multiples(peer_multiples):
            results.append(p_issue)

        return results
