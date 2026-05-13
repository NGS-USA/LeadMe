import { useState } from "react";

export default function MfaVerify({ onVerify, onSignOut }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onVerify(code.replace(/\s/g, ""));
    } catch (err) {
      setError("Invalid code. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="LeadTrack" style={{ height: 48, objectFit: "contain" }} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Two-factor authentication</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>Open your authenticator app and enter the 6-digit code for LeadTrack.</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>Authenticator code</label>
              <input
                type="text" inputMode="numeric" pattern="[0-9 ]*" maxLength={7}
                value={code} onChange={e => setCode(e.target.value)}
                placeholder="000 000" autoFocus required
                style={{ fontSize: 24, padding: "12px 16px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", width: "100%", boxSizing: "border-box", textAlign: "center", letterSpacing: "0.2em", fontFamily: "monospace" }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || code.replace(/\s/g, "").length < 6}
              style={{ padding: "10px", borderRadius: 8, border: "none", background: loading ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4 }}>
              {loading ? "Verifying…" : "Verify"}
            </button>
          </form>

          <button onClick={onSignOut} style={{ width: "100%", marginTop: 16, padding: "8px", borderRadius: 8, border: "none", background: "none", fontSize: 12, color: "#9CA3AF", cursor: "pointer", fontFamily: "inherit" }}>
            ← Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}