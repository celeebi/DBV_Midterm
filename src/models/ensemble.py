"""
Valuation Ensemble & Method Triangulation Model.
Combines DCF, Relative Multiples, and Residual Income with auto-normalized weights.
"""

from typing import Dict, Any


class ValuationEnsemble:
    """Combines individual valuation approaches into a reconciled central target."""

    @staticmethod
    def calculate_composite_target(
        dcf_price: float,
        comps_price: float,
        rim_price: float,
        weight_dcf: float = 0.60,
        weight_comps: float = 0.25,
        weight_rim: float = 0.15,
        include_dcf: bool = True,
        include_comps: bool = True,
        include_rim: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates the probability-weighted central fair value target.
        """
        w_dcf = weight_dcf if include_dcf else 0.0
        w_comps = weight_comps if include_comps else 0.0
        w_rim = weight_rim if include_rim else 0.0

        total_weight = w_dcf + w_comps + w_rim
        if total_weight <= 0:
            total_weight = 1.0
            w_dcf = 1.0

        norm_dcf = w_dcf / total_weight
        norm_comps = w_comps / total_weight
        norm_rim = w_rim / total_weight

        composite_target = round(
            (norm_dcf * dcf_price) + (norm_comps * comps_price) + (norm_rim * rim_price), 0
        )

        active_prices = []
        if include_dcf: active_prices.append(dcf_price)
        if include_comps: active_prices.append(comps_price)
        if include_rim: active_prices.append(rim_price)

        min_val = min(active_prices) if active_prices else composite_target
        max_val = max(active_prices) if active_prices else composite_target

        proof = (
            f"Composite Target = ({norm_dcf*100:.1f}% × IDR {dcf_price:,.0f} [DCF]) + "
            f"({norm_comps*100:.1f}% × IDR {comps_price:,.0f} [Comps]) + "
            f"({norm_rim*100:.1f}% × IDR {rim_price:,.0f} [RIM]) = IDR {composite_target:,.0f}"
        )

        return {
            "composite_target": composite_target,
            "min_method_price": round(min_val, 0),
            "max_method_price": round(max_val, 0),
            "normalized_weights": {
                "dcf": round(norm_dcf, 3),
                "comps": round(norm_comps, 3),
                "rim": round(norm_rim, 3)
            },
            "proof": proof
        }
