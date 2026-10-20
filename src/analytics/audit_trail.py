"""
Calculation Inspector and Audit Trail Generator.
Produces formatted LaTeX equations, corporate finance theory explanations,
and exact substituted mathematical derivations for examination auditing.
"""

from typing import Dict, Any, List, Optional


class ValuationAuditTrail:
    """Formats step-by-step mathematical proofs for the Calculation Inspector."""

    @staticmethod
    def generate_full_audit_trail(
        wacc_data: Dict[str, Any],
        dcf_data: Dict[str, Any],
        comps_data: Dict[str, Any],
        ensemble_data: Dict[str, Any],
        ddm_data: Optional[Dict[str, Any]] = None
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

        # 5. Dividend Discount Model (DDM) Card (if available)
        if ddm_data:
            audit_cards.append({
                "title": "5. Dividend Discount Model (DDM) Proof",
                "theory": "Direct equity valuation discounting explicit per-share cash dividend distributions at the Cost of Equity (Ke), capturing cash returned directly to shareholders plus terminal dividend perpetuity.",
                "latex_formula": r"P_{\text{DDM}} = \sum_{t=1}^{10} \frac{DPS_t}{(1 + K_e)^t} + \frac{DPS_{10} \times (1 + g)}{(K_e - g) \times (1 + K_e)^{10}}",
                "substituted_proof": ddm_data["proofs"]["total"],
                "component_proofs": [
                    ddm_data["proofs"]["dps"],
                    ddm_data["proofs"]["tv"]
                ]
            })

        # 6. Composite Target Triangulation Card
        triangulation_num = 6 if ddm_data else 5
        comp_proofs = [
            f"DCF-FCFF Weight: {ensemble_data['normalized_weights'].get('dcf', 0.0)*100:.1f}%",
            f"Relative Multiples Weight: {ensemble_data['normalized_weights'].get('comps', 0.0)*100:.1f}%",
            f"Residual Income Weight: {ensemble_data['normalized_weights'].get('rim', 0.0)*100:.1f}%"
        ]
        if "ddm" in ensemble_data['normalized_weights']:
            comp_proofs.append(f"Dividend Discount (DDM) Weight: {ensemble_data['normalized_weights']['ddm']*100:.1f}%")

        audit_cards.append({
            "title": f"{triangulation_num}. Multi-Approach Target Triangulation Proof",
            "theory": "Blends intrinsic fundamental valuations with market-based peer multiples using justified weights reflecting industry maturity and cash flow visibility.",
            "latex_formula": r"\text{Target Price} = \sum_{i=1}^{k} \left( w_i \times P_i \right)",
            "substituted_proof": ensemble_data["proof"],
            "component_proofs": comp_proofs
        })

        return audit_cards
