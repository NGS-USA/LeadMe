import { useState, useMemo } from "react";

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_VENDORS = ["Cyber Power", "3CX", "SonicWall", "Zen Health"];
const INITIAL_REPS = ["Zachary Johnson", "Noorinder Brar", "Steve Massey", "Ryan Kopiske"];

const INITIAL_LEADS = [
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
  New:       { color: "#6B7280", bg: "#F3F4F6" },
  Contacted: { color: "#2563EB", bg: "#EFF6FF" },
  Active:    { color: "#0F6E56", bg: "#E1F5EE" },
  Proposal:  { color: "#854F0B", bg: "#FAEEDA" },
  Won:       { color: "#166534", bg: "#DCFCE7" },
  Lost:      { color: "#991B1B", bg: "#FEE2E2" },
};

const PRIORITY_CONFIG = {
  High:   { color: "#991B1B" },
  Medium: { color: "#854F0B" },
  Low:    { color: "#6B7280" },
};

const NAV_ITEMS = [
  { id: "dashboard",     icon: "ti-layout-dashboard", label: "Dashboard" },
  { id: "leads",         icon: "ti-list",             label: "Leads" },
  { id: "conversations", icon: "ti-messages",         label: "Conversations" },
  { id: "vendors",       icon: "ti-building",         label: "Vendors" },
  { id: "reports",       icon: "ti-chart-bar",        label: "Reports" },
  { id: "settings",      icon: "ti-settings",         label: "Settings" },
];

