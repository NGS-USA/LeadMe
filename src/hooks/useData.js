import { useState, useEffect } from "react";
import { databases, db, col, ID, Query } from "../lib/appwrite";

export function useData() {
  const [leads, setLeads] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [leadsRes, vendorsRes, repsRes] = await Promise.all([
        databases.listDocuments(db, col.leads, [Query.orderDesc("$createdAt")]),
        databases.listDocuments(db, col.vendors, [Query.orderAsc("name")]),
        databases.listDocuments(db, col.reps, [Query.orderAsc("name")]),
      ]);

      const leadsWithMeta = leadsRes.documents.map(l => ({
        ...l,
        id: l.$id,
        leadName: l.client_name,
        receivedAt: l.$createdAt,
        followUpDate: l.follow_up_date,
        vendor: l.vendor_id,
        rep: l.rep_id,
      }));

      const vendorsMapped = vendorsRes.documents.map(v => ({
        ...v,
        id: v.$id,
        joinedDate: v.$createdAt,
        reps: [],
      }));

      setLeads(leadsWithMeta);
      setVendors(vendorsMapped);
      setReps(repsRes.documents.map(r => r.name));
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addLead(form) {
    const vendor = vendors.find(v => v.name === form.vendor);
    const doc = await databases.createDocument(db, col.leads, ID.unique(), {
      vendor_id: vendor?.name || form.vendor || null,
      rep_id: form.rep || null,
      client_name: form.leadName,
      value: Number(form.value) || 0,
      stage: form.status || "New",
      status: form.status || "New",
      notes: form.notes || null,
      follow_up_date: form.followUpDate || null,
    });
    const newLead = {
      ...doc,
      id: doc.$id,
      leadName: doc.client_name,
      receivedAt: doc.$createdAt,
      followUpDate: doc.follow_up_date,
      vendor: doc.vendor_id,
      rep: doc.rep_id,
    };
    setLeads(prev => [newLead, ...prev]);
    return newLead;
  }

  async function updateLead(lead) {
    await databases.updateDocument(db, col.leads, lead.id, {
      vendor_id: lead.vendor || null,
      rep_id: lead.rep || null,
      client_name: lead.leadName,
      value: lead.value,
      stage: lead.status || "New",
      status: lead.status || "New",
      notes: lead.notes || null,
      follow_up_date: lead.followUpDate || null,
    });
    setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
  }

  async function deleteLead(leadId) {
    await databases.deleteDocument(db, col.leads, leadId);
    setLeads(prev => prev.filter(l => l.id !== leadId));
  }

  async function addVendor(name) {
    const doc = await databases.createDocument(db, col.vendors, ID.unique(), {
      name,
      contact_name: null,
      contact_email: null,
      contact_phone: null,
      notes: null,
    });
    const newVendor = {
      ...doc,
      id: doc.$id,
      joinedDate: doc.$createdAt,
      reps: [],
    };
    setVendors(prev => [...prev, newVendor]);
    return newVendor;
  }

  async function updateVendor(vendor) {
    await databases.updateDocument(db, col.vendors, vendor.id, {
      name: vendor.name,
      contact_name: vendor.contact_name || null,
      contact_email: vendor.contact_email || null,
      contact_phone: vendor.contact_phone || null,
      notes: vendor.notes || null,
    });
    setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v));
  }

  async function deleteVendor(vendorId) {
    await databases.deleteDocument(db, col.vendors, vendorId);
    setVendors(prev => prev.filter(v => v.id !== vendorId));
  }

  async function updateVendorReps(vendorId, repNames) {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, reps: repNames } : v));
  }

  async function addRep(name) {
    const existing = await databases.listDocuments(db, col.reps, [Query.equal("name", name)]);
    if (existing.total > 0) return;
    await databases.createDocument(db, col.reps, ID.unique(), { name, vendor_id: null });
    setReps(prev => prev.includes(name) ? prev : [...prev, name]);
  }

  async function deleteRep(repName) {
    const existing = await databases.listDocuments(db, col.reps, [Query.equal("name", repName)]);
    if (existing.total > 0) {
      await databases.deleteDocument(db, col.reps, existing.documents[0].$id);
    }
    setReps(prev => prev.filter(r => r !== repName));
  }

  return {
    leads, vendors, reps, loading, error,
    addLead, updateLead, deleteLead,
    addVendor, updateVendor, updateVendorReps, deleteVendor,
    addRep, deleteRep,
    reload: loadAll,
  };
}