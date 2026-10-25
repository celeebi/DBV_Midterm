"""
Tests for IDXMarketClock.
Verifies Jakarta timezone calculation and IDX session rules.
"""

from datetime import datetime
import pytest
from src.data.market_clock import IDXMarketClock, JAKARTA_TZ

def test_weekend_status():
    # 2026-10-25 is Sunday
    sunday = datetime(2026, 10, 25, 14, 0, 0, tzinfo=JAKARTA_TZ)
    status = IDXMarketClock.get_status(sunday)
    assert status["is_open"] is False
    assert status["status"] == "CLOSED"
    assert status["session"] == "WEEKEND"
    assert "Monday 09:00" in status["next_open"]

    # 2026-10-24 is Saturday
    saturday = datetime(2026, 10, 24, 10, 30, 0, tzinfo=JAKARTA_TZ)
    status_sat = IDXMarketClock.get_status(saturday)
    assert status_sat["is_open"] is False
    assert status_sat["session"] == "WEEKEND"

def test_weekday_session_1():
    # 2026-10-26 is Monday at 10:15 WIB
    mon_morning = datetime(2026, 10, 26, 10, 15, 0, tzinfo=JAKARTA_TZ)
    status = IDXMarketClock.get_status(mon_morning)
    assert status["is_open"] is True
    assert status["status"] == "OPEN"
    assert status["session"] == "SESSION_1"
    assert "Session 1" in status["label"]

def test_weekday_lunch_break():
    # Monday at 12:45 WIB
    mon_lunch = datetime(2026, 10, 26, 12, 45, 0, tzinfo=JAKARTA_TZ)
    status = IDXMarketClock.get_status(mon_lunch)
    assert status["is_open"] is False
    assert status["status"] == "BREAK"
    assert status["session"] == "MIDDAY_BREAK"

def test_weekday_session_2():
    # Monday at 14:15 WIB
    mon_afternoon = datetime(2026, 10, 26, 14, 15, 0, tzinfo=JAKARTA_TZ)
    status = IDXMarketClock.get_status(mon_afternoon)
    assert status["is_open"] is True
    assert status["status"] == "OPEN"
    assert status["session"] == "SESSION_2"

def test_weekday_post_trading():
    # Monday at 16:00 WIB
    mon_close = datetime(2026, 10, 26, 16, 0, 0, tzinfo=JAKARTA_TZ)
    status = IDXMarketClock.get_status(mon_close)
    assert status["is_open"] is False
    assert status["status"] == "CLOSING"

def test_weekday_after_hours():
    # Monday at 19:30 WIB
    mon_night = datetime(2026, 10, 26, 19, 30, 0, tzinfo=JAKARTA_TZ)
    status = IDXMarketClock.get_status(mon_night)
    assert status["is_open"] is False
    assert status["status"] == "CLOSED"
    assert status["session"] == "AFTER_HOURS"

def test_friday_schedule():
    # Friday 11:45 WIB (Friday prayer break)
    fri_break = datetime(2026, 10, 30, 11, 45, 0, tzinfo=JAKARTA_TZ)
    status_break = IDXMarketClock.get_status(fri_break)
    assert status_break["is_open"] is False
    assert status_break["status"] == "BREAK"
    assert "Friday" in status_break["label"]

    # Friday 14:30 WIB (Session 2 open)
    fri_s2 = datetime(2026, 10, 30, 14, 30, 0, tzinfo=JAKARTA_TZ)
    status_s2 = IDXMarketClock.get_status(fri_s2)
    assert status_s2["is_open"] is True
    assert status_s2["session"] == "SESSION_2"
