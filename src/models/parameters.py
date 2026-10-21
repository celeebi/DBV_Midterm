"""
Cost of Capital (CAPM, Cost of Debt, and WACC) engine.
Computes fundamental CAPM parameters with mature market ERP, Country Risk Premium (CRP),
and step-by-step mathematical proofs for the Calculation Inspector.
"""

from typing import Dict, Any, Optional


class CapitalStructureModel:
    """Computes CAPM Cost of Equity, After-Tax Cost of Debt, and Blended WACC."""

    @staticmethod
    def calculate_wacc(
        rf: float = 0.0660,
        beta: float = 0.75,
        erp: Optional[float] = None,
        mature_erp: float = 0.0500,
        crp: float = 0.0216,
        kd_pre: float = 0.0650,
        tax_rate: float = 0.22,
        wd: float = 0.200
    ) -> Dict[str, Any]:
        """
        Calculates WACC and returns full parameter decomposition:
        - Total ERP = Mature Market ERP + Country Risk Premium (CRP)
        - Ke = Rf + Beta * Total ERP
        - Kd_after = Kd_pre * (1 - t)
        - We = 1 - Wd
        - WACC = (We * Ke) + (Wd * Kd_after)
        """
        # Determine effective Total Equity Risk Premium
        if erp is not None:
            total_erp = float(erp)
        else:
            total_erp = float(mature_erp) + float(crp)

        # Cost of Equity via CAPM
        ke = rf + (beta * total_erp)

        # After-tax Cost of Debt
        kd_after = kd_pre * (1.0 - tax_rate)

        # Capital Structure Weights
        wd = max(0.0, min(1.0, float(wd)))
        we = max(0.0, 1.0 - wd)

        # Blended WACC
        wacc = (we * ke) + (wd * kd_after)

        # Step-by-step substituted mathematical proof strings for Calculation Inspector
        step0_erp_proof = f"Total ERP = Mature ERP + CRP = {mature_erp*100:.2f}% + {crp*100:.2f}% = {total_erp*100:.2f}%"
        step1_ke_proof = f"Ke = Rf + (β × ERP) = {rf*100:.2f}% + ({beta:.2f} × {total_erp*100:.2f}%) = {ke*100:.2f}%"
        step2_kd_proof = f"Kd(after-tax) = Kd(pre-tax) × (1 - t) = {kd_pre*100:.2f}% × (1 - {tax_rate*100:.1f}%) = {kd_after*100:.2f}%"
        step3_wacc_proof = f"WACC = (We × Ke) + (Wd × Kd) = ({we*100:.1f}% × {ke*100:.2f}%) + ({wd*100:.1f}% × {kd_after*100:.2f}%) = {wacc*100:.2f}%"

        return {
            "wacc": round(wacc, 4),
            "ke": round(ke, 4),
            "kd_pre": round(kd_pre, 4),
            "kd_after": round(kd_after, 4),
            "rf": round(rf, 4),
            "beta": round(beta, 2),
            "mature_erp": round(mature_erp, 4),
            "crp": round(crp, 4),
            "erp": round(total_erp, 4),
            "we": round(we, 4),
            "wd": round(wd, 4),
            "tax_rate": round(tax_rate, 4),
            "proofs": {
                "erp": step0_erp_proof,
                "ke": step1_ke_proof,
                "kd": step2_kd_proof,
                "wacc": step3_wacc_proof
            }
        }
