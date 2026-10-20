"""
Unit tests for ModelSanityChecker.
Verifies material error checking: g >= WACC, GDP ceiling, and EV-to-Equity reconciliation.
"""

import pytest
from src.rules.sanity_checks import ModelSanityChecker


def test_terminal_growth_fatal_when_ge_wacc():
    res = ModelSanityChecker.validate_terminal_growth(g=0.10, wacc=0.095)
    assert res["status"] == "fatal"
    assert res["code"] == "ERR_G_GE_WACC"
    assert "Fatal Material Error" in res["message"]


def test_terminal_growth_warning_when_gt_gdp():
    res = ModelSanityChecker.validate_terminal_growth(g=0.045, wacc=0.095, gdp_cap=0.040)
    assert res["status"] == "warning"
    assert res["code"] == "WARN_G_GT_GDP"


def test_terminal_growth_safe():
    res = ModelSanityChecker.validate_terminal_growth(g=0.015, wacc=0.0952, gdp_cap=0.040)
    assert res["status"] == "safe"
    assert res["code"] == "OK_G_VALID"


def test_ev_to_equity_bridge_reconciliation():
    ev = 200.0
    cash = 50.0
    debt = 40.0
    mi = 10.0
    equity = 200.0  # 200 + 50 - 40 - 10 = 200
    res = ModelSanityChecker.validate_ev_to_equity_bridge(ev, cash, debt, mi, equity)
    assert res["status"] == "safe"

    # Mismatch check
    bad_equity = 190.0
    bad_res = ModelSanityChecker.validate_ev_to_equity_bridge(ev, cash, debt, mi, bad_equity)
    assert bad_res["status"] == "fatal"
    assert "Material Error" in bad_res["message"]


def test_negative_multiples_detected():
    multiples = {"EV/EBITDA": 4.5, "P/E": -2.1, "P/B": 1.2}
    issues = ModelSanityChecker.validate_peer_multiples(multiples)
    assert len(issues) == 1
    assert issues[0]["metric"] == "P/E"
    assert issues[0]["code"] == "WARN_NEGATIVE_MULTIPLE"
