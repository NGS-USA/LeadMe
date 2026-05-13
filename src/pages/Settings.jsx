import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { adminApi } from "../lib/adminApi";
import { STATUS_CONFIG } from "../data/initial";

function Section({ title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E4DF", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E4DF" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1918" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div style={{ background: type === "error" ? "#FEE2E2" : "#DCFCE7", border: `1px solid ${type === "error" ? "#FCA5A5" : "#BBF7D0"}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: type === "error" ? "#991B1B" : "#166534", marginBottom: 16 }}>
      {message}
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #F3F2EE" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1918" }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{description}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: value ? "#534AB7" : "#E5E4DF", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
        <span style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

// ── MFA Section ───────────────────────────────────────────────────────────────
function MfaSection({ onEnroll, onConfirmEnrollment, onUnenroll, onCheckMfaEnrolled }) {
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("idle");
  const [enrollData, setEnrollData] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    onCheckMfaEnrolled().then(enrolled => { setMfaEnrolled(enrolled); setLoading(false); });
  }, []);

  const flash = (msg, type = "success") => {
    if (type === "success") setSuccess(msg); else setError(msg);
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  };

  const handleStartEnroll = async () => {
    setSaving(true);
    try { const data = await onEnroll(); setEnrollData(data); setStep("scan"); }
    catch { flash("Failed to start MFA setup.", "error"); }
    finally { setSaving(false); }
  };

  const handleConfirmEnroll = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      await onConfirmEnrollment(enrollData.id, code.replace(/\s/g, ""));
      setMfaEnrolled(true); setStep("idle"); setCode("");
      flash("MFA has been enabled on your account.");
    } catch { setError("Invalid code. Please try again."); setCode(""); }
    finally { setSaving(false); }
  };

  const handleUnenroll = async () => {
    setSaving(true);
    try { await onUnenroll(); setMfaEnrolled(false); setStep("idle"); flash("MFA has been removed."); }
    catch { flash("Failed to remove MFA.", "error"); }
    finally { setSaving(false); }
  };

  const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" };

  if (loading) return <div style={{ fontSize: 13, color: "#9CA3AF" }}>Loading…</div>;

  return (
    <>
      {success && <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534", marginBottom: 12 }}>{success}</div>}
      {step === "idle" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1918", marginBottom: 4 }}>
              Authenticator app
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: mfaEnrolled ? "#166534" : "#6B7280", background: mfaEnrolled ? "#DCFCE7" : "#F3F4F6" }}>
                {mfaEnrolled ? "ENABLED" : "NOT SET UP"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{mfaEnrolled ? "Your account is protected with an authenticator app." : "Add a second layer of security to your account."}</div>
          </div>
          {mfaEnrolled
            ? <button onClick={() => setStep("unenroll")} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FFF5F5", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#991B1B", fontFamily: "inherit" }}>Remove MFA</button>
            : <button onClick={handleStartEnroll} disabled={saving} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#534AB7", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>{saving ? "Setting up…" : "Set up MFA"}</button>
          }
        </div>
      )}
      {step === "scan" && enrollData && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: "#3d3d3a" }}>Scan this QR code in your authenticator app.</div>
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
          <div style={{ fontSize: 13, color: "#3d3d3a" }}>Enter the 6-digit code from your authenticator app.</div>
          <input type="text" inputMode="numeric" maxLength={7} value={code} onChange={e => setCode(e.target.value)} placeholder="000 000" autoFocus
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
          <div style={{ background: "#FEF9C3", border: "1px solid #FEF08A", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#854F0B" }}>Removing MFA will make your account less secure. Are you sure?</div>
          {error && <div style={{ fontSize: 12, color: "#991B1B", background: "#FEE2E2", padding: "10px 12px", borderRadius: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep("idle")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={handleUnenroll} disabled={saving} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: "#991B1B", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", color: "#fff", fontFamily: "inherit" }}>
              {saving ? "Removing…" : "Yes, remove MFA"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── User Management Section ───────────────────────────────────────────────────
function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: null, type: "success" });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("rep");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadUsers(); }, []);

  const flash = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: "success" }), 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { users } = await adminApi.listUsers();
      setUsers(users);
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.inviteUser(inviteEmail, inviteRole);
      flash(`Invite sent to ${inviteEmail}`);
      setInviteEmail(""); setInviteRole("rep"); setShowInviteForm(false);
      loadUsers();
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (email) => {
    try { await adminApi.resetPassword(email); flash(`Password reset email sent to ${email}`); }
    catch (err) { flash(err.message, "error"); }
  };

  const handleResetMfa = async (userId, email) => {
    try { await adminApi.resetMfa(userId); flash(`MFA reset for ${email}`); loadUsers(); }
    catch (err) { flash(err.message, "error"); }
  };

  const handleUpdateRole = async (userId, role) => {
    try { await adminApi.updateRole(userId, role); setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u)); flash("Role updated"); }
    catch (err) { flash(err.message, "error"); }
  };

  const handleDeleteUser = async (userId) => {
    try { await adminApi.deleteUser(userId); setUsers(prev => prev.filter(u => u.id !== userId)); setConfirmDelete(null); flash("User deleted"); }
    catch (err) { flash(err.message, "error"); }
  };

  const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", background: "#fff", boxSizing: "border-box" };

  return (
    <>
      <Toast message={toast.message} type={toast.type} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        {showInviteForm ? (
          <form onSubmit={handleInvite} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" required style={{ ...inp, width: 220 }} />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ ...inp, width: 110 }}>
              <option value="rep">Rep</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" disabled={saving} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: saving ? "#A09CF5" : "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? "Sending…" : "Send invite"}
            </button>
            <button type="button" onClick={() => setShowInviteForm(false)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
          </form>
        ) : (
          <button onClick={() => setShowInviteForm(true)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Invite user</button>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: 20 }}>Loading users…</div>
      ) : (
        <div style={{ border: "1px solid #E5E4DF", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8F7F4", borderBottom: "1px solid #E5E4DF" }}>
                {["Email","Role","MFA","Last sign in","Actions"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#6B6A65", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #F3F2EE", background: i % 2 === 0 ? "#fff" : "#FAFAF8" }}>
                  <td style={{ padding: "11px 14px", color: "#1A1918", fontWeight: 500 }}>{u.email}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <select value={u.role} onChange={e => handleUpdateRole(u.id, e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #E5E4DF", background: "#fff", cursor: "pointer" }}>
                      <option value="rep">Rep</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: u.mfa_enabled ? "#166534" : "#6B7280", background: u.mfa_enabled ? "#DCFCE7" : "#F3F4F6" }}>
                      {u.mfa_enabled ? "Enabled" : "Not set up"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", color: "#9CA3AF", fontSize: 12 }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never"}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => handleResetPassword(u.email)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #E5E4DF", background: "#fff", fontSize: 11, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit", whiteSpace: "nowrap" }}>Reset password</button>
                      {u.mfa_enabled && <button onClick={() => handleResetMfa(u.id, u.email)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #E5E4DF", background: "#fff", fontSize: 11, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit", whiteSpace: "nowrap" }}>Reset MFA</button>}
                      <button onClick={() => setConfirmDelete(u)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #FCA5A5", background: "#FFF5F5", fontSize: 11, cursor: "pointer", color: "#991B1B", fontFamily: "inherit" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 380, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918", marginBottom: 8 }}>Delete user?</div>
            <div style={{ fontSize: 13, color: "#6B6A65", marginBottom: 20 }}>This will permanently delete <strong>{confirmDelete.email}</strong>. This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid #E5E4DF", background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B6A65", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => handleDeleteUser(confirmDelete.id)} style={{ flex: 2, padding: "9px", borderRadius: 8, border: "none", background: "#991B1B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Yes, delete user</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── App Settings Section ──────────────────────────────────────────────────────
function AppSettingsSection() {
  const [settings, setSettings] = useState({
    default_lead_status: "New",
    default_lead_priority: "Medium",
    notify_followup_day_of: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from("settings").select("key, value")
      .in("key", ["default_lead_status", "default_lead_priority", "notify_followup_day_of"]);
    if (data) {
      const map = {};
      data.forEach(s => { map[s.key] = s.key === "notify_followup_day_of" ? s.value === "true" : s.value; });
      setSettings(prev => ({ ...prev, ...map }));
    }
    setLoading(false);
  };

  const saveSetting = async (key, value) => {
    setSaving(true);
    await supabase.from("settings").upsert({ key, value: String(value) });
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess("Settings saved");
    setTimeout(() => setSuccess(null), 3000);
    setSaving(false);
  };

  const inp = { fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #C5C4BF", outline: "none", background: "#fff", boxSizing: "border-box" };

  if (loading) return <div style={{ fontSize: 13, color: "#9CA3AF" }}>Loading…</div>;

  return (
    <>
      {success && <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#166534", marginBottom: 16 }}>{success}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>Default lead status</label>
            <select value={settings.default_lead_status} onChange={e => saveSetting("default_lead_status", e.target.value)} style={inp}>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#1A1918" }}>Default lead priority</label>
            <select value={settings.default_lead_priority} onChange={e => saveSetting("default_lead_priority", e.target.value)} style={inp}>
              {["High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #F3F2EE", paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1918", marginBottom: 12 }}>Follow-up reminders</div>
          <ToggleRow
            label="Notify on the day of follow-up"
            description="Highlights overdue leads in the dashboard and lead table"
            value={settings.notify_followup_day_of}
            onChange={v => saveSetting("notify_followup_day_of", v)}
          />
        </div>
      </div>
    </>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings({ user, onEnroll, onConfirmEnrollment, onUnenroll, onCheckMfaEnrolled }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [forceMfa, setForceMfa] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  useEffect(() => { loadSettings(); }, []);

  const flash = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: "success" }), 4000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setIsAdmin(profile?.role === "admin");
      const { data: setting } = await supabase.from("settings").select("value").eq("key", "force_mfa").single();
      if (setting) setForceMfa(setting.value === "true");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleForceMfa = async () => {
    setSaving(true);
    const newVal = !forceMfa;
    try {
      await supabase.from("settings").upsert({ key: "force_mfa", value: String(newVal) });
      setForceMfa(newVal);
      flash(`Force MFA ${newVal ? "enabled" : "disabled"} for all users.`);
    } catch { flash("Failed to update setting.", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ fontSize: 13, color: "#9CA3AF", padding: 20 }}>Loading settings…</div>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Toast message={toast.message} type={toast.type} />

      <Section title="Account">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Signed in as</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1918" }}>{user.email}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Role: {isAdmin ? "Admin" : "Rep"}</div>
        </div>
      </Section>

      <Section title="Two-factor authentication">
        <MfaSection onEnroll={onEnroll} onConfirmEnrollment={onConfirmEnrollment} onUnenroll={onUnenroll} onCheckMfaEnrolled={onCheckMfaEnrolled} />
      </Section>

      {isAdmin && (
        <>
          <Section title="App settings" subtitle="Defaults applied when creating new leads">
            <AppSettingsSection />
          </Section>

          <Section title="Security" subtitle="Platform-wide security policies">
            <ToggleRow
              label="Force MFA for all users"
              description="Users must set up MFA before accessing the app and cannot skip"
              value={forceMfa}
              onChange={handleToggleForceMfa}
            />
          </Section>

          <Section title="User management" subtitle="Invite and manage team members">
            <UserManagementSection />
          </Section>
        </>
      )}
    </div>
  );
}