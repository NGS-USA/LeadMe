import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Vendors from "./pages/Vendors";
import Placeholder from "./pages/Placeholder";
import Reports from "./pages/Reports";
import LeadFormPanel from "./components/LeadFormPanel";
import { NAV_ITEMS, INITIAL_LEADS, INITIAL_VENDORS, INITIAL_REPS } from "./data/initial";
import { isOverdue, getNextId, today } from "./utils/helpers";

export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [reps, setReps] = useState(INITIAL_REPS);
  const [selectedLead, setSelectedLead] = useState(null);

  const currentItem = NAV_ITEMS.find(n => n.id === activeNav);
  const showNewLead = (activeNav === "dashboard" || activeNav === "leads") && !selectedLead;
  const overdueCount = leads.filter(l => isOverdue(l.followUpDate)).length;
  const vendorNames = vendors.map(v => v.name);

  const handleUpdateLead = (updated) => { setLeads(prev => prev.map(l => l.id === updated.id ? updated : l)); setSelectedLead(updated); };
  const handleUpdateVendor = (updated) => setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
  const handleSelectLead = (lead) => { setSelectedLead(lead); setActiveNav("leads"); };
  const handleAddVendor = (vendor) => setVendors(prev => [...prev, vendor]);

  const headerTitle = selectedLead ? selectedLead.leadName : currentItem?.label;
  const headerSub = selectedLead ? `${selectedLead.vendor} · ${selectedLead.rep}` : showNewLead ? `${leads.length} leads · Mock data` : activeNav === "vendors" ? `${vendors.length} vendors` : "Coming soon";

  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: "flex", height: "100vh", background: "#F8F7F4", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 210 : 52, flexShrink: 0, background: "#1A1918", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden" }}>
        <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {sidebarOpen
            ? <img src="/logo.png" alt="LeadTrack" style={{ height: 32, objectFit: "contain" }} />
            : <img src="/logo.png" alt="LeadTrack" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "contain" }} />
          }
          {sidebarOpen && <img src="/logo.png" alt="LeadTrack" style={{ height: 20, objectFit: "contain" }} />}
          {sidebarOpen && <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>LeadMe</span>}
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
            <LeadDetail lead={selectedLead} onBack={() => setSelectedLead(null)} onUpdateLead={handleUpdateLead} />
          ) : (
            <>
              {activeNav === "dashboard" && <Dashboard leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "leads" && <Leads leads={leads} onSelectLead={handleSelectLead} />}
              {activeNav === "conversations" && <Placeholder label="Conversations" />}
              {activeNav === "vendors" && <Vendors vendors={vendors} leads={leads} onAddVendor={handleAddVendor} onUpdateVendor={handleUpdateVendor} />}
              {activeNav === "reports" && <Reports leads={leads} />}
              {activeNav === "settings" && <Placeholder label="Settings" />}
            </>
          )}
        </div>
      </div>

      <LeadFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(lead) => setLeads(prev => [lead, ...prev])}
        vendors={vendorNames}
        reps={reps}
        onAddVendor={(name) => handleAddVendor({ id: getNextId(), name, status: "Active", joinedDate: today, conversations: [] })}
        onAddRep={(r) => setReps(prev => prev.includes(r) ? prev : [...prev, r])}
      />
    </div>
  );
}