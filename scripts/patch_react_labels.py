import os

path = os.path.join("static", "app_react.jsx")
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update Inventory labels
text = text.replace("Property Inventories (Real Estate)", "Inventories")
text = text.replace("(-/+) Change in Property Inventories", "(-/+) Change in Inventories")

# 2. Update Landbank labels
text = text.replace("Investment Properties & Landbank", "Other Non-Current / Operating Assets")
text = text.replace("(-) Investment Properties & Landbank Expansion", "(-) Strategic Long-Term & Capital Investments")
text = text.replace("Other Non-Current Assets & Landbank", "Other Non-Current Assets")

# 3. Add minority interest row to histBsRows
old_hist_equity = """                    <tr>
                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Equity & Reserves</td>
                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_equity?.toFixed(2)}</td>)}
                    </tr>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">TOTAL SHAREHOLDERS' EQUITY</td>"""

new_hist_equity = """                    <tr>
                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Equity & Reserves</td>
                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_equity?.toFixed(2)}</td>)}
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Non-Controlling / Minority Interest</td>
                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{(r.minority_interest ?? 0).toFixed(2)}</td>)}
                    </tr>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">TOTAL SHAREHOLDERS' EQUITY</td>"""

if old_hist_equity in text:
    text = text.replace(old_hist_equity, new_hist_equity, 1)
    print("[+] Added minority interest to historical balance sheet table")
else:
    print("[!] Warning: old_hist_equity block not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("[OK] static/app_react.jsx updated successfully")
