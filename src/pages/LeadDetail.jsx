import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import PriorityDot from "../components/PriorityDot";
import FollowUpBadge from "../components/FollowUpBadge";
import ConvoForm from "../components/ConvoForm";
import ConvoHistory from "../components/ConvoHistory";
import { fmt, isOverdue, sendFollowUpEmail } from "../utils/helpers";

export default function LeadDetail({ lead, onBack, onUpdateLead }) {
  const [showConvoForm, setShowConvoForm] = useState(false);

  const handleAddConvo = (convo) => {
    const updatedLead = {
      ...lead,
      conversations: [convo, ...lead.conversations],
      followUpDate: convo.followUpDate || lead.followUpDate,
    };
    onUpdateLead(updatedLead);
    if (convo.followUpDate) sendFollowUpEmail({ repName: lead.rep, leadName: lead.leadName, followUpDate: convo.followUpDate });
    setShowConvoForm(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#534AB7", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0, width: "fit-content" }}>
        ← Back to leads
      </button>

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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918" }}>Conversation Log</div>
        {!showConvoForm && (
          <button onClick={() => setShowConvoForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#534AB7", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
            + Log Conversation
          </button>
        )}
      </div>

      {showConvoForm && <ConvoForm onSubmit={handleAddConvo} onCancel={() => setShowConvoForm(false)} context={lead.leadName} />}
      <ConvoHistory conversations={lead.conversations} />
    </div>
  );
}