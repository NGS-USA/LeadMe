import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email/password
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Check if MFA is required
    if (data.session?.user?.factors?.length > 0) {
      setMfaRequired(true);
    }
    return data;
  };

  // Microsoft login — stubbed, ready to activate
  const signInWithMicrosoft = async () => {
    // TODO: Uncomment when Azure tenant is configured in Supabase
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider: "azure",
    //   options: {
    //     scopes: "email profile",
    //     redirectTo: window.location.origin,
    //   },
    // });
    // if (error) throw error;
    throw new Error("Microsoft login coming soon — contact your admin.");
  };

  // Verify TOTP MFA code
  const verifyMfa = async (code) => {
    const factors = await supabase.auth.mfa.listFactors();
    const totpFactor = factors.data?.totp?.[0];
    if (!totpFactor) throw new Error("No MFA factor found");

    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
    if (challenge.error) throw challenge.error;

    const { error } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.data.id,
      code,
    });
    if (error) throw error;
    setMfaRequired(false);
  };

  // Enroll MFA — returns QR code and secret
  const enrollMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "LeadTrack" });
    if (error) throw error;
    return data;
  };

  // Confirm MFA enrollment with first code
  const confirmMfaEnrollment = async (factorId, code) => {
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) throw challenge.error;

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });
    if (error) throw error;
  };

  // Unenroll MFA
  const unenrollMfa = async () => {
    const factors = await supabase.auth.mfa.listFactors();
    const totpFactor = factors.data?.totp?.[0];
    if (!totpFactor) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
    if (error) throw error;
  };

  // Check if user has MFA enrolled
  const checkMfaEnrolled = async () => {
    const factors = await supabase.auth.mfa.listFactors();
    return (factors.data?.totp?.length ?? 0) > 0;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMfaRequired(false);
  };

  return {
    user, session, loading, mfaRequired,
    signInWithEmail, signInWithMicrosoft,
    verifyMfa, enrollMfa, confirmMfaEnrollment,
    unenrollMfa, checkMfaEnrolled,
    signOut,
  };
}