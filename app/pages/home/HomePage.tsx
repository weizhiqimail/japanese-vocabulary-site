"use client";
import { useRouter } from "next/navigation";
import { Dashboard } from "../../components/dashboard/Dashboard";
export function HomePage() {
  return <Dashboard router={useRouter()} />;
}
