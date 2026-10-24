from unittest.mock import patch
from starlette.testclient import TestClient
from server import app
from src.data.news_service import (
    InstitutionalNewsService,
    classify_headline_sentiment,
    DEFAULT_FALLBACK_HEADLINES,
)

client = TestClient(app)


def test_classify_headline_sentiment():
    assert classify_headline_sentiment("IHSG Menguat 4 Hari Beruntun, Laba Emiten Melonjak") == "BULLISH"
    assert classify_headline_sentiment("Saham Terkoreksi Dalam, IHSG Melemah dan Anjlok") == "BEARISH"
    assert classify_headline_sentiment("Bank Indonesia Gelar Rapat Dewan Gubernur Pekan Ini") == "NEUTRAL"
    assert classify_headline_sentiment("") == "NEUTRAL"


def test_news_service_live_or_fallback_structure():
    service = InstitutionalNewsService(cache_ttl=600)
    headlines = service.fetch_macro_headlines(limit=5)
    assert isinstance(headlines, list)
    assert len(headlines) > 0
    first = headlines[0]
    assert "headline" in first
    assert "sentiment" in first
    assert first["sentiment"] in ("BULLISH", "BEARISH", "NEUTRAL")
    assert "source" in first
    assert "link" in first


def test_news_service_ttl_cache_and_fallback():
    service = InstitutionalNewsService(cache_ttl=600)
    # Seed cache manually
    sample = [{"id": 1, "headline": "Cached Macro Wire", "sentiment": "BULLISH", "source": "TEST", "link": "https://bi.go.id"}]
    service._cache = sample
    import time
    service._last_fetch = time.time()

    # Should return cached item without network call
    res = service.fetch_macro_headlines(limit=5, force_refresh=False)
    assert res == sample

    # If network fails on force_refresh, should gracefully return cached or fallback
    with patch("urllib.request.urlopen", side_effect=OSError("Network unreachable")):
        service._cache = None
        fallback_res = service.fetch_macro_headlines(limit=3, force_refresh=True)
        assert fallback_res == DEFAULT_FALLBACK_HEADLINES[:3]


def test_api_news_endpoint():
    res = client.get("/api/news")
    assert res.status_code == 200
    payload = res.json()
    assert payload["status"] == "success"
    assert payload["count"] > 0
    assert isinstance(payload["data"], list)
    assert "headline" in payload["data"][0]
    assert "link" in payload["data"][0]
    assert payload["data"][0]["sentiment"] in ("BULLISH", "BEARISH", "NEUTRAL")
