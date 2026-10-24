import os

file_path = os.path.join("static", "app_react.jsx")
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

text_norm = text.replace("\r\n", "\n")

# 1. Add Scope Badge in top bar
target_btn = """        {/* Top Action Buttons (Inspector, Excel, Command Search) */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setInspectorOpen(true)}"""

replacement_btn = """        {/* Top Action Buttons (Scope, Inspector, Excel, Command Search) */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setBankingNotice({ ticker: 'SCOPE_OVERVIEW', isScopeOverview: true })}
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 rounded-xs text-[11px] font-mono text-amber-300 transition cursor-pointer shadow-2xs"
            title="Click to view methodology scope limitation & why commercial banks are excluded"
          >
            <Icon name="ShieldAlert" size={13} className="text-amber-400" />
            <span>NON-FINANCIAL SCOPE</span>
          </button>

          <button
            onClick={() => setInspectorOpen(true)}"""

if target_btn in text_norm:
    text_norm = text_norm.replace(target_btn, replacement_btn, 1)
    print("[+] Added NON-FINANCIAL SCOPE button in header")
else:
    print("[!] target_btn not found")

# 2. Render BankingLimitationModal in main
target_toast = """          {/* Toast Alert */}
          {toastMessage && ("""

replacement_toast = """          {/* Banking Limitation Modal */}
          {bankingNotice && (
            <BankingLimitationModal
              notice={bankingNotice}
              onClose={() => setBankingNotice(null)}
              onSelectAlternative={(sym) => {
                setBankingNotice(null);
                handleLoadCustomTicker(sym);
              }}
            />
          )}

          {/* Toast Alert */}
          {toastMessage && ("""

if target_toast in text_norm:
    text_norm = text_norm.replace(target_toast, replacement_toast, 1)
    print("[+] Rendered BankingLimitationModal in viewport")
else:
    print("[!] target_toast not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text_norm.replace("\n", "\r\n"))

print("[OK] Finished React patching")
