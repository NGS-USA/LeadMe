export const STATUS_CONFIG = {
  New:       { color: "#6B7280", bg: "#F3F4F6" },
  Contacted: { color: "#2563EB", bg: "#EFF6FF" },
  Active:    { color: "#0F6E56", bg: "#E1F5EE" },
  Proposal:  { color: "#854F0B", bg: "#FAEEDA" },
  Won:       { color: "#166534", bg: "#DCFCE7" },
  Lost:      { color: "#991B1B", bg: "#FEE2E2" },
};

export const PRIORITY_CONFIG = {
  High:   { color: "#991B1B" },
  Medium: { color: "#854F0B" },
  Low:    { color: "#6B7280" },
};

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "leads",     label: "Leads" },
  { id: "vendors",   label: "Vendors" },
  { id: "reports",   label: "Reports" },
  { id: "settings",  label: "Settings" },
];

export const EMPTY_LEAD_FORM = {
  leadName: "", vendor: "", rep: "", value: "",
  status: "New", priority: "Medium",
  receivedAt: new Date().toISOString().slice(0, 10),
  followUpDate: "",
};

export const EMPTY_CONVO_FORM = {
  date: new Date().toISOString().slice(0, 10),
  contactName: "", contactRole: "", method: "Phone",
  summary: "", outcome: "Positive", followUpDate: "",
};