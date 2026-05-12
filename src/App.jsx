import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Placeholder from "./pages/Placeholder";
import LeadFormPanel from "./components/LeadFormPanel";
import { NAV_ITEMS } from "./data/initial";
import { isOverdue } from "./utils/helpers";
import { useData } from "./hooks/useData";

export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const {
    leads, vendors, reps, loading, error,
    addLead, updateLead,
    addVendor, updateVendor,
    addRep,
    addLeadConversation, addVendorConversation,
  } = useData();

  const currentItem = NAV_ITEMS.find(n => n.id === activeNav);
  const showNewLead = (activeNav === "dashboard" || activeNav === "leads") && !selectedLead;
  const overdueCount = leads.filter(l => isOverdue(l.followUpDate)).length;
  const vendorNames = vendors.map(v => v.name);

  const handleUpdateLead = async (updated) => {
    await updateLead(updated);
    setSelectedLead(updated);
  };

  const handleSelectLead = (lead) => { setSelectedLead(lead); setActiveNav("leads"); };

  const headerTitle = selectedLead ? selectedLead.leadName : currentItem?.label;
  const headerSub = selectedLead
    ? `${selectedLead.vendor} · ${selectedLead.rep}`
    : showNewLead ? `${leads.length} leads`
    : activeNav === "vendors" ? `${vendors.length} vendors`
    : "Coming soon";

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #E5E4DF", borderTop: "3px solid #534AB7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 13, color: "#9CA3AF" }}>Loading LeadTrack…</div>
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
      <div style={{ width: sidebarOpen ? 210 : 52, flexShrink: 0, background: "#1A1918", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden" }}>
        <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {sidebarOpen
            {sidebarOpen
            ? <img src="/logo.png" alt="LeadTrack" style={{ width: "100%", objectFit: "contain" }} />
            : <img src="/logo.png" alt="LeadTrack" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "contain" }} />
          }
        </div>
        <nav style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setActiveNav(item.id); setSelectedLead(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 9px", borderRadius: 7, border: "none", cursor: "pointer", background: activeNav === item.id ? "rgba(83,74,183,0.25)" : "transparent", color: activeNav === item.id ? "#A09CF5" : "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400, textAlign: "left", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>
                {item.id === "dashboard" ? "▦" : item.id === "leads" ? "☰" : item.id === "conversations" ? "💬" : item.id === "vendors" ? "🏢" : item.id === "reports" ? "📊" : "⚙️"}
              </span>
              {sidebarOpen && item.label}
              {item.id === "dashboard" && overdueCount > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "#991B1B", color: "#fff" }}>{overdueCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(o => !o)} style={{ margin: "8px", padding: 7, borderRadius: 7, border: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
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
              onAddConversation={addLeadConversation}
            />
          ) : (
            <>
              {activeNav === "dashboard" && <Dashboard leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "leads" && <Leads leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "conversations" && <Placeholder label="Conversations" />}
              {activeNav === "vendors" && (
                <Vendors
                  vendors={vendors}
                  leads={leads}
                  onAddVendor={addVendor}
                  onUpdateVendor={updateVendor}
                  onAddVendorConversation={addVendorConversation}
                />
              )}
              {activeNav === "reports" && <Reports leads={leads} />}
              {activeNav === "settings" && <Placeholder label="Settings" />}
            </>
          )}
        </div>
      </div>

      <LeadFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addLead}
        vendors={vendorNames}
        reps={reps}
        onAddVendor={(name) => addVendor(name)}
        onAddRep={addRep}
      />
    </div>
  );
}