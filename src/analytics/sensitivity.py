"""
2D Sensitivity Analysis Engine.
Computes DCF share price matrices across varying WACC and Terminal Growth (g) rates.
"""

from typing import Dict, List, Any
import pandas as pd
import numpy as np


class SensitivityMatrix:
    """Generates 2D sensitivity grids for DCF valuation parameters."""

    @staticmethod
    def calculate_wacc_vs_g_matrix(
        base_wacc: float,
        base_terminal_g: float,
        last_fcff: float,
        total_pv_explicit: float,
        cash: float,
        debt: float,
        minority_interest: float,
        shares_outstanding: float,
        wacc_steps: Optional[List[float]] = None,
        g_steps: Optional[List[float]] = None
    ) -> pd.DataFrame:
        """
        Creates a 5x5 sensitivity table of DCF Fair Value per share.
        Rows: Terminal Growth (g)
        Columns: WACC
        """
        if wacc_steps is None:
            w_offsets = [-0.010, -0.005, 0.0, 0.005, 0.010]
            wacc_steps = [round(base_wacc + off, 4) for off in w_offsets]

        if g_steps is None:
            g_offsets = [-0.010, -0.005, 0.0, 0.005, 0.010]
            g_steps = [round(base_terminal_g + off, 4) for off in g_offsets]

        matrix_data = {}
        for w in wacc_steps:
            col_name = f"WACC {w*100:.2f}%"
            matrix_data[col_name] = []

            for g in g_steps:
                if g >= w:
                    # Boundary violation
                    matrix_data[col_name].append("N/A (g ≥ WACC)")
                else:
                    denom = w - g
                    tv = (last_fcff * (1.0 + g)) / denom
                    pv_tv = tv / ((1.0 + w) ** 10)
                    ev = total_pv_explicit + pv_tv
                    equity = ev + cash - debt - minority_interest
                    price = max(0.0, (equity * 1000.0) / shares_outstanding)
                    matrix_data[col_name].append(f"IDR {price:,.0f}")

        row_index = [f"g = {g*100:.2f}%" for g in g_steps]
        df_matrix = pd.DataFrame(matrix_data, index=row_index)
        return df_matrix
