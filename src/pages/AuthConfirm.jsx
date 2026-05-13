import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AuthConfirm() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");

    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type }).then(() => {
        window.location.href = "/";
      });
    }
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #E5E4DF", borderTop: "3px solid #534AB7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 13, color: "#9CA3AF" }}>Confirming your account…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}