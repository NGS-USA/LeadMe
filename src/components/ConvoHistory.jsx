import { isOverdue } from "../utils/helpers";

const outcomeColor = {
  Positive: "#166534",
  Neutral: "#854F0B",
  "Needs follow-up": "#2563EB",
  "Dead end": "#991B1B",
};

export default function ConvoHistory({ conversations }) {
  if (conversations.length === 0) return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF" }}>
      <div style={{ fontSize: 13 }}>No conversations logged yet</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>Click "Log Conversation" to add the first one</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {conversations.map((c) => (
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
  );
}