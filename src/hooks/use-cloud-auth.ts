import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useCloudAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      const nextUser = data.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        const { data: nextProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", nextUser.id)
          .maybeSingle();
        if (active) setProfile(nextProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    void load();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signOut };
}
