import { redirect } from "next/navigation";

/** El login real está en `/`. Esta ruta solo redirige. */
export default function DashboardLoginRedirect() {
  redirect("/");
}
