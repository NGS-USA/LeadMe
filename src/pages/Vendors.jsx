import { useState } from "react";
import VendorDetail from "./VendorDetail";
import { fmtShort, today, getNextId } from "../utils/helpers";

export default function Vendors({ vendors, leads, onAddVendor, onUpdateVendor, allReps, onUpdateVendorReps, onDeleteVendor, onDeleteRep, onAddRep, isAdmin }) {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");

  const handleAdd = () => {
    const name = newVendorName.trim();
    if (!name) return;
    onAddVendor(name);
    setNewVendorName("");
    setShowAddForm(false);
  };

  const vendorStats = vendors.map(v => {
    const vLeads = leads.filter(l => l.vendor === v.name);
    const won = vLeads.filter(l => l.status === "Won");
    return { ...v, leadCount: vLeads.length, totalValue: vLeads.reduce((a, l) => a + l.value, 0), wonCount: won.length, winRate: vLeads.length > 0 ? Math.round((won.length / vLeads.length) * 100) : 0 };
  });

  if (selectedVendor) return (
    <VendorDetail
      vendor={selectedVendor}
      leads={leads}
      onBack={() => setSelectedVendor(null)}
      onUpdateVendor={(updated) => { onUpdateVendor(updated); setSelectedVendor(updated); }}
      allReps={allReps}
      onUpdateVendorReps={onUpdateVendorReps}
      onDelete={onDeleteVendor}
      onDeleteRep={onDeleteRep}
      onAddRep={onAddRep}
      isAdmin={isAdmin}
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {showAddForm ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input autoFocus value={newVendorName} onChange={e => setNewVendorName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAddForm(false); }}
              placeholder="Vendor name…"
              style={{ fontSize: 13, padding: "7px 12px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", width: 200 }} />
            <button onClick={handleAdd} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
            <button onClick={() => setShowAddForm(false)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#534AB7", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>+ Add Vendor</button>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8F7F4", borderBottom: "1px solid #E5E4DF" }}>
              {["Vendor","Status","Total leads","Total value","Won","Win rate","Partner since"].map(h => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6B6A65", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendorStats.map((v, i) => (
              <tr key={v.id} onClick={() => setSelectedVendor(v)}
                style={{ borderBottom: "1px solid #F3F2EE", background: i % 2 === 0 ? "#fff" : "#FAFAF8", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F3F2EE"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFAF8"}>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1A1918" }}>{v.name}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: v.status === "Active" ? "#0F6E56" : "#6B7280", background: v.status === "Active" ? "#E1F5EE" : "#F3F4F6" }}>{v.status}</span>
                </td>
                <td style={{ padding: "12px 14px", color: "#1A1918" }}>{v.leadCount}</td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "#1A1918" }}>{fmtShort(v.totalValue)}</td>
                <td style={{ padding: "12px 14px", color: "#1A1918" }}>{v.wonCount}</td>
                <td style={{ padding: "12px 14px", color: "#1A1918" }}>{v.winRate}%</td>
                <td style={{ padding: "12px 14px", color: "#9CA3AF" }}>{v.joinedDate}</td>
              </tr>
            ))}
            {vendorStats.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>No vendors yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}