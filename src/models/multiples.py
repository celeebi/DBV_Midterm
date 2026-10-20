"""
Relative Valuation (Peer Multiples) Model.
Computes benchmark multiples (EV/EBITDA, P/E, P/B), filters outliers,
and calculates implied equity share prices.
"""

from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd


class RelativeValuationModel:
    """Computes peer multiples and implies company share price."""

    # Pre-configured baseline peer multiples for IDX Automotive / Conglomerates
    DEFAULT_IDX_PEERS: List[Dict[str, Any]] = [
        {"name": "United Tractors", "ticker": "UNTR.JK", "ev_ebitda": 2.9, "pe": 4.8, "pb": 0.95, "roe": 21.8},
        {"name": "Astra Otoparts", "ticker": "AUTO.JK", "ev_ebitda": 3.8, "pe": 5.4, "pb": 0.72, "roe": 14.1},
        {"name": "Indomobil Sukses", "ticker": "IMAS.JK", "ev_ebitda": 6.5, "pe": 14.2, "pb": 0.65, "roe": 4.8},
        {"name": "Selamat Sempurna", "ticker": "SMSM.JK", "ev_ebitda": 7.8, "pe": 11.2, "pb": 2.80, "roe": 24.5},
        {"name": "Dharma Polimetal", "ticker": "DRMA.JK", "ev_ebitda": 5.2, "pe": 8.1, "pb": 1.65, "roe": 18.2}
    ]

    @staticmethod
    def calculate_comps(
        peers_data: Optional[List[Dict[str, Any]]] = None,
        target_ebitda: float = 58.5,  # Rp T
        target_net_income: float = 31.2,  # Rp T
        target_equity: float = 241.6,  # Rp T
        shares_outstanding: float = 40.48,  # Billions
        cash: float = 64.9,
        debt: float = 58.2,
        minority_interest: float = 10.5,
        stat_method: str = "median",  # 'median', '25th', 'harmonic_mean'
        filter_outliers: bool = True
    ) -> Dict[str, Any]:
        """
        Computes benchmark peer multiples and implies target share price.
        """
        peers = peers_data if peers_data is not None else RelativeValuationModel.DEFAULT_IDX_PEERS
        df_peers = pd.DataFrame(peers)

        ev_ebitda_list = []
        pe_list = []
        pb_list = []

        for p in peers:
            ev_eb = float(p.get("ev_ebitda", 0.0))
            pe = float(p.get("pe", 0.0))
            pb = float(p.get("pb", 0.0))

            if filter_outliers:
                if 1.0 <= ev_eb <= 25.0:
                    ev_ebitda_list.append(ev_eb)
                if 2.0 <= pe <= 35.0:
                    pe_list.append(pe)
                if 0.2 <= pb <= 8.0:
                    pb_list.append(pb)
            else:
                if ev_eb > 0: ev_ebitda_list.append(ev_eb)
                if pe > 0: pe_list.append(pe)
                if pb > 0: pb_list.append(pb)

        # Calculate statistics
        b_ev_ebitda = RelativeValuationModel._compute_stat(ev_ebitda_list, stat_method, default=4.5)
        b_pe = RelativeValuationModel._compute_stat(pe_list, stat_method, default=7.0)
        b_pb = RelativeValuationModel._compute_stat(pb_list, stat_method, default=1.1)

        # Implied Price from EV/EBITDA
        # Implied EV = Target EBITDA * Benchmark EV/EBITDA
        implied_ev = target_ebitda * b_ev_ebitda
        implied_equity_from_ev = implied_ev + cash - debt - minority_interest
        price_ev_ebitda = max(0.0, (implied_equity_from_ev * 1000.0) / shares_outstanding)

        # Implied Price from P/E
        # Implied Equity = Target Net Income * Benchmark P/E
        implied_equity_from_pe = target_net_income * b_pe
        price_pe = max(0.0, (implied_equity_from_pe * 1000.0) / shares_outstanding)

        # Implied Price from P/B
        implied_equity_from_pb = target_equity * b_pb
        price_pb = max(0.0, (implied_equity_from_pb * 1000.0) / shares_outstanding)

        # Primary composite peer price (60% EV/EBITDA + 40% P/E)
        comps_target_price = round((0.60 * price_ev_ebitda) + (0.40 * price_pe), 0)

        proof_comps = (
            f"EV/EBITDA Implied Price = (({target_ebitda:.1f}T EBITDA × {b_ev_ebitda:.2f}x) + "
            f"Cash {cash:.1f}T - Debt {debt:.1f}T - MI {minority_interest:.1f}T) / {shares_outstanding:.2f}B = IDR {price_ev_ebitda:,.0f} | "
            f"P/E Implied Price = ({target_net_income:.1f}T Net Income × {b_pe:.2f}x) / {shares_outstanding:.2f}B = IDR {price_pe:,.0f}"
        )

        return {
            "comps_target_price": comps_target_price,
            "price_ev_ebitda": round(price_ev_ebitda, 0),
            "price_pe": round(price_pe, 0),
            "price_pb": round(price_pb, 0),
            "benchmark_ev_ebitda": round(b_ev_ebitda, 2),
            "benchmark_pe": round(b_pe, 2),
            "benchmark_pb": round(b_pb, 2),
            "stat_method": stat_method,
            "peers_table": df_peers,
            "proof": proof_comps
        }

    @staticmethod
    def _compute_stat(vals: List[float], method: str, default: float) -> float:
        if not vals:
            return default
        arr = np.array(vals)
        if method == "25th":
            return float(np.percentile(arr, 25))
        elif method == "harmonic_mean":
            # Harmonic mean = n / sum(1/x)
            return float(len(arr) / np.sum(1.0 / arr))
        else:  # median
            return float(np.median(arr))
