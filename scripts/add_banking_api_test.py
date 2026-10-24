import os

test_path = os.path.join("tests", "test_api_endpoints.py")
with open(test_path, "r", encoding="utf-8") as f:
    text = f.read()

new_test = """

def test_api_rejects_banking_tickers_with_clear_disclosure():
    \"\"\"Verify /api/company and /api/recalculate reject commercial banks with clear ALM disclosures.\"\"\"
    # 1. BBCA GET /api/company
    res1 = client.get("/api/company?ticker=BBCA.JK")
    assert res1.status_code == 400
    p1 = res1.json()
    assert p1["status"] == "error"
    assert p1["error_type"] == "banking_unsupported"
    assert "Asset-Liability Management" in p1["message"] or "ALM" in p1["message"]
    assert "recommended_alternatives" in p1
    assert any(a["ticker"] == "ASII.JK" for a in p1["recommended_alternatives"])

    # 2. BBRI without .JK suffix
    res2 = client.get("/api/company?ticker=BBRI")
    assert res2.status_code == 400
    p2 = res2.json()
    assert p2["error_type"] == "banking_unsupported"

    # 3. BMRI POST /api/recalculate
    res3 = client.post("/api/recalculate", json={"ticker": "BMRI.JK"})
    assert res3.status_code == 400
    p3 = res3.json()
    assert p3["error_type"] == "banking_unsupported"
    assert "Methodology Scope Limitation" in p3["message"]
"""

if "test_api_rejects_banking_tickers_with_clear_disclosure" not in text:
    text = text.rstrip() + new_test
    with open(test_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("[+] Added test_api_rejects_banking_tickers_with_clear_disclosure to tests/test_api_endpoints.py")
else:
    print("[i] Test already present")
