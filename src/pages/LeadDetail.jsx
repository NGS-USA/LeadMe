import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import PriorityDot from "../components/PriorityDot";
import FollowUpBadge from "../components/FollowUpBadge";
import ConvoForm from "../components/ConvoForm";
import ConvoHistory from "../components/ConvoHistory";
import { fmt, isOverdue, sendFollowUpEmail } from "../utils/helpers";
import { STATUS_CONFIG } from "../data/initial";
import AddableSelect from "../components/AddableSelect";

function EditField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" };

export default function LeadDetail({ lead, onBack, onUpdateLead, onAddConversation, vendors, reps, onAddVendor, onAddRep }) {
  const [showConvoForm, setShowConvoForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const handleAddConvo = async (convo) => {
    setSaving(true);
    try {
      await onAddConversation(lead.id, convo);
      if (convo.followUpDate) sendFollowUpEmail({ repName: lead.rep, leadName: lead.leadName, followUpDate: convo.followUpDate });
    } finally {
      setSaving(false);
      setShowConvoForm(false);
    }
  };

  const handleStartEdit = () => {
    setEditForm({
      leadName: lead.leadName,
      vendor: lead.vendor,
      rep: lead.rep,
      value: lead.value,
      status: lead.status,
      priority: lead.priority,
      receivedAt: lead.receivedAt,
      followUpDate: lead.followUpDate || "",
    });
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await onUpdateLead({
        ...lead,
        ...editForm,
        value: Number(editForm.value) || 0,
        followUpDate: editForm.followUpDate || null,
      });
      setEditing(false);
      setEditForm({});
    } finally {
      setSavingEdit(false);
    }
  };

  const set = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#534AB7", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0, width: "fit-content" }}>
        ← Back to leads
      </button>

      {/* Lead header card */}
      <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "20px 24px" }}>

        {/* View mode */}
        {!editing && (
          <>
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
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#534AB7" }}>{fmt(lead.value)}</div>
                <button onClick={handleStartEdit}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>
                  ✏️ Edit
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #F3F2EE" }}>
              <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Received</div><div style={{ fontSize: 13, color: "#1A1918" }}>{lead.receivedAt}</div></div>
              <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Follow-up</div><div style={{ fontSize: 13, color: isOverdue(lead.followUpDate) ? "#991B1B" : "#1A1918", fontWeight: isOverdue(lead.followUpDate) ? 600 : 400 }}>{lead.followUpDate || "—"}</div></div>
              <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Conversations</div><div style={{ fontSize: 13, color: "#1A1918" }}>{lead.conversations.length}</div></div>
            </div>
          </>
        )}

        {/* Edit mode */}
        {editing && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1918", marginBottom: 16 }}>Editing lead</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <EditField label="Lead / Company Name">
                  <input value={editForm.leadName} onChange={e => set("leadName", e.target.value)} style={inp} />
                </EditField>
              </div>
              <EditField label="Vendor">
                <AddableSelect value={editForm.vendor} onChange={v => set("vendor", v)} options={vendors} onAddNew={onAddVendor} placeholder="Select vendor" />
              </EditField>
              <EditField label="Assigned Rep">
                <AddableSelect value={editForm.rep} onChange={v => set("rep", v)} options={reps} onAddNew={onAddRep} placeholder="Select rep" />
              </EditField>
              <EditField label="Estimated Value ($)">
                <input value={editForm.value} onChange={e => set("value", e.target.value)} style={inp} />
              </EditField>
              <EditField label="Status">
                <select value={editForm.status} onChange={e => set("status", e.target.value)} style={inp}>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
              </EditField>
              <EditField label="Priority">
                <select value={editForm.priority} onChange={e => set("priority", e.target.value)} style={inp}>
                  {["High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
                </select>
              </EditField>
              <EditField label="Date Received">
                <input type="date" value={editForm.receivedAt} onChange={e => set("receivedAt", e.target.value)} style={inp} />
              </EditField>
              <EditField label="Follow-up Date">
                <input type="date" value={editForm.followUpDate} onChange={e => set("followUpDate", e.target.value)} style={inp} />
              </EditField>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #F3F2EE" }}>
              <button onClick={handleCancelEdit}
                style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={savingEdit}
                style={{ flex: 2, padding: "9px", borderRadius: 8, border: "none", background: savingEdit ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: savingEdit ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {savingEdit ? "Saving…" : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Conversation section */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918" }}>Conversation Log</div>
        {!showConvoForm && (
          <button onClick={() => setShowConvoForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#534AB7", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            + Log Conversation
          </button>
        )}
      </div>

      {showConvoForm && (
        <ConvoForm onSubmit={handleAddConvo} onCancel={() => setShowConvoForm(false)} context={lead.leadName} saving={saving} />
      )}
      <ConvoHistory conversations={lead.conversations} />
    </div>
  );
}