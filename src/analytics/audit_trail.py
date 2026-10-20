"""
Calculation Inspector and Audit Trail Generator.
Produces formatted LaTeX equations, corporate finance theory explanations,
and exact substituted mathematical derivations for examination auditing.
"""

from typing import Dict, Any, List


class ValuationAuditTrail:
    """Formats step-by-step mathematical proofs for the Calculation Inspector."""

    @staticmethod
    def generate_full_audit_trail(
        wacc_data: Dict[str, Any],
        dcf_data: Dict[str, Any],
        comps_data: Dict[str, Any],
        ensemble_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Builds audit trail cards with plain-language theory, LaTeX formula,
        and exact substituted balance sheet numbers.
        """
        audit_cards = []

        # 1. Cost of Capital (WACC) Card
        audit_cards.append({
            "title": "1. Weighted Average Cost of Capital (WACC) Proof",
            "theory": "WACC represents the firm's blended hurdle rate, weighting equity cost (CAPM) and after-tax cost of debt by their target capital structure proportions.",
            "latex_formula": r"WACC = \left(\frac{E}{V} \times K_e\right) + \left(\frac{D}{V} \times K_d \times (1 - t)\right)",
            "substituted_proof": wacc_data["proofs"]["wacc"],
            "component_proofs": [
                wacc_data["proofs"]["ke"],
                wacc_data["proofs"]["kd"]
            ]
        })

        # 2. Terminal Value (Gordon Growth) Card
        audit_cards.append({
            "title": "2. Terminal Value (Gordon Growth Model) Proof",
            "theory": "Capitalizes steady-state cash flows at the end of the explicit forecast horizon into perpetuity. Requires that perpetual growth (g) remain strictly below WACC and long-term GDP growth.",
            "latex_formula": r"TV_{10} = \frac{FCFF_{11}}{WACC - g} = \frac{FCFF_{10} \times (1 + g)}{WACC - g}",
            "substituted_proof": dcf_data["proofs"]["tv"],
            "component_proofs": [
                f"Present Value of TV = TV_10 / (1 + WACC)^10 = Rp {dcf_data['tv_gordon']:.2f}T / (1 + {wacc_data['wacc']*100:.2f}%)^10 = Rp {dcf_data['pv_tv_gordon']:.2f}T",
                f"PV of 10-Year Explicit Forecasts = Rp {dcf_data['pv_explicit']:.2f}T",
                f"Enterprise Value (EV) = PV(Explicit) + PV(Terminal Value) = Rp {dcf_data['enterprise_value']:.2f}T"
            ]
        })

        # 3. Enterprise-to-Equity Bridge Card
        audit_cards.append({
            "title": "3. Enterprise-to-Equity Value Bridge Proof",
            "theory": "Reconciles core operating enterprise value to equity value available to common shareholders by adding non-operating cash and subtracting debt obligations and minority claims.",
            "latex_formula": r"\text{Equity Value} = \text{Enterprise Value} + \text{Cash} - \text{Total Debt} - \text{Minority Interest}",
            "substituted_proof": dcf_data["proofs"]["bridge"],
            "component_proofs": [
                dcf_data["proofs"]["share_price"]
            ]
        })

        # 4. Relative Valuation Comps Card
        audit_cards.append({
            "title": "4. Relative Valuation Comps Proof",
            "theory": "Values the company using prevailing peer trading multiples from direct Indonesian competitors, adjusted for leverage via EV/EBITDA.",
            "latex_formula": r"\text{Implied EV} = \text{Target EBITDA} \times \text{Sector Benchmark EV/EBITDA}",
            "substituted_proof": comps_data["proof"],
            "component_proofs": [
                f"Selected Benchmark Metric: {comps_data['stat_method'].title()} (EV/EBITDA: {comps_data['benchmark_ev_ebitda']:.2f}x, P/E: {comps_data['benchmark_pe']:.2f}x)",
                f"Comps Target Price per Share: IDR {comps_data['comps_target_price']:,.0f}"
            ]
        })

        # 5. Composite Target Triangulation Card
        audit_cards.append({
            "title": "5. Multi-Approach Target Triangulation Proof",
            "theory": "Blends intrinsic fundamental valuations with market-based peer multiples using justified weights reflecting industry maturity and cash flow visibility.",
            "latex_formula": r"\text{Target Price} = (w_{\text{DCF}} \times P_{\text{DCF}}) + (w_{\text{Comps}} \times P_{\text{Comps}}) + (w_{\text{RIM}} \times P_{\text{RIM}})",
            "substituted_proof": ensemble_data["proof"],
            "component_proofs": [
                f"DCF-FCFF Weight: {ensemble_data['normalized_weights']['dcf']*100:.1f}%",
                f"Relative Multiples Weight: {ensemble_data['normalized_weights']['comps']*100:.1f}%",
                f"Residual Income Weight: {ensemble_data['normalized_weights']['rim']*100:.1f}%"
            ]
        })

        return audit_cards
