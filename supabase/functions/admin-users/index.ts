import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") throw new Error("Forbidden — admins only");

    const { action, ...payload } = await req.json();

    // ── Invite user ──
    if (action === "invite") {
      const { email, role } = payload;
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      if (error) throw error;
      // Set their role
      await supabaseAdmin.from("profiles").upsert({ id: data.user.id, role });
      return new Response(JSON.stringify({ success: true, user: data.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── List users ──
    if (action === "list") {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      // Get profiles for role info
      const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
      const users = data.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        role: profiles?.find(p => p.id === u.id)?.role ?? "rep",
        mfa_enabled: (u.factors?.length ?? 0) > 0,
      }));
      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Reset password (sends email) ──
    if (action === "reset_password") {
      const { email } = payload;
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${Deno.env.get("SITE_URL")}/reset-password`,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Reset MFA ──
    if (action === "reset_mfa") {
      const { userId } = payload;
      const { data: factors } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId });
      for (const factor of factors ?? []) {
        await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId, factorId: factor.id });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Update role ──
    if (action === "update_role") {
      const { userId, role } = payload;
      const { error } = await supabaseAdmin.from("profiles").update({ role }).eq("id", userId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Delete user ──
    if (action === "delete_user") {
      const { userId } = payload;
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});