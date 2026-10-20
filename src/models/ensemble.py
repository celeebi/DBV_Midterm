"""
Valuation Ensemble & Method Triangulation Model.
Combines DCF, Relative Multiples, Residual Income, and Dividend Discount Model (DDM)
with auto-normalized weights.
"""

from typing import Dict, Any, Optional


class ValuationEnsemble:
    """Combines individual valuation approaches into a reconciled central target."""

    @staticmethod
    def calculate_composite_target(
        dcf_price: float,
        comps_price: float,
        rim_price: float,
        ddm_price: Optional[float] = None,
        weight_dcf: float = 0.50,
        weight_comps: float = 0.25,
        weight_rim: float = 0.15,
        weight_ddm: float = 0.10,
        include_dcf: bool = True,
        include_comps: bool = True,
        include_rim: bool = True,
        include_ddm: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates the probability-weighted central fair value target across up to 4 approaches.
        """
        has_ddm = ddm_price is not None and ddm_price > 0
        w_dcf = weight_dcf if include_dcf else 0.0
        w_comps = weight_comps if include_comps else 0.0
        w_rim = weight_rim if include_rim else 0.0
        w_ddm = (weight_ddm if (include_ddm and has_ddm) else 0.0)

        total_weight = w_dcf + w_comps + w_rim + w_ddm
        if total_weight <= 0:
            total_weight = 1.0
            w_dcf = 1.0

        norm_dcf = w_dcf / total_weight
        norm_comps = w_comps / total_weight
        norm_rim = w_rim / total_weight
        norm_ddm = w_ddm / total_weight

        weighted_val = (norm_dcf * dcf_price) + (norm_comps * comps_price) + (norm_rim * rim_price)
        if has_ddm and norm_ddm > 0:
            weighted_val += (norm_ddm * ddm_price)

        composite_target = round(weighted_val, 0)

        active_prices = []
        if include_dcf: active_prices.append(dcf_price)
        if include_comps: active_prices.append(comps_price)
        if include_rim: active_prices.append(rim_price)
        if include_ddm and has_ddm: active_prices.append(ddm_price)

        min_val = min(active_prices) if active_prices else composite_target
        max_val = max(active_prices) if active_prices else composite_target

        proof_parts = [
            f"({norm_dcf*100:.1f}% × IDR {dcf_price:,.0f} [DCF])",
            f"({norm_comps*100:.1f}% × IDR {comps_price:,.0f} [Comps])",
            f"({norm_rim*100:.1f}% × IDR {rim_price:,.0f} [RIM])"
        ]
        if has_ddm and norm_ddm > 0:
            proof_parts.append(f"({norm_ddm*100:.1f}% × IDR {ddm_price:,.0f} [DDM])")

        proof = f"Composite Target = {' + '.join(proof_parts)} = IDR {composite_target:,.0f}"

        return {
            "composite_target": composite_target,
            "min_method_price": round(min_val, 0),
            "max_method_price": round(max_val, 0),
            "normalized_weights": {
                "dcf": round(norm_dcf, 3),
                "comps": round(norm_comps, 3),
                "rim": round(norm_rim, 3),
                "ddm": round(norm_ddm, 3)
            },
            "proof": proof
        }
