import { PRIORITY_CONFIG } from "../data/initial";

export default function PriorityDot({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: cfg.color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {priority}
    </span>
  );
}