import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Settings({ user, onEnroll, onConfirmEnrollment, onUnenroll, onCheckMfaEnrolled }) {
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [forceMfa, setForceMfa] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("idle"); // idle | enroll | scan | confirm | unenroll
  const [enrollData, setEnrollData] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const enrolled = await onCheckMfaEnrolled();
      setMfaEnrolled(enrolled);

      // Check admin status and force MFA setting
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, force_mfa")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsAdmin(profile.role === "admin");
      }

      // Get global force MFA setting
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "force_mfa")
        .single();

      if (setting) setForceMfa(setting.value === "true");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEnroll = async () => {
    setError(null);
    setSaving(true);
    try {
      const data = await onEnroll();
      setEnrollData(data);
      setStep("scan");
    } catch (err) {
      setError("Failed to start MFA setup.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmEnroll = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onConfirmEnrollment(enrollData.id, code.replace(/\s/g, ""));
      setMfaEnrolled(true);
      setStep("idle");
      setCode("");
      setSuccess("MFA has been enabled on your account.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError("Invalid code. Please try again.");
      setCode("");
    } finally {
      setSaving(false);
    }
  };

  const handleUnenroll = async () => {
    setError(null);
    setSaving(true);
    try {
      await onUnenroll();
      setMfaEnrolled(false);
      setStep("idle");
      setSuccess("MFA has been removed from your account.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError("Failed to remove MFA.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleForceMfa = async () => {
    setSaving(true);
    const newVal = !forceMfa;
    try {
      await supabase.from("settings").upsert({ key: "force_mfa", value: String(newVal) });
      setForceMfa(newVal);
      setSuccess(`Force MFA ${newVal ? "enabled" : "disabled"} for all users.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError("Failed to update setting.");
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E4DF", fontSize: 13, fontWeight: 700, color: "#1A1918" }}>{title}</div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );

  const inp = { fontSize: 13, padding: "10px 12px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", width: "100%", boxSizing: "border-box" };

  if (loading) return <div style={{ fontSize: 13, color: "#9CA3AF", padding: 20 }}>Loading settings…</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>

      {success && (
        <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#166534", marginBottom: 16 }}>
          {success}
        </div>
      )}

      {/* Account info */}
      <Section title="Account">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Signed in as</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1918" }}>{user.email}</div>
        </div>
      </Section>

      {/* MFA settings */}
      <Section title="Two-factor authentication">
        {step === "idle" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1918", marginBottom: 4 }}>
                  Authenticator app
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: mfaEnrolled ? "#166534" : "#6B7280", background: mfaEnrolled ? "#DCFCE7" : "#F3F4F6" }}>
                    {mfaEnrolled ? "ENABLED" : "NOT SET UP"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {mfaEnrolled ? "Your account is protected with Google Authenticator or Authy." : "Use an authenticator app to add a second layer of security."}
                </div>
              </div>
              {mfaEnrolled ? (
                <button onClick={() => setStep("unenroll")}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FFF5F5", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#991B1B", fontFamily: "inherit" }}>
                  Remove MFA
                </button>
              ) : (
                <button onClick={handleStartEnroll} disabled={saving}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#534AB7", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>
                  {saving ? "Setting up…" : "Set up MFA"}
                </button>
              )}
            </div>
            {error && <div style={{ marginTop: 12, fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>{error}</div>}
          </>
        )}

        {step === "scan" && enrollData && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: "#3d3d3a" }}>Scan this QR code in your authenticator app, then click continue.</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img src={enrollData.totp.qr_code} alt="MFA QR Code" style={{ width: 160, height: 160, borderRadius: 8, border: "1px solid #E5E4DF" }} />
            </div>
            <div style={{ background: "#F8F7F4", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Manual entry code:</div>
              <div style={{ fontSize: 12, fontFamily: "monospace", color: "#1A1918", wordBreak: "break-all" }}>{enrollData.totp.secret}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("idle")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => setStep("confirm")} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: "#534AB7", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>I've scanned it →</button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <form onSubmit={handleConfirmEnroll} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#3d3d3a" }}>Enter the 6-digit code from your authenticator app to confirm.</div>
            <input type="text" inputMode="numeric" maxLength={7} value={code} onChange={e => setCode(e.target.value)}
              placeholder="000 000" autoFocus
              style={{ ...inp, fontSize: 22, textAlign: "center", letterSpacing: "0.2em", fontFamily: "monospace" }} />
            {error && <div style={{ fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setStep("scan")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Back</button>
              <button type="submit" disabled={saving || code.replace(/\s/g, "").length < 6} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: saving ? "#A09CF5" : "#534AB7", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", color: "#fff", fontFamily: "inherit" }}>
                {saving ? "Confirming…" : "Enable MFA"}
              </button>
            </div>
          </form>
        )}

        {step === "unenroll" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#FEF9C3", border: "1px solid #FEF08A", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#854F0B" }}>
              Removing MFA will make your account less secure. Are you sure?
            </div>
            {error && <div style={{ fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("idle")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleUnenroll} disabled={saving} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: "#991B1B", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", color: "#fff", fontFamily: "inherit" }}>
                {saving ? "Removing…" : "Yes, remove MFA"}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Admin section */}
      {isAdmin && (
        <Section title="Admin — Security settings">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1918", marginBottom: 4 }}>Force MFA for all users</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>When enabled, users must set up MFA before accessing the app. They cannot skip.</div>
            </div>
            <button onClick={handleToggleForceMfa} disabled={saving}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${forceMfa ? "#FCA5A5" : "#534AB7"}`, background: forceMfa ? "#FFF5F5" : "#534AB7", fontSize: 12, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", color: forceMfa ? "#991B1B" : "#fff", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {forceMfa ? "Disable forced MFA" : "Force MFA for all"}
            </button>
          </div>
        </Section>
      )}

    </div>
  );
}