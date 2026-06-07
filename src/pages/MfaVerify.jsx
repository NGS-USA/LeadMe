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
    } catch {
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
          <img src="/logo.png" alt="LeadMe" style={{ height: 48, objectFit: "contain" }} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Two-factor authentication</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>Enter the 6-digit code from your authenticator app.</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={7}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="000 000"
              autoFocus
              style={{ fontSize: 28, textAlign: "center", letterSpacing: "0.2em", fontFamily: "monospace", padding: "12px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none" }}
            />

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
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={onSignOut} style={{ fontSize: 12, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}