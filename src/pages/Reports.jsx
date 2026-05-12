import { useState, useMemo } from "react";
import { fmt, fmtShort } from "../utils/helpers";
import { STATUS_CONFIG } from "../data/initial";
import StatusBadge from "../components/StatusBadge";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function exportCSV(filename, rows, headers) {
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Shared Chart Bar ─────────────────────────────────────────────────────────
function BarChart({ data, labelKey, valueKey, formatValue, colors }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const defaultColors = ["#534AB7", "#0F6E56", "#993C1D", "#854F0B", "#185FA5", "#2563EB"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => (
        <div key={d[labelKey]}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 13, color: "#1A1918", fontWeight: 500 }}>{d[labelKey]}</span>
            <span style={{ fontSize: 12, color: "#6B6A65" }}>{formatValue ? formatValue(d[valueKey]) : d[valueKey]}</span>
          </div>
          <div style={{ height: 10, background: "#F3F2EE", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: (colors && colors[i]) || defaultColors[i % defaultColors.length], width: `${(d[valueKey] / max) * 100}%`, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function ReportSection({ title, onExport, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E4DF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1918" }}>{title}</div>
        <button onClick={onExport} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "5px 12px", borderRadius: 7, border: "1px solid #E5E4DF", background: "#fff", cursor: "pointer", color: "#6B6A65", fontFamily: "inherit", fontWeight: 500 }}>
          ↓ Export CSV
        </button>
      </div>
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Divider between chart and table ─────────────────────────────────────────
function Divider() {
  return <div style={{ borderTop: "1px solid #F3F2EE", margin: "20px 0" }} />;
}

// ─── Reports Page ─────────────────────────────────────────────────────────────
export default function Reports({ leads }) {

  // ── Pipeline by stage ──
  const stageData = useMemo(() => {
    const stages = ["New", "Contacted", "Active", "Proposal", "Won", "Lost"];
    return stages.map(s => ({
      stage: s,
      count: leads.filter(l => l.status === s).length,
      value: leads.filter(l => l.status === s).reduce((a, l) => a + l.value, 0),
    }));
  }, [leads]);

  // ── Leads by vendor ──
  const vendorData = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      if (!map[l.vendor]) map[l.vendor] = { vendor: l.vendor, count: 0, value: 0, won: 0 };
      map[l.vendor].count += 1;
      map[l.vendor].value += l.value;
      if (l.status === "Won") map[l.vendor].won += 1;
    });
    return Object.values(map)
      .map(v => ({ ...v, winRate: v.count > 0 ? Math.round((v.won / v.count) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  // ── Rep performance ──
  const repData = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      if (!map[l.rep]) map[l.rep] = { rep: l.rep, count: 0, value: 0, won: 0, lost: 0 };
      map[l.rep].count += 1;
      map[l.rep].value += l.value;
      if (l.status === "Won") map[l.rep].won += 1;
      if (l.status === "Lost") map[l.rep].lost += 1;
    });
    return Object.values(map)
      .map(r => ({ ...r, winRate: r.count > 0 ? Math.round((r.won / r.count) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  // ── Win/loss summary ──
  const winLossData = useMemo(() => {
    const total = leads.length;
    const won = leads.filter(l => l.status === "Won");
    const lost = leads.filter(l => l.status === "Lost");
    const active = leads.filter(l => !["Won","Lost"].includes(l.status));
    const wonValue = won.reduce((a, l) => a + l.value, 0);
    const lostValue = lost.reduce((a, l) => a + l.value, 0);
    const activeValue = active.reduce((a, l) => a + l.value, 0);
    return { total, won: won.length, lost: lost.length, active: active.length, wonValue, lostValue, activeValue, winRate: total > 0 ? Math.round((won.length / total) * 100) : 0 };
  }, [leads]);

  const thStyle = { padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6B6A65", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid #E5E4DF" };
  const tdStyle = { padding: "10px 12px", fontSize: 13, color: "#1A1918", borderBottom: "1px solid #F3F2EE" };
  const tdMuted = { ...tdStyle, color: "#6B6A65" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Pipeline by stage ── */}
      <ReportSection
        title="Pipeline by stage"
        onExport={() => exportCSV("pipeline-by-stage.csv", stageData, ["stage","count","value"])}
      >
        <BarChart data={stageData} labelKey="stage" valueKey="value" formatValue={fmtShort} />
        <Divider />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8F7F4" }}>
              <th style={thStyle}>Stage</th>
              <th style={thStyle}>Leads</th>
              <th style={thStyle}>Total value</th>
              <th style={thStyle}>% of pipeline</th>
            </tr>
          </thead>
          <tbody>
            {stageData.map(d => {
              const total = leads.reduce((a, l) => a + l.value, 0);
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <tr key={d.stage}>
                  <td style={tdStyle}><StatusBadge status={d.stage} /></td>
                  <td style={tdMuted}>{d.count}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(d.value)}</td>
                  <td style={tdMuted}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#F8F7F4", borderTop: "2px solid #E5E4DF" }}>
              <td style={{ ...tdStyle, fontWeight: 700 }}>Total</td>
              <td style={{ ...tdStyle, fontWeight: 700 }}>{leads.length}</td>
              <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(leads.reduce((a, l) => a + l.value, 0))}</td>
              <td style={tdStyle}>100%</td>
            </tr>
          </tfoot>
        </table>
      </ReportSection>

      {/* ── Leads by vendor ── */}
      <ReportSection
        title="Leads by vendor"
        onExport={() => exportCSV("leads-by-vendor.csv", vendorData, ["vendor","count","value","won","winRate"])}
      >
        <BarChart data={vendorData} labelKey="vendor" valueKey="value" formatValue={fmtShort} />
        <Divider />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8F7F4" }}>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Total leads</th>
              <th style={thStyle}>Total value</th>
              <th style={thStyle}>Won</th>
              <th style={thStyle}>Win rate</th>
            </tr>
          </thead>
          <tbody>
            {vendorData.map(d => (
              <tr key={d.vendor}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{d.vendor}</td>
                <td style={tdMuted}>{d.count}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(d.value)}</td>
                <td style={tdMuted}>{d.won}</td>
                <td style={tdMuted}>{d.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>

      {/* ── Rep performance ── */}
      <ReportSection
        title="Rep performance"
        onExport={() => exportCSV("rep-performance.csv", repData, ["rep","count","value","won","lost","winRate"])}
      >
        <BarChart data={repData} labelKey="rep" valueKey="value" formatValue={fmtShort} />
        <Divider />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8F7F4" }}>
              <th style={thStyle}>Rep</th>
              <th style={thStyle}>Total leads</th>
              <th style={thStyle}>Pipeline value</th>
              <th style={thStyle}>Won</th>
              <th style={thStyle}>Lost</th>
              <th style={thStyle}>Win rate</th>
            </tr>
          </thead>
          <tbody>
            {repData.map(d => (
              <tr key={d.rep}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{d.rep}</td>
                <td style={tdMuted}>{d.count}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(d.value)}</td>
                <td style={tdMuted}>{d.won}</td>
                <td style={tdMuted}>{d.lost}</td>
                <td style={tdMuted}>{d.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>

      {/* ── Win/loss summary ── */}
      <ReportSection
        title="Win / loss summary"
        onExport={() => exportCSV("win-loss-summary.csv",
          [{ status: "Won", count: winLossData.won, value: winLossData.wonValue },
           { status: "Lost", count: winLossData.lost, value: winLossData.lostValue },
           { status: "Active", count: winLossData.active, value: winLossData.activeValue }],
          ["status","count","value"]
        )}
      >
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total leads", value: winLossData.total, color: "#534AB7" },
            { label: "Won", value: winLossData.won, color: "#166534" },
            { label: "Lost", value: winLossData.lost, color: "#991B1B" },
            { label: "In progress", value: winLossData.active, color: "#854F0B" },
            { label: "Win rate", value: `${winLossData.winRate}%`, color: "#0F6E56" },
          ].map(c => (
            <div key={c.label} style={{ background: "#F8F7F4", borderRadius: 10, padding: "14px 16px", borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontSize: 11, color: "#6B6A65", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1A1918" }}>{c.value}</div>
            </div>
          ))}
        </div>
        <Divider />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8F7F4" }}>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Count</th>
              <th style={thStyle}>Total value</th>
              <th style={thStyle}>% of leads</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Won", count: winLossData.won, value: winLossData.wonValue },
              { label: "Lost", count: winLossData.lost, value: winLossData.lostValue },
              { label: "In progress", count: winLossData.active, value: winLossData.activeValue },
            ].map(d => (
              <tr key={d.label}>
                <td style={tdStyle}><StatusBadge status={d.label === "In progress" ? "Active" : d.label} /></td>
                <td style={tdMuted}>{d.count}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(d.value)}</td>
                <td style={tdMuted}>{winLossData.total > 0 ? Math.round((d.count / winLossData.total) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>

    </div>
  );
}