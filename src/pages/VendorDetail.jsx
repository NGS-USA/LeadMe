import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import PriorityDot from "../components/PriorityDot";
import FollowUpBadge from "../components/FollowUpBadge";
import LeadDetail from "./LeadDetail";
import { fmt, fmtShort, isOverdue } from "../utils/helpers";
import ConfirmDialog from "../components/ConfirmDialog";

function EditField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" };

export default function VendorDetail({ vendor, leads, onBack, onUpdateVendor, allReps, onUpdateVendorReps, onDelete, onDeleteRep, onAddRep, isAdmin }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteVendorConfirm, setShowDeleteVendorConfirm] = useState(false);
  const [confirmDeleteRep, setConfirmDeleteRep] = useState(null);
  const [showAddRep, setShowAddRep] = useState(false);
  const [newRepName, setNewRepName] = useState("");
  const [addingRep, setAddingRep] = useState(false);

  const vendorLeads = leads.filter(l => l.vendor === vendor.name);
  const totalValue = vendorLeads.reduce((a, l) => a + (l.value || 0), 0);
  const wonLeads = vendorLeads.filter(l => l.status === "Won");
  const wonValue = wonLeads.reduce((a, l) => a + (l.value || 0), 0);
  const winRate = vendorLeads.length > 0 ? Math.round((wonLeads.length / vendorLeads.length) * 100) : 0;
  const activeLeads = vendorLeads.filter(l => !["Won","Lost"].includes(l.status));

  const handleStartEdit = () => {
    setEditForm({ name: vendor.name, status: vendor.status, joinedDate: vendor.joinedDate });
    setEditing(true);
  };

  const handleCancelEdit = () => { setEditing(false); setEditForm({}); };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await onUpdateVendor({ ...vendor, ...editForm });
      if (editForm.reps !== undefined) {
        await onUpdateVendorReps(vendor.id, editForm.reps);
      }
      setEditing(false);
      setEditForm({});
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddRep = async () => {
    const name = newRepName.trim();
    if (!name) return;
    setAddingRep(true);
    try {
      await onAddRep(name);
      setNewRepName("");
      setShowAddRep(false);
    } finally {
      setAddingRep(false);
    }
  };

  const set = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  if (selectedLead) return (
    <LeadDetail
      lead={selectedLead}
      onBack={() => setSelectedLead(null)}
      onUpdateLead={(updated) => setSelectedLead(updated)}
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#534AB7", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0, width: "fit-content" }}>
        ← Back to vendors
      </button>

      <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "20px 24px" }}>
        {!editing && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1918" }}>{vendor.name}</div>
                <div style={{ fontSize: 13, color: "#6B6A65", marginTop: 4 }}>Partner since {vendor.joinedDate}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, color: vendor.status === "Active" ? "#0F6E56" : "#6B7280", background: vendor.status === "Active" ? "#E1F5EE" : "#F3F4F6" }}>{vendor.status}</span>
                <button onClick={handleStartEdit} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>✏️ Edit</button>
                {isAdmin && (
                  <button onClick={() => setShowDeleteVendorConfirm(true)}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FFF5F5", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#991B1B", fontFamily: "inherit" }}>
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #F3F2EE" }}>
              {[["Total leads", vendorLeads.length], ["Active leads", activeLeads.length], ["Total value", fmtShort(totalValue)], ["Won value", fmtShort(wonValue)], ["Win rate", `${winRate}%`]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1918" }}>{val}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {editing && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1918", marginBottom: 16 }}>Editing vendor</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <EditField label="Vendor name">
                  <input value={editForm.name} onChange={e => set("name", e.target.value)} style={inp} />
                </EditField>
              </div>
              <EditField label="Status">
                <select value={editForm.status} onChange={e => set("status", e.target.value)} style={inp}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </EditField>
              <EditField label="Partner since">
                <input type="date" value={editForm.joinedDate} onChange={e => set("joinedDate", e.target.value)} style={inp} />
              </EditField>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Assigned reps</div>
                  {!showAddRep && (
                    <button type="button" onClick={() => setShowAddRep(true)}
                      style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "none", background: "#534AB7", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                      + Add rep
                    </button>
                  )}
                </div>

                {showAddRep && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input
                      autoFocus
                      value={newRepName}
                      onChange={e => setNewRepName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddRep(); if (e.key === "Escape") { setShowAddRep(false); setNewRepName(""); } }}
                      placeholder="Full name…"
                      style={{ ...inp, width: 200 }}
                    />
                    <button type="button" onClick={handleAddRep} disabled={addingRep || !newRepName.trim()}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {addingRep ? "Adding…" : "Add"}
                    </button>
                    <button type="button" onClick={() => { setShowAddRep(false); setNewRepName(""); }}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>
                      Cancel
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(allReps || []).map(rep => {
                    const selected = (editForm.reps || vendor.reps || []).includes(rep);
                    return (
                      <div key={rep} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button type="button"
                          onClick={() => {
                            const current = editForm.reps ?? vendor.reps ?? [];
                            const updated = selected ? current.filter(r => r !== rep) : [...current, rep];
                            set("reps", updated);
                          }}
                          style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${selected ? "#534AB7" : "#E5E4DF"}`, background: selected ? "#EEF0FF" : "#fff", color: selected ? "#534AB7" : "#6B6A65", fontSize: 12, fontWeight: selected ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                          {rep}
                        </button>
                        {isAdmin && (
                          <button type="button" onClick={() => setConfirmDeleteRep(rep)}
                            style={{ padding: "3px 8px", borderRadius: 20, border: "1px solid #FCA5A5", background: "#FFF5F5", fontSize: 11, cursor: "pointer", color: "#991B1B", fontFamily: "inherit" }}>
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(allReps || []).length === 0 && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>No reps yet. Use the Add rep button above to create one.</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #F3F2EE" }}>
              <button onClick={handleCancelEdit} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={savingEdit} style={{ flex: 2, padding: "9px", borderRadius: 8, border: "none", background: savingEdit ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: savingEdit ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {savingEdit ? "Saving…" : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918" }}>Leads from {vendor.name}</div>
      {vendorLeads.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>No leads from this vendor yet</div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8F7F4", borderBottom: "1px solid #E5E4DF" }}>
                {["Lead name","Rep","Value","Status","Priority","Received"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6B6A65", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorLeads.map((l, i) => (
                <tr key={l.id} onClick={() => setSelectedLead(l)}
                  style={{ borderBottom: "1px solid #F3F2EE", background: i % 2 === 0 ? "#fff" : "#FAFAF8", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F3F2EE"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFAF8"}>
                  <td style={{ padding: "11px 14px", fontWeight: 500, color: "#1A1918" }}>{l.leadName}{isOverdue(l.followUpDate) && <FollowUpBadge />}</td>
                  <td style={{ padding: "11px 14px", color: "#6B6A65" }}>{l.rep}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 600, color: "#1A1918" }}>{fmt(l.value)}</td>
                  <td style={{ padding: "11px 14px" }}><StatusBadge status={l.status} /></td>
                  <td style={{ padding: "11px 14px" }}><PriorityDot priority={l.priority} /></td>
                  <td style={{ padding: "11px 14px", color: "#9CA3AF" }}>{l.receivedAt}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid #E5E4DF", background: "#F8F7F4" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 12, color: "#1A1918" }} colSpan={2}>Total ({vendorLeads.length} leads)</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1A1918" }}>{fmt(totalValue)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showDeleteVendorConfirm && (
        <ConfirmDialog
          title="Delete this vendor?"
          message={`"${vendor.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete vendor"
          onConfirm={async () => { await onDelete(vendor.id); setShowDeleteVendorConfirm(false); onBack(); }}
          onCancel={() => setShowDeleteVendorConfirm(false)}
        />
      )}

      {confirmDeleteRep && (
        <ConfirmDialog
          title="Remove this rep?"
          message={`"${confirmDeleteRep}" will be permanently removed from the system.`}
          confirmLabel="Remove rep"
          onConfirm={async () => { await onDeleteRep(confirmDeleteRep); setConfirmDeleteRep(null); }}
          onCancel={() => setConfirmDeleteRep(null)}
        />
      )}
    </div>
  );
}