export default function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, padding: "18px 20px", borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 11, color: "#6B6A65", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1A1918", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#6B6A65", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}