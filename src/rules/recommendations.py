"""
Valuation Approach Selection, Weighting Engine, and Recommendation Rules.
Implements the MM6026 exam requirements for transparent decision criteria,
justified weights, fair-value range, and investment recommendations.
"""

from typing import Dict, Any, Tuple
from src.data.country_data import INDUSTRY_RULES


class ValuationRecommender:
    """Evaluates company characteristics and generates justified approach weights and recommendations."""

    @staticmethod
    def get_suggested_weights(sector: str, has_positive_fcff: bool = True, 
                              has_peers: bool = True) -> Dict[str, Any]:
        """
        Determines the system-suggested valuation weights based on sector profile
        and data availability.
        """
        # Match sector to known rules
        matched_rule = INDUSTRY_RULES.get(sector, INDUSTRY_RULES["General Non-Financial"])
        weights = matched_rule["recommended_weights"].copy()
        justification = matched_rule["justification"]

        # Dynamic adjustment for cash flow status
        if not has_positive_fcff:
            weights["dcf"] = max(0.20, weights["dcf"] - 0.25)
            weights["multiples"] += 0.15
            weights["rim"] += 0.10
            justification += " (Note: Historically volatile or negative cash flows reduce DCF weighting in favor of asset and earnings comps)."

        # Dynamic adjustment if peers are sparse
        if not has_peers:
            weights["multiples"] = max(0.10, weights["multiples"] - 0.15)
            weights["dcf"] += 0.15
            justification += " (Note: Limited suitable peers on IDX elevates reliance on DCF fundamental cash flows)."

        # Normalize weights to sum exactly to 1.0
        total_w = sum(weights.values())
        normalized_weights = {k: round(v / total_w, 3) for k, v in weights.items()}

        return {
            "primary_approach": matched_rule["primary_approach"],
            "suggested_weights": normalized_weights,
            "justification": justification
        }

    @staticmethod
    def evaluate_recommendation(current_price: float, central_target: float, 
                                bear_target: float, bull_target: float) -> Dict[str, Any]:
        """
        Generates an institutional recommendation (BUY / HOLD / SELL) based on Margin of Safety.
        - BUY: Upside > +15.0%
        - HOLD: Upside between -10.0% and +15.0%
        - SELL: Downside < -10.0%
        """
        if current_price <= 0:
            upside_pct = 0.0
        else:
            upside_pct = ((central_target - current_price) / current_price) * 100.0

        if upside_pct > 15.0:
            rating = "BUY"
            color = "emerald"
            badge = "🟢 BUY (Attractive Margin of Safety)"
            thesis = f"Significant undervaluation with +{upside_pct:.1f}% implied upside. Central target of IDR {central_target:,.0f} offers adequate margin of safety above current market price (IDR {current_price:,.0f})."
        elif upside_pct < -10.0:
            rating = "SELL"
            color = "rose"
            badge = "🔴 SELL (Overvalued by Market)"
            thesis = f"Current market price (IDR {current_price:,.0f}) exceeds fundamental fair value (IDR {central_target:,.0f}) by {abs(upside_pct):.1f}%. Capital downside risk warrants position trimming."
        else:
            rating = "HOLD"
            color = "amber"
            badge = "🟡 HOLD (Fairly Priced)"
            thesis = f"Market price (IDR {current_price:,.0f}) trades within a normal ±10% margin of estimation error relative to fundamental fair value (IDR {central_target:,.0f})."

        return {
            "rating": rating,
            "badge": badge,
            "color": color,
            "current_price": current_price,
            "central_target": central_target,
            "bear_target": bear_target,
            "bull_target": bull_target,
            "implied_upside_pct": round(upside_pct, 2),
            "fair_value_range": f"IDR {min(bear_target, central_target):,.0f} — IDR {max(bull_target, central_target):,.0f}",
            "decision_criteria": "BUY: Upside > +15% | HOLD: -10% to +15% | SELL: Downside < -10%",
            "thesis": thesis
        }
