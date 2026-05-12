import { STATUS_CONFIG } from "../data/initial";

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: cfg.color, background: cfg.bg, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}