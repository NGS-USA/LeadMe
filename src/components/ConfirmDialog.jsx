export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#6B6A65", marginBottom: 20, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ flex: 2, padding: "9px", borderRadius: 8, border: "none", background: "#991B1B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}