"""
Live Market Price Service with IDX Session-Aware Caching.
Integrates with Yahoo Finance fast_info for authentic real-time market data.
"""

from typing import Dict, Any, List, Optional
import time
from datetime import datetime
import logging
import yfinance as yf

from src.data.market_clock import IDXMarketClock

logger = logging.getLogger("market_stream")

class LiveMarketPriceService:
    """
    Service for retrieving authentic market prices and quotes for IDX equities.
    Maintains session-aware in-memory TTL caching:
      - During live trading: 20-second cache TTL to reflect real updates while staying within API limits.
      - When market is closed / on break: 300-second cache TTL to eliminate redundant network hits.
    """
    _cache: Dict[str, Dict[str, Any]] = {}
    _cache_time: Dict[str, float] = {}

    # Configurable TTLs in seconds
    TTL_OPEN = 20.0
    TTL_CLOSED = 300.0

    @classmethod
    def normalize_ticker(cls, ticker: str) -> str:
        """Ensures IDX tickers end with .JK."""
        ticker = (ticker or "").strip().upper()
        if not ticker:
            return ""
        if not ticker.endswith(".JK") and not "." in ticker:
            return f"{ticker}.JK"
        return ticker

    @classmethod
    def get_ttl(cls, clock_status: Optional[Dict[str, Any]] = None) -> float:
        clock = clock_status or IDXMarketClock.get_status()
        return cls.TTL_OPEN if clock.get("is_open", False) else cls.TTL_CLOSED

    @classmethod
    def clear_cache(cls) -> None:
        """Clears the in-memory quote cache (useful for testing)."""
        cls._cache.clear()
        cls._cache_time.clear()

    @classmethod
    def get_quote(cls, ticker: str, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Retrieves real-time quote for a single ticker.
        Returns quote dictionary with price, change, day range, and market clock.
        """
        norm_ticker = cls.normalize_ticker(ticker)
        if not norm_ticker:
            return {"error": "Ticker symbol is required", "status": "ERROR"}

        clock = IDXMarketClock.get_status()
        ttl = cls.get_ttl(clock)
        now = time.time()

        # Check in-memory cache
        if not force_refresh and norm_ticker in cls._cache:
            last_fetch = cls._cache_time.get(norm_ticker, 0.0)
            if (now - last_fetch) < ttl:
                cached = dict(cls._cache[norm_ticker])
                cached["market_clock"] = clock
                cached["cached"] = True
                return cached

        # Fetch fresh data from Yahoo Finance
        try:
            t = yf.Ticker(norm_ticker)
            fast = getattr(t, "fast_info", None)
            
            price = None
            prev_close = None
            open_price = None
            day_high = None
            day_low = None
            market_cap = None
            shares = None

            if fast is not None:
                # fast_info can be dictionary-like or object-like depending on yfinance version
                def _get_val(k):
                    if hasattr(fast, k):
                        return getattr(fast, k)
                    if isinstance(fast, dict):
                        return fast.get(k)
                    try:
                        return fast[k]
                    except Exception:
                        return None

                price = _get_val("last_price")
                prev_close = _get_val("previous_close") or _get_val("regular_market_previous_close")
                open_price = _get_val("open")
                day_high = _get_val("day_high")
                day_low = _get_val("day_low")
                market_cap = _get_val("market_cap")
                shares = _get_val("shares")

            # Fallback if fast_info yielded nothing
            if price is None or price <= 0:
                # Try info dict as fallback
                info = getattr(t, "info", {}) or {}
                price = info.get("currentPrice") or info.get("regularMarketPrice") or prev_close
                if prev_close is None:
                    prev_close = info.get("regularMarketPreviousClose") or price
                if open_price is None:
                    open_price = info.get("regularMarketOpen") or price
                if day_high is None:
                    day_high = info.get("regularMarketDayHigh") or price
                if day_low is None:
                    day_low = info.get("regularMarketDayLow") or price
                if market_cap is None:
                    market_cap = info.get("marketCap")

            price = float(price or 0.0)
            prev_close = float(prev_close or price)
            open_price = float(open_price or price)
            day_high = float(day_high or price)
            day_low = float(day_low or price)

            change_idr = round(price - prev_close, 2)
            change_pct = round((change_idr / prev_close * 100), 2) if prev_close > 0 else 0.0

            quote = {
                "ticker": norm_ticker,
                "symbol": norm_ticker.replace(".JK", ""),
                "price": price,
                "previous_close": prev_close,
                "open": open_price,
                "day_high": day_high,
                "day_low": day_low,
                "change_idr": change_idr,
                "change_pct": change_pct,
                "market_cap": float(market_cap or 0.0),
                "market_cap_trillion": round(float(market_cap or 0.0) / 1e12, 2) if market_cap else 0.0,
                "shares_outstanding": int(shares) if shares else None,
                "currency": "IDR",
                "market_clock": clock,
                "timestamp": now,
                "cached": False,
                "status": "OK"
            }

            cls._cache[norm_ticker] = quote
            cls._cache_time[norm_ticker] = now
            return quote

        except Exception as exc:
            logger.warning(f"Error fetching live quote for {norm_ticker}: {exc}")
            # If we had an older cached quote, return it with error note
            if norm_ticker in cls._cache:
                fallback = dict(cls._cache[norm_ticker])
                fallback["market_clock"] = clock
                fallback["warning"] = str(exc)
                return fallback

            return {
                "ticker": norm_ticker,
                "symbol": norm_ticker.replace(".JK", ""),
                "price": 0.0,
                "previous_close": 0.0,
                "change_idr": 0.0,
                "change_pct": 0.0,
                "error": str(exc),
                "market_clock": clock,
                "status": "ERROR"
            }

    @classmethod
    def get_quotes(cls, tickers: List[str], force_refresh: bool = False) -> Dict[str, Any]:
        """
        Retrieves live quotes for multiple tickers.
        """
        results = {}
        for ticker in tickers:
            norm = cls.normalize_ticker(ticker)
            if norm:
                results[norm] = cls.get_quote(norm, force_refresh=force_refresh)
        return {
            "quotes": results,
            "market_clock": IDXMarketClock.get_status(),
            "count": len(results)
        }
