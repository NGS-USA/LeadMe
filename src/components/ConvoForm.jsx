import { useState } from "react";
import { EMPTY_CONVO_FORM } from "../data/initial";
import { getNextId } from "../utils/helpers";

export default function ConvoForm({ onSubmit, onCancel, context }) {
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
    onSubmit({ ...form, id: getNextId() });
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
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1918" }}>
        Log a Conversation {context && <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 400 }}>— {context}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <F label="Date"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inp(false)} /></F>
        <F label="Method">
          <select value={form.method} onChange={e => set("method", e.target.value)} style={{ fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff" }}>
            {["Phone","Email","In-person","Video call","Text"].map(m => <option key={m}>{m}</option>)}
          </select>
        </F>
        <F label="Contact Name *" err={errors.contactName}><input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Who did you speak with?" style={inp(errors.contactName)} /></F>
        <F label="Contact Role"><input value={form.contactRole} onChange={e => set("contactRole", e.target.value)} placeholder="e.g. Vendor Rep, Account Manager" style={inp(false)} /></F>
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