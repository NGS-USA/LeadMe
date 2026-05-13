import { useState } from "react";

export default function Login({ onEmailLogin, onMicrosoftLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onEmailLogin(email, password);
    } catch (err) {
      setError("Invalid email or password. Contact your admin if you need access.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    fontSize: 13, padding: "10px 12px", borderRadius: 8,
    border: "1px solid #C5C4BF", outline: "none",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="LeadTrack" style={{ height: 48, objectFit: "contain" }} />
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Sign in</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>Access is by invite only. Contact your admin if you need an account.</div>

          {/* Microsoft button — stubbed */}
          <button
            onClick={() => onMicrosoftLogin().catch(err => setError(err.message))}
            style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#F8F7F4", fontSize: 13, fontWeight: 600, cursor: "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, color: "#9CA3AF", opacity: 0.6 }}>
            <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            Sign in with Microsoft (coming soon)
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#E5E4DF" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#E5E4DF" }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required style={inp} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required style={inp} />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ padding: "10px", borderRadius: 8, border: "none", background: loading ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4 }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 20 }}>
          LeadTrack · For internal use only
        </div>
      </div>
    </div>
  );
}