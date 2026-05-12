import { useState, useMemo } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_LEADS = [
  { id: 1, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "General Trade", value: 700000, status: "Active", priority: "High", receivedAt: "2025-04-01", lastContact: "2025-05-08" },
  { id: 2, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Dabos", value: 14000, status: "Proposal", priority: "Medium", receivedAt: "2025-04-10", lastContact: "2025-05-06" },
  { id: 3, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Capital Farm Credit", value: 1849.99, status: "Contacted", priority: "Low", receivedAt: "2025-04-15", lastContact: "2025-05-01" },
  { id: 4, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Omega International LLC", value: 1306.28, status: "New", priority: "Low", receivedAt: "2025-05-01", lastContact: null },
  { id: 5, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "SEMTech Solutions", value: 3200, status: "Won", priority: "Medium", receivedAt: "2025-03-20", lastContact: "2025-04-28" },
  { id: 6, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "U.S. Army", value: 40446, status: "Active", priority: "High", receivedAt: "2025-03-15", lastContact: "2025-05-09" },
  { id: 7, vendor: "3CX", rep: "Noorinder Brar", leadName: "The Sea Pines Resort", value: 3000, status: "Proposal", priority: "Medium", receivedAt: "2025-04-20", lastContact: "2025-05-07" },
  { id: 8, vendor: "SonicWall", rep: "Steve Massey", leadName: "Sonrisas Dentistry", value: 525.24, status: "Won", priority: "Low", receivedAt: "2025-03-10", lastContact: "2025-04-15" },
  { id: 9, vendor: "Zen Health", rep: "Ryan Kopiske", leadName: "Lifeworks NW", value: 0, status: "Lost", priority: "Low", receivedAt: "2025-02-28", lastContact: "2025-03-20" },
  { id: 10, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Pacific NW Logistics", value: 18500, status: "Active", priority: "High", receivedAt: "2025-04-25", lastContact: "2025-05-10" },
  { id: 11, vendor: "3CX", rep: "Noorinder Brar", leadName: "Cascade Dental Group", value: 8200, status: "Contacted", priority: "Medium", receivedAt: "2025-05-02", lastContact: "2025-05-05" },
  { id: 12, vendor: "SonicWall", rep: "Steve Massey", leadName: "Riverfront Hotel", value: 12400, status: "New", priority: "High", receivedAt: "2025-05-08", lastContact: null },
];

const STATUS_CONFIG = {
  New:       { color: "#6B7280", bg: "#F3F4F6", label: "New" },
  Contacted: { color: "#2563EB", bg: "#EFF6FF", label: "Contacted" },
  Active:    { color: "#0F6E56", bg: "#E1F5EE", label: "Active" },
  Proposal:  { color: "#854F0B", bg: "#FAEEDA", label: "Proposal" },
  Won:       { color: "#166534", bg: "#DCFCE7", label: "Won" },
  Lost:      { color: "#991B1B", bg: "#FEE2E2", label: "Lost" },
};

const PRIORITY_CONFIG = {
  High:   { color: "#991B1B", bg: "#FEE2E2" },
  Medium: { color: "#854F0B", bg: "#FAEEDA" },
  Low:    { color: "#374151", bg: "#F3F4F6" },
};

const NAV_ITEMS = [
  { id: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
  { id: "leads",     icon: "ti-list",             label: "Leads" },
  { id: "conversations", icon: "ti-messages",     label: "Conversations" },
  { id: "vendors",   icon: "ti-building",         label: "Vendors" },
  { id: "reports",   icon: "ti-chart-bar",        label: "Reports" },
  { id: "settings",  icon: "ti-settings",         label: "Settings" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${Math.round(n)}`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px",
      borderRadius: 20, color: cfg.color, background: cfg.bg,
      letterSpacing: "0.03em", whiteSpace: "nowrap"
    }}>{cfg.label}</span>
  );
}

function PriorityDot({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: cfg.color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {priority}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "18px 20px",
      borderTop: `3px solid ${accent}`
    }}>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Rep Bar Chart ────────────────────────────────────────────────────────────
function RepChart({ leads }) {
  const repData = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      if (!map[l.rep]) map[l.rep] = { total: 0, count: 0 };
      map[l.rep].total += l.value;
      map[l.rep].count += 1;
    });
    return Object.entries(map)
      .map(([rep, d]) => ({ rep, ...d }))
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  const max = Math.max(...repData.map(r => r.total), 1);
  const colors = ["#534AB7", "#0F6E56", "#993C1D", "#854F0B", "#185FA5"];

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 18 }}>Rep pipeline value</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {repData.map((r, i) => (
          <div key={r.rep}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{r.rep.split(" ").slice(-1)[0]}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{fmtShort(r.total)} · {r.count} leads</span>
            </div>
            <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: colors[i % colors.length],
                width: `${(r.total / max) * 100}%`,
                transition: "width 0.6s ease"
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pipeline Stage Summary ───────────────────────────────────────────────────
function PipelineStages({ leads }) {
  const stages = ["New", "Contacted", "Active", "Proposal", "Won", "Lost"];
  const data = stages.map(s => ({
    status: s,
    count: leads.filter(l => l.status === s).length,
    value: leads.filter(l => l.status === s).reduce((a, l) => a + l.value, 0),
  }));

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Pipeline by stage</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map(d => (
          <div key={d.status} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge status={d.status} />
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 60, textAlign: "right" }}>{d.count} lead{d.count !== 1 ? "s" : ""}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", minWidth: 80, textAlign: "right" }}>{fmtShort(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lead Table ───────────────────────────────────────────────────────────────
function LeadTable({ leads }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRep, setFilterRep] = useState("All");
  const [sortCol, setSortCol] = useState("value");
  const [sortDir, setSortDir] = useState("desc");

  const reps = ["All", ...Array.from(new Set(leads.map(l => l.rep)))];
  const statuses = ["All", ...Object.keys(STATUS_CONFIG)];

  const filtered = useMemo(() => {
    return leads
      .filter(l =>
        (filterStatus === "All" || l.status === filterStatus) &&
        (filterRep === "All" || l.rep === filterRep) &&
        (search === "" || l.leadName.toLowerCase().includes(search.toLowerCase()) ||
          l.vendor.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        let av = a[sortCol], bv = b[sortCol];
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
  }, [leads, search, filterStatus, filterRep, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }) => (
    <span style={{ opacity: sortCol === col ? 1 : 0.3, fontSize: 10, marginLeft: 4 }}>
      {sortCol === col && sortDir === "asc" ? "▲" : "▼"}
    </span>
  );

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 180px" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted)", pointerEvents: "none" }} />
          <input
            placeholder="Search leads or vendors…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 32, fontSize: 13, boxSizing: "border-box" }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: 13, flex: "0 0 130px" }}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterRep} onChange={e => setFilterRep(e.target.value)} style={{ fontSize: 13, flex: "0 0 160px" }}>
          {reps.map(r => <option key={r}>{r}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{filtered.length} of {leads.length}</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              {[["leadName","Lead name"],["vendor","Vendor"],["rep","Rep"],["value","Value"],["status","Status"],["priority","Priority"],["receivedAt","Received"]].map(([col, label]) => (
                <th key={col}
                  onClick={() => handleSort(col)}
                  style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                  {label}<SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg)" }}>
                <td style={{ padding: "12px 14px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.leadName}</td>
                <td style={{ padding: "12px 14px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.vendor}</td>
                <td style={{ padding: "12px 14px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.rep.split(" ").map((w,i)=>i===0?w[0]+".":w).join(" ")}</td>
                <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{fmt(l.value)}</td>
                <td style={{ padding: "12px 14px" }}><StatusBadge status={l.status} /></td>
                <td style={{ padding: "12px 14px" }}><PriorityDot priority={l.priority} /></td>
                <td style={{ padding: "12px 14px", color: "var(--muted)", whiteSpace: "nowrap" }}>{l.receivedAt}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No leads match your filters</td></tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--border)", background: "var(--bg)" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 12, color: "var(--text)" }} colSpan={3}>Total ({filtered.length} leads)</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{fmt(filtered.reduce((a, l) => a + l.value, 0))}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ leads }) {
  const totalValue = leads.reduce((a, l) => a + l.value, 0);
  const activeLeads = leads.filter(l => !["Won","Lost"].includes(l.status));
  const wonLeads = leads.filter(l => l.status === "Won");
  const wonValue = wonLeads.reduce((a, l) => a + l.value, 0);
  const followUps = leads.filter(l => l.status === "Contacted" || l.status === "Active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <StatCard label="Total pipeline" value={fmtShort(totalValue)} sub={`${leads.length} total leads`} accent="#534AB7" />
        <StatCard label="Active leads" value={activeLeads.length} sub="Not yet won or lost" accent="#0F6E56" />
        <StatCard label="Won value" value={fmtShort(wonValue)} sub={`${wonLeads.length} deals closed`} accent="#166534" />
        <StatCard label="Need follow-up" value={followUps} sub="Contacted or active" accent="#854F0B" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <RepChart leads={leads} />
        <PipelineStages leads={leads} />
      </div>

      {/* Lead table */}
      <LeadTable leads={leads} />
    </div>
  );
}

// ─── Placeholder View ─────────────────────────────────────────────────────────
function PlaceholderView({ label, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, color: "var(--muted)", gap: 12 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 40, opacity: 0.3 }} />
      <div style={{ fontSize: 15, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>Coming in the next version</div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentItem = NAV_ITEMS.find(n => n.id === activeNav);

  return (
    <div style={{
      "--bg": "#F8F7F4",
      "--card": "#FFFFFF",
      "--border": "#E5E4DF",
      "--text": "#1A1918",
      "--muted": "#6B6A65",
      "--accent": "#534AB7",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden"
    }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 60, flexShrink: 0,
        background: "#1A1918", display: "flex", flexDirection: "column",
        transition: "width 0.2s ease", overflow: "hidden"
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 28, height: 28, background: "#534AB7", borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-bolt" style={{ fontSize: 15, color: "#fff" }} />
          </div>
          {sidebarOpen && <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>LeadTrack</span>}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                background: activeNav === item.id ? "rgba(83,74,183,0.25)" : "transparent",
                color: activeNav === item.id ? "#A09CF5" : "rgba(255,255,255,0.5)",
                fontFamily: "inherit", fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400,
                transition: "all 0.15s", textAlign: "left", whiteSpace: "nowrap"
              }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 17, flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ margin: "8px", padding: 8, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`ti ${sidebarOpen ? "ti-layout-sidebar-left-collapse" : "ti-layout-sidebar-left-expand"}`} style={{ fontSize: 16 }} />
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--card)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <i className={`ti ${currentItem?.icon}`} style={{ fontSize: 18, color: "var(--accent)" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{currentItem?.label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {activeNav === "dashboard" ? `${MOCK_LEADS.length} leads · Last updated today` : "Coming soon"}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {activeNav === "leads" || activeNav === "dashboard" ? (
              <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                <i className="ti ti-plus" style={{ fontSize: 14 }} /> New lead
              </button>
            ) : null}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeNav === "dashboard" && <DashboardView leads={MOCK_LEADS} />}
          {activeNav === "leads" && <LeadTable leads={MOCK_LEADS} />}
          {activeNav === "conversations" && <PlaceholderView label="Conversations" icon="ti-messages" />}
          {activeNav === "vendors" && <PlaceholderView label="Vendors" icon="ti-building" />}
          {activeNav === "reports" && <PlaceholderView label="Reports" icon="ti-chart-bar" />}
          {activeNav === "settings" && <PlaceholderView label="Settings" icon="ti-settings" />}
        </div>
      </div>
    </div>
  );
}