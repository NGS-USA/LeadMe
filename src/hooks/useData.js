import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useData() {
  const [leads, setLeads] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load all data on mount ──
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [leadsRes, vendorsRes, repsRes, convosRes] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("vendors").select("*").order("name"),
        supabase.from("reps").select("*").order("name"),
        supabase.from("conversations").select("*").order("logged_at", { ascending: false }),
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (vendorsRes.error) throw vendorsRes.error;
      if (repsRes.error) throw repsRes.error;
      if (convosRes.error) throw convosRes.error;

      // Attach conversations to leads
      const leadsWithConvos = leadsRes.data.map(l => ({
        ...l,
        leadName: l.lead_name,
        receivedAt: l.received_at,
        followUpDate: l.follow_up_date,
        vendor: l.vendor_name,
        conversations: convosRes.data
          .filter(c => c.lead_id === l.id)
          .map(mapConvo),
      }));

      // Attach conversations to vendors
      const vendorsWithConvos = vendorsRes.data.map(v => ({
        ...v,
        joinedDate: v.joined_date,
        conversations: convosRes.data
          .filter(c => c.vendor_id === v.id)
          .map(mapConvo),
      }));

      setLeads(leadsWithConvos);
      setVendors(vendorsWithConvos);
      setReps(repsRes.data.map(r => r.name));
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function mapConvo(c) {
    return {
      id: c.id,
      date: c.date,
      contactName: c.contact_name,
      contactRole: c.contact_role,
      method: c.method,
      summary: c.summary,
      outcome: c.outcome,
      followUpDate: c.follow_up_date,
    };
  }

  // ── Add lead ──
  async function addLead(form) {
    const vendor = vendors.find(v => v.name === form.vendor);
    const { data, error } = await supabase.from("leads").insert({
      vendor_id: vendor?.id || null,
      vendor_name: form.vendor,
      rep: form.rep,
      lead_name: form.leadName,
      value: Number(form.value) || 0,
      status: form.status,
      priority: form.priority,
      received_at: form.receivedAt,
      follow_up_date: form.followUpDate || null,
    }).select().single();
    if (error) throw error;
    const newLead = { ...data, leadName: data.lead_name, receivedAt: data.received_at, followUpDate: data.follow_up_date, vendor: data.vendor_name, conversations: [] };
    setLeads(prev => [newLead, ...prev]);
    return newLead;
  }

  // ── Update lead ──
  async function updateLead(lead) {
    const { error } = await supabase.from("leads").update({
      vendor_name: lead.vendor,
      rep: lead.rep,
      lead_name: lead.leadName,
      value: lead.value,
      status: lead.status,
      priority: lead.priority,
      received_at: lead.receivedAt,
      follow_up_date: lead.followUpDate || null,
    }).eq("id", lead.id);
    if (error) throw error;
    setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
  }

  // ── Add vendor ──
  async function addVendor(name) {
    const { data, error } = await supabase.from("vendors").insert({
      name,
      status: "Active",
      joined_date: new Date().toISOString().slice(0, 10),
    }).select().single();
    if (error) throw error;
    const newVendor = { ...data, joinedDate: data.joined_date, conversations: [] };
    setVendors(prev => [...prev, newVendor]);
    return newVendor;
  }

  // ── Update vendor ──
  async function updateVendor(vendor) {
    setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v));
  }

  // ── Add rep ──
  async function addRep(name) {
    const { error } = await supabase.from("reps").insert({ name });
    if (error && !error.message.includes("unique")) throw error;
    setReps(prev => prev.includes(name) ? prev : [...prev, name]);
  }

  // ── Add conversation to lead ──
  async function addLeadConversation(leadId, convo) {
    const { data, error } = await supabase.from("conversations").insert({
      lead_id: leadId,
      vendor_id: null,
      contact_name: convo.contactName,
      contact_role: convo.contactRole || null,
      method: convo.method,
      summary: convo.summary,
      outcome: convo.outcome,
      follow_up_date: convo.followUpDate || null,
      date: convo.date,
    }).select().single();
    if (error) throw error;
    const mapped = mapConvo(data);
    setLeads(prev => prev.map(l => l.id === leadId
      ? { ...l, conversations: [mapped, ...l.conversations], followUpDate: convo.followUpDate || l.followUpDate }
      : l
    ));
    return mapped;
  }

  // ── Add conversation to vendor ──
  async function addVendorConversation(vendorId, convo) {
    const { data, error } = await supabase.from("conversations").insert({
      vendor_id: vendorId,
      lead_id: null,
      contact_name: convo.contactName,
      contact_role: convo.contactRole || null,
      method: convo.method,
      summary: convo.summary,
      outcome: convo.outcome,
      follow_up_date: convo.followUpDate || null,
      date: convo.date,
    }).select().single();
    if (error) throw error;
    const mapped = mapConvo(data);
    setVendors(prev => prev.map(v => v.id === vendorId
      ? { ...v, conversations: [mapped, ...v.conversations] }
      : v
    ));
    return mapped;
  }

  return {
    leads, vendors, reps, loading, error,
    addLead, updateLead,
    addVendor, updateVendor,
    addRep,
    addLeadConversation, addVendorConversation,
    reload: loadAll,
  };
}