const EMPTY_FORM = {
  leadName: "", vendor: "", rep: "", value: "",
  status: "New", priority: "Medium", receivedAt: new Date().toISOString().slice(0, 10),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${Math.round(n)}`;
let nextId = 100;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: cfg.color, background: cfg.bg, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{status}</span>;
}

function PriorityDot({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;
  return <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: cfg.color }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />{priority}</span>;
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "18px 20px", borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 11, color: "#6B6A65", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1A1918", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#6B6A65", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Dropdown with Add New ────────────────────────────────────────────────────
function AddableSelect({ value, onChange, options, onAddNew, placeholder }) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");

  const handleAdd = () => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    onAddNew(trimmed);
    onChange(trimmed);
    setNewVal("");
    setAdding(false);
  };

  if (adding) {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <input
          autoFocus
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
          placeholder={`New ${placeholder}...`}
          style={{ flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none" }}
        />
        <button onClick={handleAdd} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
        <button onClick={() => setAdding(false)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 12, cursor: "pointer", color: "#6B6A65" }}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => {
          if (e.target.value === "__add__") { setAdding(true); }
          else onChange(e.target.value);
        }}
        style={{ width: "100%", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff", color: value ? "#1A1918" : "#9CA3AF", appearance: "none", cursor: "pointer" }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__add__">+ Add new {placeholder.toLowerCase()}…</option>
      </select>
      <i className="ti ti-chevron-down" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#9CA3AF", pointerEvents: "none" }} />
    </div>
  );
}

// ─── Lead Form Panel ──────────────────────────────────────────────────────────
function LeadFormPanel({ open, onClose, onSubmit, vendors, reps, onAddVendor, onAddRep }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.leadName.trim()) e.leadName = "Required";
    if (!form.vendor) e.vendor = "Required";
    if (!form.rep) e.rep = "Required";
    if (form.value !== "" && isNaN(Number(form.value))) e.value = "Must be a number";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400)); // simulate async save
    onSubmit({ ...form, value: Number(form.value) || 0, id: nextId++ });
    setForm(EMPTY_FORM);
    setErrors({});
    setSaving(false);
    onClose();
  };

  const handleClose = () => { setForm(EMPTY_FORM); setErrors({}); onClose(); };

  const Field = ({ label, error, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918", letterSpacing: "0.03em" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 11, color: "#991B1B" }}>{error}</span>}
    </div>
  );

  const inputStyle = (err) => ({
    fontSize: 13, padding: "8px 10px", borderRadius: 8,
    border: `1px solid ${err ? "#FCA5A5" : "#C5C4BF"}`,
    outline: "none", background: err ? "#FFF5F5" : "#fff", width: "100%", boxSizing: "border-box"
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease", zIndex: 40
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
        background: "#fff", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #E5E4DF", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1918" }}>New Lead</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Fill in the details below to add a lead</div>
          </div>
          <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6A65" }}>
            <i className="ti ti-x" style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          <Field label="Lead / Company Name *" error={errors.leadName}>
            <input value={form.leadName} onChange={e => set("leadName", e.target.value)}
              placeholder="e.g. Acme Corporation" style={inputStyle(errors.leadName)} />
          </Field>

          <Field label="Vendor *" error={errors.vendor}>
            <AddableSelect value={form.vendor} onChange={v => set("vendor", v)}
              options={vendors} onAddNew={onAddVendor} placeholder="Select vendor" />
            {errors.vendor && <span style={{ fontSize: 11, color: "#991B1B" }}>{errors.vendor}</span>}
          </Field>

          <Field label="Assigned Rep *" error={errors.rep}>
            <AddableSelect value={form.rep} onChange={v => set("rep", v)}
              options={reps} onAddNew={onAddRep} placeholder="Select rep" />
            {errors.rep && <span style={{ fontSize: 11, color: "#991B1B" }}>{errors.rep}</span>}
          </Field>

          <Field label="Estimated Value ($)" error={errors.value}>
            <input value={form.value} onChange={e => set("value", e.target.value)}
              placeholder="e.g. 15000" style={inputStyle(errors.value)} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)}
                style={{ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff", cursor: "pointer" }}>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={e => set("priority", e.target.value)}
                style={{ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff", cursor: "pointer" }}>
                {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Date Received">
            <input type="date" value={form.receivedAt} onChange={e => set("receivedAt", e.target.value)}
              style={inputStyle(false)} />
          </Field>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #F3F2EE", paddingTop: 4 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center" }}>* Required fields</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #E5E4DF", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={handleClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: saving ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}>
            {saving ? <><i className="ti ti-loader-2" style={{ fontSize: 14, animation: "spin 1s linear infinite" }} /> Saving…</> : <><i className="ti ti-plus" style={{ fontSize: 14 }} /> Add Lead</>}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Rep Chart ────────────────────────────────────────────────────────────────
function RepChart({ leads }) {
  const repData = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      if (!map[l.rep]) map[l.rep] = { total: 0, count: 0 };
      map[l.rep].total += l.value;
      map[l.rep].count += 1;
    });
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
              <span style={{ fontSize: 13, color: "#1A1918", fontWeight: 500 }}>{r.rep.split(" ").slice(-1)[0]}</span>
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

// ─── Pipeline Stages ──────────────────────────────────────────────────────────
function PipelineStages({ leads }) {
  const stages = ["New", "Contacted", "Active", "Proposal", "Won", "Lost"];
  const data = stages.map(s => ({ status: s, count: leads.filter(l => l.status === s).length, value: leads.filter(l => l.status === s).reduce((a, l) => a + l.value, 0) }));
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

// ─── Lead Table ───────────────────────────────────────────────────────────────
function LeadTable({ leads }) {
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
    }), [leads, search, filterStatus, filterRep, sortCol, sortDir]);

  const handleSort = (col) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("desc"); } };
  const cols = [["leadName","Lead name"],["vendor","Vendor"],["rep","Rep"],["value","Value"],["status","Status"],["priority","Priority"],["receivedAt","Received"]];

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E4DF", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 160px" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#9CA3AF", pointerEvents: "none" }} />
          <input placeholder="Search leads or vendors…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", paddingLeft: 30, fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: 13 }}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterRep} onChange={e => setFilterRep(e.target.value)} style={{ fontSize: 13 }}>
          {reps.map(r => <option key={r}>{r === "All" ? "All reps" : r.split(" ").slice(-1)[0]}</option>)}
        </select>
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
              <tr key={l.id} style={{ borderBottom: "1px solid #F3F2EE", background: i % 2 === 0 ? "#fff" : "#FAFAF8" }}>
                <td style={{ padding: "11px 14px", fontWeight: 500, color: "#1A1918", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.leadName}</td>
                <td style={{ padding: "11px 14px", color: "#6B6A65", whiteSpace: "nowrap" }}>{l.vendor}</td>
                <td style={{ padding: "11px 14px", color: "#6B6A65", whiteSpace: "nowrap" }}>{l.rep.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ")}</td>
                <td style={{ padding: "11px 14px", fontWeight: 600, color: "#1A1918", whiteSpace: "nowrap" }}>{fmt(l.value)}</td>
                <td style={{ padding: "11px 14px" }}><StatusBadge status={l.status} /></td>
                <td style={{ padding: "11px 14px" }}><PriorityDot priority={l.priority} /></td>
                <td style={{ padding: "11px 14px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{l.receivedAt}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>No leads match your filters</td></tr>}
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

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ leads }) {
  const totalValue = leads.reduce((a, l) => a + l.value, 0);
  const activeLeads = leads.filter(l => !["Won", "Lost"].includes(l.status));
  const wonLeads = leads.filter(l => l.status === "Won");
  const wonValue = wonLeads.reduce((a, l) => a + l.value, 0);
  const followUps = leads.filter(l => l.status === "Contacted" || l.status === "Active").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <StatCard label="Total pipeline" value={fmtShort(totalValue)} sub={`${leads.length} total leads`} accent="#534AB7" />
        <StatCard label="Active leads" value={activeLeads.length} sub="Not yet closed" accent="#0F6E56" />
        <StatCard label="Won value" value={fmtShort(wonValue)} sub={`${wonLeads.length} deals closed`} accent="#166534" />
        <StatCard label="Need follow-up" value={followUps} sub="Contacted or active" accent="#854F0B" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <RepChart leads={leads} />
        <PipelineStages leads={leads} />
      </div>
      <LeadTable leads={leads} />
    </div>
  );
}

function PlaceholderView({ label, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#9CA3AF", gap: 12 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 36, opacity: 0.3 }} />
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Coming in the next version</div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [reps, setReps] = useState(INITIAL_REPS);

  const currentItem = NAV_ITEMS.find(n => n.id === activeNav);
  const showNewLead = activeNav === "dashboard" || activeNav === "leads";

  const handleAddLead = (lead) => setLeads(prev => [lead, ...prev]);
  const handleAddVendor = (v) => setVendors(prev => prev.includes(v) ? prev : [...prev, v]);
  const handleAddRep = (r) => setReps(prev => prev.includes(r) ? prev : [...prev, r]);

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: "flex", height: "100vh", background: "#F8F7F4", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 210 : 52, flexShrink: 0, background: "#1A1918", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden" }}>
        <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 26, height: 26, background: "#534AB7", borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-bolt" style={{ fontSize: 13, color: "#fff" }} />
          </div>
          {sidebarOpen && <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>LeadTrack</span>}
        </div>
        <nav style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: 7, border: "none", cursor: "pointer", background: activeNav === item.id ? "rgba(83,74,183,0.25)" : "transparent", color: activeNav === item.id ? "#A09CF5" : "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400, transition: "all 0.15s", textAlign: "left", whiteSpace: "nowrap" }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(o => !o)} style={{ margin: "8px", padding: 7, borderRadius: 7, border: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={`ti ${sidebarOpen ? "ti-layout-sidebar-left-collapse" : "ti-layout-sidebar-left-expand"}`} style={{ fontSize: 15 }} />
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: "1px solid #E5E4DF", background: "#fff", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <i className={`ti ${currentItem?.icon}`} style={{ fontSize: 17, color: "#534AB7" }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918" }}>{currentItem?.label}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
              {showNewLead ? `${leads.length} leads · Mock data — connect Supabase to go live` : "Coming soon"}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {showNewLead && (
              <button onClick={() => setFormOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#534AB7", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                <i className="ti ti-plus" style={{ fontSize: 13 }} /> New lead
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {activeNav === "dashboard" && <DashboardView leads={leads} />}
          {activeNav === "leads" && <LeadTable leads={leads} />}
          {activeNav === "conversations" && <PlaceholderView label="Conversations" icon="ti-messages" />}
          {activeNav === "vendors" && <PlaceholderView label="Vendors" icon="ti-building" />}
          {activeNav === "reports" && <PlaceholderView label="Reports" icon="ti-chart-bar" />}
          {activeNav === "settings" && <PlaceholderView label="Settings" icon="ti-settings" />}
        </div>
      </div>

      {/* Lead form panel */}
      <LeadFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddLead}
        vendors={vendors}
        reps={reps}
        onAddVendor={handleAddVendor}
        onAddRep={handleAddRep}
      />
    </div>
  );
}