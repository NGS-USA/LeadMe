import { useState, useEffect } from "react";
import { account, ID } from "../lib/appwrite";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const sess = await account.getSession("current");
      const usr = await account.get();
      setSession(sess);
      setUser(usr);
    } catch {
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    const sess = await account.createEmailPasswordSession(email, password);
    const usr = await account.get();
    setSession(sess);
    setUser(usr);

    // Check if MFA is required
    const factors = await account.listMfaFactors();
    if (factors.totp) {
      setMfaRequired(true);
    }
    return { session: sess, user: usr };
  };

  const signInWithMicrosoft = async () => {
    throw new Error("Microsoft login coming soon — contact your admin.");
  };

  const verifyMfa = async (code) => {
    await account.createMfaChallenge("totp");
    const challenges = await account.listMfaChallenges();
    const challengeId = challenges.challenges[0].$id;
    await account.updateMfaChallenge(challengeId, code);
    setMfaRequired(false);
  };

  const enrollMfa = async () => {
    const result = await account.createMfaAuthenticator("totp");
    return {
      id: "totp",
      totp: {
        qr_code: result.uri,
        secret: result.secret,
      },
    };
  };

  const confirmMfaEnrollment = async (factorId, code) => {
    await account.updateMfaAuthenticator("totp", code);
  };

  const unenrollMfa = async () => {
    await account.deleteMfaAuthenticator("totp");
  };

  const checkMfaEnrolled = async () => {
    try {
      const factors = await account.listMfaFactors();
      return !!factors.totp;
    } catch {
      return false;
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession("current");
    } catch {}
    setUser(null);
    setSession(null);
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