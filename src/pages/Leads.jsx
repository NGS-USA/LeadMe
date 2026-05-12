import { useState, useMemo } from "react";
import StatusBadge from "../components/StatusBadge";
import PriorityDot from "../components/PriorityDot";
import FollowUpBadge from "../components/FollowUpBadge";
import { STATUS_CONFIG } from "../data/initial";
import { fmt, isOverdue } from "../utils/helpers";

export default function Leads({ leads, onSelectLead }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRep, setFilterRep] = useState("All");
  const [sortCol, setSortCol] = useState("value");
  const [sortDir, setSortDir] = useState("desc");

  const reps = ["All", ...Array.from(new Set(leads.map(l => l.rep)))];
  const statuses = ["All", ...Object.keys(STATUS_CONFIG)];

  const filtered = useMemo(() => leads
    .filter(l =>
      (filterStatus === "All" || l.status === filterStatus) &&
      (filterRep === "All" || l.rep === filterRep) &&
      (search === "" || l.leadName.toLowerCase().includes(search.toLowerCase()) || l.vendor.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    }),
    [leads, search, filterStatus, filterRep, sortCol, sortDir]
  );

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const cols = [["leadName","Lead name"],["vendor","Vendor"],["rep","Rep"],["value","Value"],["status","Status"],["priority","Priority"],["followUpDate","Follow-up"]];

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E4DF", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 160px" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#9CA3AF", pointerEvents: "none" }}>🔍</span>
          <input placeholder="Search leads or vendors…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", paddingLeft: 28, fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: 13 }}>{statuses.map(s => <option key={s}>{s}</option>)}</select>
        <select value={filterRep} onChange={e => setFilterRep(e.target.value)} style={{ fontSize: 13 }}>{reps.map(r => <option key={r}>{r === "All" ? "All reps" : r.split(" ").slice(-1)[0]}</option>)}</select>
        <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: "auto" }}>{filtered.length} of {leads.length}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8F7F4", borderBottom: "1px solid #E5E4DF" }}>
              {cols.map(([col, label]) => (
                <th key={col} onClick={() => handleSort(col)} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6B6A65", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                  {label} {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id} onClick={() => onSelectLead(l)}
                style={{ borderBottom: "1px solid #F3F2EE", background: i % 2 === 0 ? "#fff" : "#FAFAF8", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F3F2EE"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFAF8"}>
                <td style={{ padding: "11px 14px", fontWeight: 500, color: "#1A1918", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.leadName}{isOverdue(l.followUpDate) && <FollowUpBadge />}
                </td>
                <td style={{ padding: "11px 14px", color: "#6B6A65", whiteSpace: "nowrap" }}>{l.vendor}</td>
                <td style={{ padding: "11px 14px", color: "#6B6A65", whiteSpace: "nowrap" }}>{l.rep.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ")}</td>
                <td style={{ padding: "11px 14px", fontWeight: 600, color: "#1A1918", whiteSpace: "nowrap" }}>{fmt(l.value)}</td>
                <td style={{ padding: "11px 14px" }}><StatusBadge status={l.status} /></td>
                <td style={{ padding: "11px 14px" }}><PriorityDot priority={l.priority} /></td>
                <td style={{ padding: "11px 14px", color: isOverdue(l.followUpDate) ? "#991B1B" : "#9CA3AF", fontWeight: isOverdue(l.followUpDate) ? 600 : 400, whiteSpace: "nowrap" }}>{l.followUpDate || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>No leads match your filters</td></tr>}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: "2px solid #E5E4DF", background: "#F8F7F4" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 12, color: "#1A1918" }} colSpan={3}>Total ({filtered.length} leads)</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1A1918" }}>{fmt(filtered.reduce((a, l) => a + l.value, 0))}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}