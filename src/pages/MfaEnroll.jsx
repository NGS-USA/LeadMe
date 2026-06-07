import { useState, useEffect } from "react";

export default function MfaEnroll({ onEnroll, onConfirm, onSkip, onSignOut, forceMfa }) {
  const [step, setStep] = useState("intro");
  const [enrollData, setEnrollData] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartEnroll = async () => {
    setLoading(true);
    try {
      const data = await onEnroll();
      setEnrollData(data);
      setStep("scan");
    } catch {
      setError("Failed to start MFA setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onConfirm(enrollData.id, code.replace(/\s/g, ""));
      setStep("done");
    } catch {
      setError("Invalid code. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const wrap = {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100vh", background: "#F8F7F4",
    fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
  };

  const card = {
    background: "#fff", border: "1px solid #E5E4DF", borderRadius: 16,
    padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  };

  const inp = {
    fontSize: 13, padding: "10px 12px", borderRadius: 8,
    border: "1px solid #C5C4BF", outline: "none",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="LeadMe" style={{ height: 48, objectFit: "contain" }} />
        </div>

        <div style={card}>
          {step === "intro" && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Secure your account</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>
                {forceMfa
                  ? "Your admin requires MFA. Set up an authenticator app to continue."
                  : "Add an extra layer of security with an authenticator app."}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={handleStartEnroll} disabled={loading}
                  style={{ padding: "10px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {loading ? "Setting up…" : "Set up authenticator app"}
                </button>
                {!forceMfa && (
                  <button onClick={onSkip}
                    style={{ padding: "10px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", color: "#6B6A65", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    Skip for now
                  </button>
                )}
              </div>
            </>
          )}

          {step === "scan" && enrollData && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Scan QR code</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>Open your authenticator app and scan this code.</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <img src={enrollData.totp.qr_code} alt="MFA QR Code" style={{ width: 160, height: 160, borderRadius: 8, border: "1px solid #E5E4DF" }} />
              </div>
              <div style={{ background: "#F8F7F4", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Manual entry code:</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#1A1918", wordBreak: "break-all" }}>{enrollData.totp.secret}</div>
              </div>
              <button onClick={() => setStep("confirm")}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                I've scanned it →
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Enter verification code</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>Enter the 6-digit code from your authenticator app to confirm setup.</div>
              <form onSubmit={handleConfirm} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="000 000"
                  autoFocus
                  style={{ ...inp, fontSize: 28, textAlign: "center", letterSpacing: "0.2em", fontFamily: "monospace" }}
                />
                {error && (
                  <div style={{ fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setStep("scan")}
                    style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>
                    Back
                  </button>
                  <button type="submit" disabled={loading || code.replace(/\s/g, "").length < 6}
                    style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: loading ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {loading ? "Confirming…" : "Enable MFA"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === "done" && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>MFA enabled ✓</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>Your account is now protected with two-factor authentication.</div>
              <button onClick={onSkip}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Continue to LeadMe
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={onSignOut}
            style={{ fontSize: 12, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}