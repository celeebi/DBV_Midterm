"""
Tests for server market API endpoints:
  - GET /api/market/status
  - GET /api/market/quote
"""

import pytest
from starlette.testclient import TestClient
from server import app

client = TestClient(app)

def test_market_status_endpoint():
    response = client.get("/api/market/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "is_open" in data
    assert "session" in data
    assert "time_wib" in data

def test_market_quote_single():
    response = client.get("/api/market/quote?ticker=ANTM.JK")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "ANTM.JK"
    assert "price" in data
    assert "market_clock" in data
    assert data["status"] == "OK"

def test_market_quote_batch():
    response = client.get("/api/market/quote?tickers=ANTM.JK,PWON.JK")
    assert response.status_code == 200
    data = response.json()
    assert "quotes" in data
    assert "ANTM.JK" in data["quotes"]
    assert "PWON.JK" in data["quotes"]
    assert data["count"] == 2
