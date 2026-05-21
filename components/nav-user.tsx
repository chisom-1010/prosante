// NAV USER
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function NavUser() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nom, prenom, email")
        .eq("auth_user_id", authData.user.id)
        .single();

      if (profile) {
        setUser({
          name: `${profile.nom ?? ""} ${profile.prenom ?? ""}`,
          email: profile.email ?? authData.user.email ?? "",
        });
      }
    }

    loadUser();
  }, [supabase]);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <Avatar className="h-12 w-12 rounded-xl">
        <AvatarFallback className="rounded-xl bg-emerald-100 text-emerald-700 font-bold">
          {user.name?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user.name}
        </p>

        <p className="truncate text-xs text-slate-500">
          {user.email}
        </p>
      </div>
    </div>
  );
}