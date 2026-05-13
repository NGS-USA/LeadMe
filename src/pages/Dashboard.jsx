import { useMemo } from "react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Leads from "./Leads";
import { fmt, fmtShort, isOverdue } from "../utils/helpers";
import { STATUS_CONFIG } from "../data/initial";

function RepChart({ leads }) {
  const repData = useMemo(() => {
    const map = {};
    leads.forEach(l => { if (!map[l.rep]) map[l.rep] = { total: 0, count: 0 }; map[l.rep].total += l.value; map[l.rep].count += 1; });
    return Object.entries(map).map(([rep, d]) => ({ rep, ...d })).sort((a, b) => b.total - a.total);
  }, [leads]);
  const max = Math.max(...repData.map(r => r.total), 1);
  const colors = ["#534AB7", "#0F6E56", "#993C1D", "#854F0B", "#185FA5"];
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1918", marginBottom: 18 }}>Rep pipeline value</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {repData.map((r, i) => (
          <div key={r.rep}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: "#1A1918", fontWeight: 500 }}>{r.rep}</span>
              <span style={{ fontSize: 12, color: "#6B6A65" }}>{fmtShort(r.total)} · {r.count} leads</span>
            </div>
            <div style={{ height: 8, background: "#F3F2EE", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: colors[i % colors.length], width: `${(r.total / max) * 100}%`, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineStages({ leads }) {
  const stages = ["New", "Contacted", "Active", "Proposal", "Won", "Lost"];
  const data = stages.map(s => ({
    status: s,
    count: leads.filter(l => l.status === s).length,
    value: leads.filter(l => l.status === s).reduce((a, l) => a + l.value, 0),
  }));
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1918", marginBottom: 16 }}>Pipeline by stage</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map(d => (
          <div key={d.status} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge status={d.status} />
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: "#6B6A65", minWidth: 60, textAlign: "right" }}>{d.count} lead{d.count !== 1 ? "s" : ""}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1918", minWidth: 80, textAlign: "right" }}>{fmtShort(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ leads, onSelectLead }) {
  const totalValue = leads.reduce((a, l) => a + l.value, 0);
  const activeLeads = leads.filter(l => !["Won","Lost"].includes(l.status));
  const wonLeads = leads.filter(l => l.status === "Won");
  const wonValue = wonLeads.reduce((a, l) => a + l.value, 0);
  const overdueCount = leads.filter(l => isOverdue(l.followUpDate)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <StatCard label="Total pipeline" value={fmtShort(totalValue)} sub={`${leads.length} total leads`} accent="#534AB7" />
        <StatCard label="Active leads" value={activeLeads.length} sub="Not yet closed" accent="#0F6E56" />
        <StatCard label="Won value" value={fmtShort(wonValue)} sub={`${wonLeads.length} deals closed`} accent="#166534" />
        <StatCard label="Follow-ups due" value={overdueCount} sub="Overdue or due today" accent="#991B1B" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <RepChart leads={leads} />
        <PipelineStages leads={leads} />
      </div>
      <Leads leads={leads} onSelectLead={onSelectLead} />
    </div>
  );
}