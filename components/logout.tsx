// LOGOUT BUTTON
"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      onClick={logout}
      variant="outline"
      className="h-14 rounded-xl border-slate-300 px-6 text-base font-semibold shadow-none hover:bg-danger"
    >
      <HugeiconsIcon
        icon={Logout01Icon}
        strokeWidth={2}
        className="mr-2"
      />
      Se déconnecter
    </Button>
  );
}