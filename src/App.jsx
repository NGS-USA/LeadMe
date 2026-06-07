import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Placeholder from "./pages/Placeholder";
import Login from "./pages/Login";
import MfaVerify from "./pages/MfaVerify";
import MfaEnroll from "./pages/MfaEnroll";
import LeadFormPanel from "./components/LeadFormPanel";
import { NAV_ITEMS } from "./data/initial";
import { isOverdue } from "./utils/helpers";
import { useData } from "./hooks/useData";
import { useAuth } from "./hooks/useAuth";
import { databases, db, col, Query } from "./lib/appwrite";

export default function App() {
  const {
    user, session, loading: authLoading, mfaRequired,
    signInWithEmail, signInWithMicrosoft, signOut,
    verifyMfa, enrollMfa, confirmMfaEnrollment,
    unenrollMfa, checkMfaEnrolled,
  } = useAuth();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [authStep, setAuthStep] = useState("idle");
  const [mfaEnrolled, setMfaEnrolled] = useState(null);
  const [forceMfa, setForceMfa] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    leads, vendors, reps, loading: dataLoading, error,
    addLead, updateLead, deleteLead,
    addVendor, updateVendor, updateVendorReps, deleteVendor,
    addRep, deleteRep,
  } = useData();

  useEffect(() => {
    if (!user) { setAuthStep("idle"); setMfaEnrolled(null); return; }
  }, [user]);

  useEffect(() => {
    if (mfaRequired && user) {
      checkPostLoginMfa();
    }
  }, [mfaRequired]);

  useEffect(() => {
    if (!user) return;
    databases.listDocuments(db, col.profiles, [Query.equal("user_id", user.$id)])
      .then(res => {
        const profile = res.documents[0];
        setIsAdmin(profile?.role === "admin");
      })
      .catch(() => {});
  }, [user]);

  const checkPostLoginMfa = async () => {
    const enrolled = await checkMfaEnrolled();
    setMfaEnrolled(enrolled);
    try {
      const res = await databases.listDocuments(db, col.settings, [Query.equal("key", "force_mfa")]);
      const force = res.documents[0]?.value === "true";
      setForceMfa(force);
    } catch {}
    if (enrolled) {
      setAuthStep("mfa_verify");
    } else {
      setAuthStep("mfa_enroll");
    }
  };

  const handleMfaVerified = () => setAuthStep("idle");
  const handleMfaSkip = () => setAuthStep("idle");

  const currentItem = NAV_ITEMS.find(n => n.id === activeNav);
  const showNewLead = (activeNav === "dashboard" || activeNav === "leads") && !selectedLead;
  const overdueCount = leads.filter(l => isOverdue(l.followUpDate)).length;
  const vendorNames = vendors.map(v => v.name);

  const handleUpdateLead = async (updated) => { await updateLead(updated); setSelectedLead(updated); };
  const handleSelectLead = (lead) => { setSelectedLead(lead); setActiveNav("leads"); };

  const headerTitle = selectedLead ? selectedLead.leadName : currentItem?.label;
  const headerSub = selectedLead
    ? `${selectedLead.vendor} · ${selectedLead.rep}`
    : showNewLead ? `${leads.length} leads`
    : activeNav === "vendors" ? `${vendors.length} vendors`
    : activeNav === "settings" ? "Manage your account and security"
    : "Coming soon";

  if (authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #E5E4DF", borderTop: "3px solid #534AB7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Login onEmailLogin={signInWithEmail} onMicrosoftLogin={signInWithMicrosoft} />;

  if (authStep === "mfa_verify") return (
    <MfaVerify onVerify={async (code) => { await verifyMfa(code); handleMfaVerified(); }} onSignOut={signOut} />
  );

  if (authStep === "mfa_enroll") return (
    <MfaEnroll
      onEnroll={enrollMfa}
      onConfirm={confirmMfaEnrollment}
      onSkip={handleMfaSkip}
      onSignOut={signOut}
      forceMfa={forceMfa}
    />
  );

  if (dataLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #E5E4DF", borderTop: "3px solid #534AB7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 13, color: "#9CA3AF" }}>Loading LeadMe…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#991B1B" }}>Failed to connect to database</div>
      <div style={{ fontSize: 13, color: "#9CA3AF" }}>{error}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: "flex", height: "100vh", background: "#F8F7F4", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 210 : 52, flexShrink: 0, background: "#223255", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden" }}>
        <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {sidebarOpen
            ? <img src="/logo.png" alt="LeadMe" style={{ width: "100%", objectFit: "contain" }} />
            : <img src="/logo.png" alt="LeadMe" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "contain" }} />
          }
        </div>
        <nav style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setActiveNav(item.id); setSelectedLead(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: 7, border: "none", cursor: "pointer", background: activeNav === item.id ? "rgba(83,74,183,0.25)" : "transparent", color: activeNav === item.id ? "#A09CF5" : "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400, textAlign: "left", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>
                {item.id === "dashboard" ? "▦" : item.id === "leads" ? "☰" : item.id === "vendors" ? "🏢" : item.id === "reports" ? "📊" : "⚙️"}
              </span>
              {sidebarOpen && item.label}
              {item.id === "dashboard" && overdueCount > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "#991B1B", color: "#fff" }}>{overdueCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User + sign out */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {sidebarOpen && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", padding: "4px 8px", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          )}
          <button onClick={signOut}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 9px", borderRadius: 7, border: "none", background: "transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, textAlign: "left", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 15 }}>↪</span>
            {sidebarOpen && "Sign out"}
          </button>
        </div>

        <button onClick={() => setSidebarOpen(o => !o)} style={{ margin: "8px", padding: 7, borderRadius: 7, border: "none", background: "#ffffff0f", color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: "1px solid #E5E4DF", background: "#fff", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1918" }}>{headerTitle}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{headerSub}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {showNewLead && (
              <button onClick={() => setFormOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#534AB7", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                + New lead
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {selectedLead ? (
            <LeadDetail
              lead={selectedLead}
              onBack={() => setSelectedLead(null)}
              onUpdateLead={handleUpdateLead}
              vendors={vendorNames}
              vendorObjects={vendors}
              reps={reps}
              onAddVendor={(name) => addVendor(name)}
              onAddRep={addRep}
              onDelete={async (id) => { await deleteLead(id); setSelectedLead(null); }}
              isAdmin={isAdmin}
            />
          ) : (
            <>
              {activeNav === "dashboard" && <Dashboard leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "leads" && <Leads leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "vendors" && (
                <Vendors
                  vendors={vendors}
                  leads={leads}
                  onAddVendor={addVendor}
                  onUpdateVendor={updateVendor}
                  allReps={reps}
                  onUpdateVendorReps={updateVendorReps}
                  onDeleteVendor={deleteVendor}
                  onDeleteRep={deleteRep}
                  onAddRep={addRep}
                  isAdmin={isAdmin}
                />
              )}
              {activeNav === "reports" && <Reports leads={leads} />}
              {activeNav === "settings" && (
                <Settings
                  user={user}
                  onEnroll={enrollMfa}
                  onConfirmEnrollment={confirmMfaEnrollment}
                  onUnenroll={unenrollMfa}
                  onCheckMfaEnrolled={checkMfaEnrolled}
                />
              )}
            </>
          )}
        </div>
      </div>

      <LeadFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addLead}
        vendors={vendorNames}
        vendorObjects={vendors}
        reps={reps}
        onAddVendor={(name) => addVendor(name)}
        onAddRep={addRep}
      />
    </div>
  );
}