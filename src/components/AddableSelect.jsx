import { useState } from "react";

export default function AddableSelect({ value, onChange, options, onAddNew, placeholder }) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");

  const handleAdd = () => {
    const t = newVal.trim();
    if (!t) return;
    onAddNew(t); onChange(t); setNewVal(""); setAdding(false);
  };

  if (adding) return (
    <div style={{ display: "flex", gap: 6 }}>
      <input autoFocus value={newVal} onChange={e => setNewVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
        placeholder={`New ${placeholder}...`}
        style={{ flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none" }} />
      <button onClick={handleAdd} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
      <button onClick={() => setAdding(false)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 12, cursor: "pointer", color: "#6B6A65" }}>Cancel</button>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => e.target.value === "__add__" ? setAdding(true) : onChange(e.target.value)}
        style={{ width: "100%", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", background: "#fff", appearance: "none", cursor: "pointer" }}>
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__add__">+ Add new {placeholder.toLowerCase()}…</option>
      </select>
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9CA3AF", pointerEvents: "none" }}>▼</span>
    </div>
  );
}