import { useState, useEffect } from "react";

export default function MfaEnroll({ onEnroll, onConfirm, onSkip, onSignOut, forceMfa }) {
  const [step, setStep] = useState("intro"); // intro | scan | confirm
  const [enrollData, setEnrollData] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await onEnroll();
      setEnrollData(data);
      setStep("scan");
    } catch (err) {
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
    } catch (err) {
      setError("Invalid code. Make sure you scanned the QR code and try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 440, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="LeadTrack" style={{ height: 48, objectFit: "contain" }} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Intro step */}
          {step === "intro" && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Set up two-factor authentication</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>
                {forceMfa
                  ? "Your admin requires MFA for all accounts. Set it up to continue."
                  : "Add an extra layer of security to your account. You'll be reminded on each login until enrolled."}
              </div>
              <div style={{ background: "#F8F7F4", borderRadius: 10, padding: "14px 16px", marginBottom: 24, fontSize: 13, color: "#3d3d3a", lineHeight: 1.6 }}>
                You'll need an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong> installed on your phone.
              </div>
              <button onClick={handleStart} disabled={loading}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
                {loading ? "Setting up…" : "Set up authenticator"}
              </button>
              {!forceMfa && (
                <button onClick={onSkip}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, color: "#6B6A65", cursor: "pointer", fontFamily: "inherit" }}>
                  Skip for now
                </button>
              )}
            </>
          )}

          {/* Scan QR step */}
          {step === "scan" && enrollData && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Scan QR code</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>Open your authenticator app and scan this QR code.</div>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <img src={enrollData.totp.qr_code} alt="MFA QR Code" style={{ width: 180, height: 180, borderRadius: 8, border: "1px solid #E5E4DF" }} />
              </div>

              <div style={{ background: "#F8F7F4", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Can't scan? Enter this code manually:</div>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "#1A1918", letterSpacing: "0.1em", wordBreak: "break-all" }}>{enrollData.totp.secret}</div>
              </div>

              <button onClick={() => setStep("confirm")}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                I've scanned it → Enter code
              </button>
            </>
          )}

          {/* Confirm code step */}
          {step === "confirm" && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>Confirm setup</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>Enter the 6-digit code from your authenticator app to confirm setup.</div>

              <form onSubmit={handleConfirm} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="text" inputMode="numeric" pattern="[0-9 ]*" maxLength={7}
                  value={code} onChange={e => setCode(e.target.value)}
                  placeholder="000 000" autoFocus required
                  style={{ fontSize: 24, padding: "12px 16px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", width: "100%", boxSizing: "border-box", textAlign: "center", letterSpacing: "0.2em", fontFamily: "monospace" }}
                />
                {error && <div style={{ fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>{error}</div>}
                <button type="submit" disabled={loading || code.replace(/\s/g, "").length < 6}
                  style={{ padding: "10px", borderRadius: 8, border: "none", background: loading ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {loading ? "Confirming…" : "Confirm & enable MFA"}
                </button>
                <button type="button" onClick={() => setStep("scan")}
                  style={{ padding: "8px", borderRadius: 8, border: "none", background: "none", fontSize: 12, color: "#9CA3AF", cursor: "pointer", fontFamily: "inherit" }}>
                  ← Back to QR code
                </button>
              </form>
            </>
          )}

          {/* Done step */}
          {step === "done" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1918", marginBottom: 4 }}>MFA enabled</div>
                <div style={{ fontSize: 13, color: "#9CA3AF" }}>Your account is now protected with two-factor authentication.</div>
              </div>
              <button onClick={onSkip}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Continue to LeadTrack
              </button>
            </>
          )}
        </div>

        <button onClick={onSignOut} style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", fontSize: 12, color: "#9CA3AF", cursor: "pointer", fontFamily: "inherit" }}>
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}