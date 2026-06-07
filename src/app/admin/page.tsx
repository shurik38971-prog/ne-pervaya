"use client";

import { useEffect, useReducer } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import AdminForbidden from "@/components/AdminForbidden";
import { useIsClient } from "@/hooks/useIsClient";
import { getAdminKeyFromUrl, isAdminKeyValid } from "@/lib/admin-auth";

type AccessState = "checking" | "forbidden" | "authorized";

type AccessAction =
  | { type: "CHECK" }
  | { type: "FORBIDDEN" }
  | { type: "AUTHORIZED" };

function accessReducer(_state: AccessState, action: AccessAction): AccessState {
  switch (action.type) {
    case "FORBIDDEN":
      return "forbidden";
    case "AUTHORIZED":
      return "authorized";
    default:
      return "checking";
  }
}

export default function AdminPage() {
  const isClient = useIsClient();
  const [access, dispatch] = useReducer(accessReducer, "checking");

  useEffect(() => {
    if (!isClient) return;

    const key = getAdminKeyFromUrl();
    dispatch({
      type: isAdminKeyValid(key) ? "AUTHORIZED" : "FORBIDDEN",
    });
  }, [isClient]);

  if (!isClient || access === "checking") {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  if (access === "forbidden") {
    return <AdminForbidden />;
  }

  return <AdminDashboard />;
}
