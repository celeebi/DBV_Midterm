import os

path = os.path.join("src", "data", "loader.py")
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

target = """        symbol = ticker_symbol.strip().upper()
        if not symbol.endswith(".JK") and "." not in symbol:
            symbol = f"{symbol}.JK\""""

replacement = """        symbol = ticker_symbol.strip().upper()
        if not symbol.endswith(".JK") and "." not in symbol:
            symbol = f"{symbol}.JK"

        clean_ticker = symbol.replace(".JK", "").strip()
        if is_banking_or_financial(clean_ticker):
            raise UnsupportedFinancialInstitutionError(symbol)"""

# Normalize \r\n
text_norm = text.replace("\r\n", "\n")
target_norm = target.replace("\r\n", "\n")
replacement_norm = replacement.replace("\r\n", "\n")

if target_norm in text_norm:
    text_norm = text_norm.replace(target_norm, replacement_norm, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text_norm.replace("\n", "\r\n"))
    print("[+] Added banking guard to src/data/loader.py")
else:
    print("[!] Target not found in src/data/loader.py")
