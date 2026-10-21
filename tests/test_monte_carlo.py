import time
import pytest
from src.models.monte_carlo import MonteCarloEngine


def test_monte_carlo_runs_and_seed_reproducibility():
    """Verifies that 10,000 vectorized simulations run fast and yield deterministic results with seed."""
    t0 = time.perf_counter()
    res1 = MonteCarloEngine.run_simulation(num_simulations=10000, seed=42)
    elapsed = time.perf_counter() - t0

    assert elapsed < 0.5, f"Vectorized simulation took too long: {elapsed:.2f}s"
    assert res1["simulations_count"] == 10000

    res2 = MonteCarloEngine.run_simulation(num_simulations=10000, seed=42)
    assert res1["mean"] == res2["mean"]
    assert res1["median"] == res2["median"]
    assert res1["p10"] == res2["p10"]
    assert res1["p90"] == res2["p90"]


def test_percentiles_monotonicity():
    """Verifies that percentiles are strictly monotonic."""
    res = MonteCarloEngine.run_simulation(num_simulations=5000, seed=123)
    p10 = res["p10"]
    p25 = res["p25"]
    p50 = res["p50"]
    p75 = res["p75"]
    p90 = res["p90"]

    assert p10 <= p25 <= p50 <= p75 <= p90
    assert res["min"] <= p10
    assert res["max"] >= p90


def test_histogram_sums_to_n():
    """Verifies that the histogram bin counts sum exactly to the number of simulations."""
    res = MonteCarloEngine.run_simulation(num_simulations=2000, num_bins=20, seed=99)
    hist = res["histogram"]
    assert len(hist) == 20

    total_count = sum(b["count"] for b in hist)
    assert total_count == 2000

    total_pct = sum(b["pct"] for b in hist)
    assert abs(total_pct - 100.0) < 0.5


def test_probability_undervaluation_and_var():
    """Verifies probability of undervaluation and 95% Value at Risk."""
    # When market price is 200 and median target is ~500, probability of undervaluation should be high
    res = MonteCarloEngine.run_simulation(num_simulations=3000, current_market_price=200.0, seed=42)
    assert res["probability_undervalued_pct"] > 70.0
    assert "var_95_amount" in res
    assert "var_95_pct" in res
