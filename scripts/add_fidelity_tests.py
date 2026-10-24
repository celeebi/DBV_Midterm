import os

test_path = os.path.join("tests", "test_idx_adapter.py")
with open(test_path, "r", encoding="utf-8") as f:
    text = f.read()

old_block = """def test_antm_self_healing_synthesis_and_zero_balance():
    from src.data.adapters.idx_adapter import IDXAdapter
    antm = IDXAdapter.get_financials("ANTM")
    assert antm is not None
    assert antm["reporting_currency"] == "IDR"
    assert len(antm["historical"]["years"]) in (4, 5)
    for row in antm["historical_statements"]["balance_sheet"]:
        assert abs(row["balance_check"]) < 0.01, f"Year {row['year']} balance check failed: {row['balance_check']}" """

# Normalize CRLF
text_norm = text.replace("\r\n", "\n")

target = """def test_antm_self_healing_synthesis_and_zero_balance():
    from src.data.adapters.idx_adapter import IDXAdapter
    antm = IDXAdapter.get_financials("ANTM")
    assert antm is not None
    assert antm["reporting_currency"] == "IDR"
    assert len(antm["historical"]["years"]) in (4, 5)
    for row in antm["historical_statements"]["balance_sheet"]:
        assert abs(row["balance_check"]) < 0.01, f"Year {row['year']} balance check failed: {row['balance_check']}" """

replacement = """def test_antm_self_healing_synthesis_and_zero_balance():
    from src.data.adapters.idx_adapter import IDXAdapter
    antm = IDXAdapter.get_financials("ANTM")
    assert antm is not None
    assert antm["reporting_currency"] == "IDR"
    assert antm["historical"]["years"] == [2021, 2022, 2023, 2024, 2025]
    for row in antm["historical_statements"]["balance_sheet"]:
        assert abs(row["balance_check"]) < 0.01, f"Year {row['year']} balance check failed: {row['balance_check']}"

    # Verify authentic inventory and share capital normalization
    bs_2025 = [r for r in antm["historical_statements"]["balance_sheet"] if r["year"] == 2025][0]
    assert bs_2025["inventory"] > 5.0, f"Expected inventory > 5T, got {bs_2025['inventory']}"
    assert bs_2025["share_capital"] > 10.0, f"Expected share_capital > 10T, got {bs_2025['share_capital']}"


def test_akra_five_year_audited_statements_and_inventory():
    from src.data.adapters.idx_adapter import IDXAdapter
    akra = IDXAdapter.get_financials("AKRA")
    assert akra is not None
    assert akra["historical"]["years"] == [2021, 2022, 2023, 2024, 2025]
    for row in akra["historical_statements"]["balance_sheet"]:
        assert abs(row["balance_check"]) < 0.01, f"Year {row['year']} balance check failed: {row['balance_check']}"

    bs_2025 = [r for r in akra["historical_statements"]["balance_sheet"] if r["year"] == 2025][0]
    assert bs_2025["inventory"] > 4.0, f"Expected inventory > 4T, got {bs_2025['inventory']}"
    assert bs_2025["share_capital"] > 1.0, f"Expected share_capital > 1T, got {bs_2025['share_capital']}" """

# strip trailing space in target/replacement
target_clean = "\n".join([line.rstrip() for line in target.strip().split("\n")])
text_clean = "\n".join([line.rstrip() for line in text_norm.split("\n")])
replacement_clean = "\n".join([line.rstrip() for line in replacement.strip().split("\n")])

if target_clean in text_clean:
    text_clean = text_clean.replace(target_clean, replacement_clean, 1)
    with open(test_path, "w", encoding="utf-8") as f:
        f.write(text_clean.replace("\n", "\r\n"))
    print("Updated tests/test_idx_adapter.py successfully")
else:
    print("Target not found in tests/test_idx_adapter.py")
