import { useState, useMemo } from "react";

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_VENDORS = ["Cyber Power", "3CX", "SonicWall", "Zen Health"];
const INITIAL_REPS = ["Zachary Johnson", "Noorinder Brar", "Steve Massey", "Ryan Kopiske"];

const INITIAL_LEADS = [
  { id: 1, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "General Trade", value: 700000, status: "Active", priority: "High", receivedAt: "2025-04-01", followUpDate: "2025-05-12", conversations: [] },
  { id: 2, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Dabos", value: 14000, status: "Proposal", priority: "Medium", receivedAt: "2025-04-10", followUpDate: null, conversations: [] },
  { id: 3, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Capital Farm Credit", value: 1849.99, status: "Contacted", priority: "Low", receivedAt: "2025-04-15", followUpDate: "2025-05-15", conversations: [] },
  { id: 4, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Omega International LLC", value: 1306.28, status: "New", priority: "Low", receivedAt: "2025-05-01", followUpDate: null, conversations: [] },
  { id: 5, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "SEMTech Solutions", value: 3200, status: "Won", priority: "Medium", receivedAt: "2025-03-20", followUpDate: null, conversations: [] },
  { id: 6, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "U.S. Army", value: 40446, status: "Active", priority: "High", receivedAt: "2025-03-15", followUpDate: "2025-05-10", conversations: [] },
  { id: 7, vendor: "3CX", rep: "Noorinder Brar", leadName: "The Sea Pines Resort", value: 3000, status: "Proposal", priority: "Medium", receivedAt: "2025-04-20", followUpDate: null, conversations: [] },
  { id: 8, vendor: "SonicWall", rep: "Steve Massey", leadName: "Sonrisas Dentistry", value: 525.24, status: "Won", priority: "Low", receivedAt: "2025-03-10", followUpDate: null, conversations: [] },
  { id: 9, vendor: "Zen Health", rep: "Ryan Kopiske", leadName: "Lifeworks NW", value: 0, status: "Lost", priority: "Low", receivedAt: "2025-02-28", followUpDate: null, conversations: [] },
  { id: 10, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Pacific NW Logistics", value: 18500, status: "Active", priority: "High", receivedAt: "2025-04-25", followUpDate: "2025-05-13", conversations: [] },
  { id: 11, vendor: "3CX", rep: "Noorinder Brar", leadName: "Cascade Dental Group", value: 8200, status: "Contacted", priority: "Medium", receivedAt: "2025-05-02", followUpDate: null, conversations: [] },
  { id: 12, vendor: "SonicWall", rep: "Steve Massey", leadName: "Riverfront Hotel", value: 12400, status: "New", priority: "High", receivedAt: "2025-05-08", followUpDate: null, conversations: [] },
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
  { id: "dashboard",     label: "Dashboard" },
  { id: "leads",         label: "Leads" },
  { id: "conversations", label: "Conversations" },
  { id: "vendors",       label: "Vendors" },
  { id: "reports",       label: "Reports" },
  { id: "settings",      label: "Settings" },
];

const EMPTY_LEAD_FORM = {
  leadName: "", vendor: "", rep: "", value: "",
  status: "New", priority: "Medium",
  receivedAt: new Date().toISOString().slice(0, 10),
  followUpDate: "", conversations: [],
};

const EMPTY_CONVO_FORM = {
  date: new Date().toISOString().slice(0, 10),
  contactName: "", contactRole: "", method: "Phone",
  summary: "", outcome: "Positive", followUpDate: "",
};

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${Math.round(n)}`;
const today = new Date().toISOString().slice(0, 10);
const isOverdue = (date) => date && date <= today;
let nextId = 100;

// ─── Email Hook (wire up AWS SES here later) ──────────────────────────────────
// TODO: Replace this function with AWS SES API call when ready
// It should send a follow-up reminder to the assigned rep's email
async function sendFollowUpEmail({ repName, leadName, followUpDate }) {
  console.log(`[EMAIL HOOK] Follow-up due for ${repName} on lead "${leadName}" by ${followUpDate}`);
  // Example SES call will go here:
  // await ses.sendEmail({ To: repEmail, Subject: `Follow-up due: ${leadName}`, ... })
}

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

function FollowUpBadge() {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 20, color: "#991B1B", background: "#FEE2E2", marginLeft: 6 }}>FOLLOW UP</span>;
}

// ─── Addable Select ───────────────────────────────────────────────────────────
function AddableSelect({ value, onChange, options, onAddNew, placeholder }) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const handleAdd = () => {
    const t = newVal.trim();
    if (!t) return;
    onAddNew(t); onChange(t); setNewVal(""); setAdding(false);
  };
  if (adding) return (
    <div style={{ display: "flex", gap: 6 }}>
      <input autoFocus value={newVal} onChange={e => setNewVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
        placeholder={`New ${placeholder}...`}
        style={{ flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none" }} />
      <button onClick={handleAdd} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
      <button onClick={() => setAdding(false)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 12, cursor: "pointer", color: "#6B6A65" }}>Cancel</button>
    </div>
  );
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => e.target.value === "__add__" ? setAdding(true) : onChange(e.target.value)}
        style={{ width: "100%", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff", appearance: "none", cursor: "pointer" }}>
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__add__">+ Add new {placeholder.toLowerCase()}…</option>
      </select>
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9CA3AF", pointerEvents: "none" }}>▼</span>
    </div>
  );
}

// ─── Lead Form Panel ──────────────────────────────────────────────────────────
function LeadFormPanel({ open, onClose, onSubmit, vendors, reps, onAddVendor, onAddRep }) {
  const [form, setForm] = useState(EMPTY_LEAD_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
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
    await new Promise(r => setTimeout(r, 400));
    onSubmit({ ...form, value: Number(form.value) || 0, id: nextId++ });
    setForm(EMPTY_LEAD_FORM); setErrors({}); setSaving(false); onClose();
  };
  const handleClose = () => { setForm(EMPTY_LEAD_FORM); setErrors({}); onClose(); };
  const inp = (err) => ({ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: `1px solid ${err ? "#FCA5A5" : "#C5C4BF"}`, outline: "none", background: err ? "#FFF5F5" : "#fff", width: "100%", boxSizing: "border-box" });
  const F = ({ label, err, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>{label}</label>
      {children}
      {err && <span style={{ fontSize: 11, color: "#991B1B" }}>{err}</span>}
    </div>
  );
  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.25s", zIndex: 40 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 400, background: "#fff", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", zIndex: 50, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #E5E4DF", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1918" }}>New Lead</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Fill in the details to add a lead</div>
          </div>
          <button onClick={handleClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6A65", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <F label="Lead / Company Name *" err={errors.leadName}><input value={form.leadName} onChange={e => set("leadName", e.target.value)} placeholder="e.g. Acme Corporation" style={inp(errors.leadName)} /></F>
          <F label="Vendor *" err={errors.vendor}><AddableSelect value={form.vendor} onChange={v => set("vendor", v)} options={vendors} onAddNew={onAddVendor} placeholder="Select vendor" /></F>
          <F label="Assigned Rep *" err={errors.rep}><AddableSelect value={form.rep} onChange={v => set("rep", v)} options={reps} onAddNew={onAddRep} placeholder="Select rep" /></F>
          <F label="Estimated Value ($)" err={errors.value}><input value={form.value} onChange={e => set("value", e.target.value)} placeholder="e.g. 15000" style={inp(errors.value)} /></F>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <F label="Status"><select value={form.status} onChange={e => set("status", e.target.value)} style={{ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff" }}>{Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}</select></F>
            <F label="Priority"><select value={form.priority} onChange={e => set("priority", e.target.value)} style={{ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff" }}>{["High","Medium","Low"].map(p => <option key={p}>{p}</option>)}</select></F>
          </div>
          <F label="Date Received"><input type="date" value={form.receivedAt} onChange={e => set("receivedAt", e.target.value)} style={inp(false)} /></F>
          <F label="Follow-up Date"><input type="date" value={form.followUpDate} onChange={e => set("followUpDate", e.target.value)} style={inp(false)} /></F>
          <div style={{ borderTop: "1px solid #F3F2EE", paddingTop: 4, textAlign: "center" }}><span style={{ fontSize: 11, color: "#9CA3AF" }}>* Required fields</span></div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #E5E4DF", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={handleClose} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: 10, borderRadius: 8, border: "none", background: saving ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {saving ? "Saving…" : "+ Add Lead"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Conversation Log Form ────────────────────────────────────────────────────
function ConvoForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_CONVO_FORM);
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
  const validate = () => {
    const e = {};
    if (!form.contactName.trim()) e.contactName = "Required";
    if (!form.summary.trim()) e.summary = "Required";
    return e;
  };
  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ ...form, id: nextId++ });
    setForm(EMPTY_CONVO_FORM);
  };
  const inp = (err) => ({ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: `1px solid ${err ? "#FCA5A5" : "#C5C4BF"}`, outline: "none", background: err ? "#FFF5F5" : "#fff", width: "100%", boxSizing: "border-box" });
  const F = ({ label, err, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>{label}</label>
      {children}
      {err && <span style={{ fontSize: 11, color: "#991B1B" }}>{err}</span>}
    </div>
  );
  return (
    <div style={{ background: "#F8F7F4", border: "1px solid #E5E4DF", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1918" }}>Log a Conversation</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <F label="Date"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inp(false)} /></F>
        <F label="Method">
          <select value={form.method} onChange={e => set("method", e.target.value)} style={{ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff" }}>
            {["Phone","Email","In-person","Video call","Text"].map(m => <option key={m}>{m}</option>)}
          </select>
        </F>
        <F label="Contact Name *" err={errors.contactName}><input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Who did you speak with?" style={inp(errors.contactName)} /></F>
        <F label="Contact Role"><input value={form.contactRole} onChange={e => set("contactRole", e.target.value)} placeholder="e.g. Vendor Rep, Decision Maker" style={inp(false)} /></F>
      </div>
      <F label="Summary *" err={errors.summary}>
        <textarea value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="What was discussed?" rows={3}
          style={{ ...inp(errors.summary), resize: "vertical", fontFamily: "inherit" }} />
      </F>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <F label="Outcome">
          <select value={form.outcome} onChange={e => set("outcome", e.target.value)} style={{ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff" }}>
            {["Positive","Neutral","Needs follow-up","Dead end"].map(o => <option key={o}>{o}</option>)}
          </select>
        </F>
        <F label="Follow-up Date"><input type="date" value={form.followUpDate} onChange={e => set("followUpDate", e.target.value)} style={inp(false)} /></F>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
        <button onClick={handleSubmit} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save Conversation</button>
      </div>
    </div>
  );
}

// ─── Lead Detail Page ─────────────────────────────────────────────────────────
function LeadDetail({ lead, onBack, onUpdateLead }) {
  const [showConvoForm, setShowConvoForm] = useState(false);

  const handleAddConvo = (convo) => {
    const updatedLead = {
      ...lead,
      conversations: [convo, ...lead.conversations],
      followUpDate: convo.followUpDate || lead.followUpDate,
    };
    onUpdateLead(updatedLead);
    // TODO: Wire up AWS SES here — call sendFollowUpEmail if convo.followUpDate is set
    if (convo.followUpDate) {
      sendFollowUpEmail({ repName: lead.rep, leadName: lead.leadName, followUpDate: convo.followUpDate });
    }
    setShowConvoForm(false);
  };

  const outcomeColor = { Positive: "#166534", Neutral: "#854F0B", "Needs follow-up": "#2563EB", "Dead end": "#991B1B" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860, margin: "0 auto" }}>
      {/* Back button */}
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#534AB7", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0, width: "fit-content" }}>
        ← Back to leads
      </button>

      {/* Lead header */}
      <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1918" }}>{lead.leadName}</div>
              <StatusBadge status={lead.status} />
              <PriorityDot priority={lead.priority} />
              {isOverdue(lead.followUpDate) && <FollowUpBadge />}
            </div>
            <div style={{ fontSize: 13, color: "#6B6A65", marginTop: 6 }}>{lead.vendor} · {lead.rep}</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#534AB7" }}>{fmt(lead.value)}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #F3F2EE" }}>
          <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Received</div><div style={{ fontSize: 13, color: "#1A1918" }}>{lead.receivedAt}</div></div>
          <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Follow-up</div><div style={{ fontSize: 13, color: isOverdue(lead.followUpDate) ? "#991B1B" : "#1A1918", fontWeight: isOverdue(lead.followUpDate) ? 600 : 400 }}>{lead.followUpDate || "—"}</div></div>
          <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Conversations</div><div style={{ fontSize: 13, color: "#1A1918" }}>{lead.conversations.length}</div></div>
        </div>
      </div>

      {/* Conversation section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918" }}>Conversation Log</div>
        {!showConvoForm && (
          <button onClick={() => setShowConvoForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#534AB7", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            + Log Conversation
          </button>
        )}
      </div>

      {showConvoForm && <ConvoForm onSubmit={handleAddConvo} onCancel={() => setShowConvoForm(false)} />}

      {/* Conversation history */}
      {lead.conversations.length === 0 && !showConvoForm ? (
        <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF" }}>
          <div style={{ fontSize: 13 }}>No conversations logged yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Click "Log Conversation" to add the first one</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lead.conversations.map((c) => (
            <div key={c.id} style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1918" }}>{c.contactName}</span>
                  {c.contactRole && <span style={{ fontSize: 12, color: "#9CA3AF" }}>{c.contactRole}</span>}
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#F3F2EE", color: "#6B6A65", fontWeight: 500 }}>{c.method}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: outcomeColor[c.outcome] || "#6B6A65" }}>{c.outcome}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>{c.date}</span>
                  {c.followUpDate && <span style={{ fontSize: 11, color: isOverdue(c.followUpDate) ? "#991B1B" : "#854F0B", fontWeight: 600 }}>Follow-up: {c.followUpDate}</span>}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#3d3d3a", lineHeight: 1.6 }}>{c.summary}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rep Chart ────────────────────────────────────────────────────────────────
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
function LeadTable({ leads, onSelectLead }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRep, setFilterRep] = useState("All");
  const [sortCol, setSortCol] = useState("value");
  const [sortDir, setSortDir] = useState("desc");
  const reps = ["All", ...Array.from(new Set(leads.map(l => l.rep)))];
  const statuses = ["All", ...Object.keys(STATUS_CONFIG)];
  const filtered = useMemo(() => leads
    .filter(l => (filterStatus === "All" || l.status === filterStatus) && (filterRep === "All" || l.rep === filterRep) && (search === "" || l.leadName.toLowerCase().includes(search.toLowerCase()) || l.vendor.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => { let av = a[sortCol], bv = b[sortCol]; if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); } return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1); }),
    [leads, search, filterStatus, filterRep, sortCol, sortDir]);
  const handleSort = (col) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("desc"); } };
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
              {cols.map(([col, label]) => <th key={col} onClick={() => handleSort(col)} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6B6A65", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>{label} {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id} onClick={() => onSelectLead(l)} style={{ borderBottom: "1px solid #F3F2EE", background: i % 2 === 0 ? "#fff" : "#FAFAF8", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F3F2EE"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFAF8"}>
                <td style={{ padding: "11px 14px", fontWeight: 500, color: "#1A1918", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.leadName}
                  {isOverdue(l.followUpDate) && <FollowUpBadge />}
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

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ leads, onSelectLead }) {
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
      <LeadTable leads={leads} onSelectLead={onSelectLead} />
    </div>
  );
}

function PlaceholderView({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#9CA3AF", gap: 12 }}>
      <div style={{ fontSize: 36, opacity: 0.3 }}>⬜</div>
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
  const [selectedLead, setSelectedLead] = useState(null);

  const currentItem = NAV_ITEMS.find(n => n.id === activeNav);
  const showNewLead = (activeNav === "dashboard" || activeNav === "leads") && !selectedLead;
  const overdueCount = leads.filter(l => isOverdue(l.followUpDate)).length;

  const handleUpdateLead = (updatedLead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);
  };

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setActiveNav("leads");
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: "flex", height: "100vh", background: "#F8F7F4", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 210 : 52, flexShrink: 0, background: "#1A1918", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden" }}>
        <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 26, height: 26, background: "#534AB7", borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>L</div>
          {sidebarOpen && <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>LeadTrack</span>}
        </div>
        <nav style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setActiveNav(item.id); setSelectedLead(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: 7, border: "none", cursor: "pointer", background: activeNav === item.id ? "rgba(83,74,183,0.25)" : "transparent", color: activeNav === item.id ? "#A09CF5" : "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400, textAlign: "left", whiteSpace: "nowrap", position: "relative" }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>
                {item.id === "dashboard" ? "▦" : item.id === "leads" ? "☰" : item.id === "conversations" ? "💬" : item.id === "vendors" ? "🏢" : item.id === "reports" ? "📊" : "⚙️"}
              </span>
              {sidebarOpen && item.label}
              {item.id === "dashboard" && overdueCount > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "#991B1B", color: "#fff" }}>{overdueCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(o => !o)} style={{ margin: "8px", padding: 7, borderRadius: 7, border: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: "1px solid #E5E4DF", background: "#fff", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918" }}>
              {selectedLead ? selectedLead.leadName : currentItem?.label}
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
              {selectedLead ? `${selectedLead.vendor} · ${selectedLead.rep}` : showNewLead ? `${leads.length} leads · Mock data` : "Coming soon"}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {showNewLead && (
              <button onClick={() => setFormOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#534AB7", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                + New lead
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {selectedLead ? (
            <LeadDetail lead={selectedLead} onBack={() => setSelectedLead(null)} onUpdateLead={handleUpdateLead} />
          ) : (
            <>
              {activeNav === "dashboard" && <DashboardView leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "leads" && <LeadTable leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "conversations" && <PlaceholderView label="Conversations" />}
              {activeNav === "vendors" && <PlaceholderView label="Vendors" />}
              {activeNav === "reports" && <PlaceholderView label="Reports" />}
              {activeNav === "settings" && <PlaceholderView label="Settings" />}
            </>
          )}
        </div>
      </div>

      <LeadFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(lead) => setLeads(prev => [lead, ...prev])}
        vendors={vendors}
        reps={reps}
        onAddVendor={(v) => setVendors(prev => prev.includes(v) ? prev : [...prev, v])}
        onAddRep={(r) => setReps(prev => prev.includes(r) ? prev : [...prev, r])}
      />
    </div>
  );
}