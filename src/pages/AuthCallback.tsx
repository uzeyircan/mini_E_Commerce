import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const authCode = params.get("code");
      if (!authCode) {
        alert("Auth code not found in URL.");
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(authCode);
      if (error) alert(error.message);
      await useAuth.getState().initialize();
      nav("/", { replace: true });
    })();
  }, [nav]);

  return null;
}
