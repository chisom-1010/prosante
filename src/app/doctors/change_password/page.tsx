import { redirect } from "next/navigation";

export default function ChangePasswordRedirect() {
  redirect("/auth/change-password");
}
