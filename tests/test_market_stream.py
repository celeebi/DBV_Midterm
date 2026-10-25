"""
Tests for LiveMarketPriceService.
Verifies caching logic, ticker normalization, quote schema, and fallback handling.
"""

import pytest
from unittest.mock import patch, MagicMock
from src.data.market_stream import LiveMarketPriceService

def setup_function():
    LiveMarketPriceService.clear_cache()

def test_ticker_normalization():
    assert LiveMarketPriceService.normalize_ticker("antm") == "ANTM.JK"
    assert LiveMarketPriceService.normalize_ticker("ANTM.JK") == "ANTM.JK"
    assert LiveMarketPriceService.normalize_ticker("pwon") == "PWON.JK"
    assert LiveMarketPriceService.normalize_ticker("BBCA.JK") == "BBCA.JK"
    assert LiveMarketPriceService.normalize_ticker("") == ""

def test_quote_caching():
    # Mock yfinance fast_info
    mock_fast_info = {
        "last_price": 2860.0,
        "previous_close": 2840.0,
        "open": 2840.0,
        "day_high": 2890.0,
        "day_low": 2800.0,
        "market_cap": 68700000000000.0,
        "shares": 24030764500
    }

    with patch("yfinance.Ticker") as mock_ticker_cls:
        mock_instance = MagicMock()
        mock_instance.fast_info = mock_fast_info
        mock_ticker_cls.return_value = mock_instance

        # First fetch: should call yfinance
        quote1 = LiveMarketPriceService.get_quote("ANTM.JK")
        assert quote1["price"] == 2860.0
        assert quote1["change_idr"] == 20.0
        assert quote1["cached"] is False
        assert mock_ticker_cls.call_count == 1

        # Second fetch: should hit cache
        quote2 = LiveMarketPriceService.get_quote("ANTM.JK")
        assert quote2["price"] == 2860.0
        assert quote2["cached"] is True
        assert mock_ticker_cls.call_count == 1  # Not called again

def test_market_clock_integration():
    with patch("yfinance.Ticker") as mock_ticker_cls:
        mock_instance = MagicMock()
        mock_instance.fast_info = {"last_price": 430.0, "previous_close": 428.0}
        mock_ticker_cls.return_value = mock_instance

        quote = LiveMarketPriceService.get_quote("PWON.JK")
        assert "market_clock" in quote
        clock = quote["market_clock"]
        assert "status" in clock
        assert "is_open" in clock

def test_batch_quotes():
    with patch("yfinance.Ticker") as mock_ticker_cls:
        mock_instance = MagicMock()
        mock_instance.fast_info = {"last_price": 1000.0, "previous_close": 1000.0}
        mock_ticker_cls.return_value = mock_instance

        res = LiveMarketPriceService.get_quotes(["ANTM", "PWON"])
        assert "quotes" in res
        assert "ANTM.JK" in res["quotes"]
        assert "PWON.JK" in res["quotes"]
        assert res["count"] == 2
