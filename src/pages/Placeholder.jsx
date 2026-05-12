export default function Placeholder({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#9CA3AF", gap: 12 }}>
      <div style={{ fontSize: 36, opacity: 0.3 }}>⬜</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Coming in the next version</div>
    </div>
  );
}