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
  { id: "dashboard",     label: "Dashboard" },
  { id: "leads",         label: "Leads" },
  { id: "conversations", label: "Conversations" },
  { id: "vendors",       label: "Vendors" },
  { id: "reports",       label: "Reports" },
  { id: "settings",      label: "Settings" },
];

export const EMPTY_LEAD_FORM = {
  leadName: "", vendor: "", rep: "", value: "",
  status: "New", priority: "Medium",
  receivedAt: new Date().toISOString().slice(0, 10),
  followUpDate: "", conversations: [],
};

export const EMPTY_CONVO_FORM = {
  date: new Date().toISOString().slice(0, 10),
  contactName: "", contactRole: "", method: "Phone",
  summary: "", outcome: "Positive", followUpDate: "",
};

export const INITIAL_REPS = ["Zachary Johnson", "Noorinder Brar", "Steve Massey", "Ryan Kopiske"];

export const INITIAL_VENDORS = [
  { id: 1, name: "Cyber Power", status: "Active", joinedDate: "2024-01-15", conversations: [] },
  { id: 2, name: "3CX", status: "Active", joinedDate: "2024-03-01", conversations: [] },
  { id: 3, name: "SonicWall", status: "Active", joinedDate: "2024-02-10", conversations: [] },
  { id: 4, name: "Zen Health", status: "Inactive", joinedDate: "2024-04-05", conversations: [] },
];

export const INITIAL_LEADS = [
  { id: 1, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "General Trade", value: 700000, status: "Active", priority: "High", receivedAt: "2025-04-01", followUpDate: "2025-05-12", conversations: [] },
  { id: 2, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Dabos", value: 14000, status: "Proposal", priority: "Medium", receivedAt: "2025-04-10", followUpDate: null, conversations: [] },
  { id: 3, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Capital Farm Credit", value: 1849.99, status: "Contacted", priority: "Low", receivedAt: "2025-04-15", followUpDate: "2025-05-15", conversations: [] },
  { id: 4, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Omega International LLC", value: 1306.28, status: "New", priority: "Low", receivedAt: "2025-05-01", followUpDate: null, conversations: [] },
  { id: 5, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "SEMTech Solutions", value: 3200, status: "Won", priority: "Medium", receivedAt: "2025-03-20", followUpDate: null, conversations: [] },
  { id: 6, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "U.S. Army", value: 40446, status: "Active", priority: "High", receivedAt: "2025-03-15", followUpDate: "2025-05-10", conversations: [] },
  { id: 7, vendor: "3CX", rep: "Noorinder Brar", leadName: "The Sea Pines Resort", value: 3000, status: "Proposal", priority: "Medium", receivedAt: "2025-04-20", followUpDate: null, conversations: [] },
  { id: 8, vendor: "SonicWall", rep: "Steve Massey", leadName: "Sonrisas Dentistry", value: 525.24, status: "Won", priority: "Low", receivedAt: "2025-03-10", followUpDate: null, conversations: [] },
  { id: 9, vendor: "Zen Health", rep: "Ryan Kopiske", leadName: "Lifeworks NW", value: 0, status: "Lost", priority: "Low", receivedAt: "2025-02-28", followUpDate: null, conversations: [] },
  { id: 10, vendor: "Cyber Power", rep: "Zachary Johnson", leadName: "Pacific NW Logistics", value: 18500, status: "Active", priority: "High", receivedAt: "2025-04-25", followUpDate: "2025-05-13", conversations: [] },
  { id: 11, vendor: "3CX", rep: "Noorinder Brar", leadName: "Cascade Dental Group", value: 8200, status: "Contacted", priority: "Medium", receivedAt: "2025-05-02", followUpDate: null, conversations: [] },
  { id: 12, vendor: "SonicWall", rep: "Steve Massey", leadName: "Riverfront Hotel", value: 12400, status: "New", priority: "High", receivedAt: "2025-05-08", followUpDate: null, conversations: [] },
];