import { useState } from "react";
import AddableSelect from "./AddableSelect";
import { EMPTY_LEAD_FORM, STATUS_CONFIG } from "../data/initial";
import { getNextId } from "../utils/helpers";

function F({ label, err, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>{label}</label>
      {children}
      {err && <span style={{ fontSize: 11, color: "#991B1B" }}>{err}</span>}
    </div>
  );
}

export default function LeadFormPanel({ open, onClose, onSubmit, vendors, reps, onAddVendor, onAddRep }) {
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
    onSubmit({ ...form, value: Number(form.value) || 0, id: getNextId() });
    setForm(EMPTY_LEAD_FORM); setErrors({}); setSaving(false); onClose();
  };

  const handleClose = () => { setForm(EMPTY_LEAD_FORM); setErrors({}); onClose(); };

  const inp = (err) => ({ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: `1px solid ${err ? "#FCA5A5" : "#C5C4BF"}`, outline: "none", background: err ? "#FFF5F5" : "#fff", width: "100%", boxSizing: "border-box" });

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