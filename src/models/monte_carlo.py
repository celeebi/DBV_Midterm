"""
Monte Carlo Probabilistic Valuation Simulation Engine.
Runs vectorized stochastic simulations across cost of capital (WACC), terminal growth rates,
revenue trajectories, and operating margins to generate probabilistic fair value distributions,
Value at Risk (VaR 95%), and confidence intervals.
"""

from typing import Dict, List, Any, Optional
import numpy as np


class MonteCarloEngine:
    """Vectorized Monte Carlo DCF Simulation Engine."""

    @staticmethod
    def run_simulation(
        base_revenue: float = 7110.0,
        shares_outstanding: float = 48.16,
        net_debt: float = 390.0,
        mean_wacc: float = 0.104,
        std_wacc: float = 0.008,
        mean_terminal_g: float = 0.015,
        std_terminal_g: float = 0.004,
        mean_rev_growth: float = 0.10,
        std_rev_growth: float = 0.025,
        mean_ebitda_margin: float = 0.50,
        std_ebitda_margin: float = 0.03,
        tax_rate: float = 0.22,
        da_percent_rev: float = 0.05,
        capex_percent_rev: float = 0.085,
        nwc_percent_rev: float = 0.04,
        num_simulations: int = 10000,
        current_market_price: float = 270.0,
        seed: Optional[int] = 42,
        num_bins: int = 25
    ) -> Dict[str, Any]:
        """
        Executes a vectorized N-iteration Monte Carlo DCF simulation.

        Returns percentiles (P10, P25, P50, P75, P90), statistical moments,
        Value at Risk (VaR), Probability of Undervaluation, and Histogram bins.
        """
        if seed is not None:
            rng = np.random.default_rng(seed)
        else:
            rng = np.random.default_rng()

        N = max(100, min(50000, num_simulations))

        # 1. Stochastic Parameter Sampling
        wacc_samples = rng.normal(mean_wacc, std_wacc, N)
        wacc_samples = np.clip(wacc_samples, 0.05, 0.20)

        # Terminal growth must be capped strictly below WACC
        t_g_samples = rng.normal(mean_terminal_g, std_terminal_g, N)
        t_g_samples = np.clip(t_g_samples, 0.005, wacc_samples - 0.008)

        # Operating margin sampling
        margin_samples = rng.normal(mean_ebitda_margin, std_ebitda_margin, N)
        margin_samples = np.clip(margin_samples, 0.15, 0.75)

        # Revenue growth CAGR sampling
        growth_samples = rng.normal(mean_rev_growth, std_rev_growth, N)
        growth_samples = np.clip(growth_samples, -0.05, 0.35)

        # 2. Vectorized 10-Year Cash Flow Projection
        # Years 1-5 grow at stochastic growth rate; Years 6-10 linearly fade to terminal growth
        pv_fcf_sum = np.zeros(N)
        rev = np.full(N, base_revenue)

        for yr in range(1, 11):
            if yr <= 5:
                g = growth_samples
            else:
                fade_weight = (yr - 5) / 5.0
                g = (1.0 - fade_weight) * growth_samples + fade_weight * t_g_samples

            rev = rev * (1.0 + g)
            ebitda = rev * margin_samples
            da = rev * da_percent_rev
            ebit = np.maximum(0.0, ebitda - da)
            taxes = ebit * tax_rate
            nopat = ebit - taxes
            capex = rev * capex_percent_rev
            nwc_change = rev * g * nwc_percent_rev
            fcff = nopat + da - capex - nwc_change

            discount_factor = (1.0 + wacc_samples) ** yr
            pv_fcf_sum += fcff / discount_factor

        # 3. Terminal Value Calculation (Gordon Growth Model)
        terminal_fcf = fcff * (1.0 + t_g_samples)
        denom = np.maximum(0.005, wacc_samples - t_g_samples)
        terminal_value = terminal_fcf / denom
        pv_terminal_value = terminal_value / ((1.0 + wacc_samples) ** 10)

        # 4. Enterprise-to-Equity Bridge & Per Share Value
        enterprise_value = pv_fcf_sum + pv_terminal_value
        equity_value = enterprise_value - net_debt
        share_prices = np.round((equity_value * 1e9) / (shares_outstanding * 1e9), 1)
        share_prices = np.clip(share_prices, 1.0, 5000.0)

        # 5. Statistical Moments & Key Percentiles
        p10 = float(np.percentile(share_prices, 10))
        p25 = float(np.percentile(share_prices, 25))
        p50 = float(np.percentile(share_prices, 50))  # Median
        p75 = float(np.percentile(share_prices, 75))
        p90 = float(np.percentile(share_prices, 90))
        mean_val = float(np.mean(share_prices))
        std_val = float(np.std(share_prices))
        min_val = float(np.min(share_prices))
        max_val = float(np.max(share_prices))

        # 6. Risk & Probability Metrics
        prob_undervalued = float(np.mean(share_prices > current_market_price) * 100.0)
        # 95% Value at Risk: maximum loss relative to market price with 95% confidence
        p05 = float(np.percentile(share_prices, 5))
        var_95_amount = max(0.0, current_market_price - p05)
        var_95_pct = round((var_95_amount / max(1.0, current_market_price)) * 100.0, 1)

        # 7. Histogram Bins Generation
        counts, bin_edges = np.histogram(share_prices, bins=num_bins)
        histogram = []
        for i in range(len(counts)):
            low_edge = round(float(bin_edges[i]), 1)
            high_edge = round(float(bin_edges[i + 1]), 1)
            cnt = int(counts[i])
            histogram.append({
                "range_label": f"IDR {int(low_edge)} - {int(high_edge)}",
                "bin_low": low_edge,
                "bin_high": high_edge,
                "bin_mid": round((low_edge + high_edge) / 2.0, 1),
                "count": cnt,
                "pct": round((cnt / N) * 100.0, 2)
            })

        return {
            "model": "Monte Carlo DCF Simulation",
            "simulations_count": N,
            "mean": round(mean_val, 1),
            "median": round(p50, 1),
            "std_dev": round(std_val, 1),
            "min": round(min_val, 1),
            "max": round(max_val, 1),
            "p10": round(p10, 1),
            "p25": round(p25, 1),
            "p50": round(p50, 1),
            "p75": round(p75, 1),
            "p90": round(p90, 1),
            "current_market_price": round(current_market_price, 1),
            "probability_undervalued_pct": round(prob_undervalued, 1),
            "var_95_amount": round(var_95_amount, 1),
            "var_95_pct": var_95_pct,
            "histogram": histogram
        }
