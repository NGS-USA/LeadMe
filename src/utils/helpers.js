export const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const fmtShort = (n) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M`
  : n >= 1000 ? `$${(n / 1000).toFixed(0)}K`
  : `$${Math.round(n)}`;

export const today = new Date().toISOString().slice(0, 10);

export const isOverdue = (date) => date && date <= today;

export let nextId = 200;
export const getNextId = () => nextId++;

// TODO: Replace with AWS SES call when ready
export async function sendFollowUpEmail({ repName, leadName, followUpDate }) {
  console.log(`[EMAIL HOOK] Follow-up due for ${repName} on lead "${leadName}" by ${followUpDate}`);
}