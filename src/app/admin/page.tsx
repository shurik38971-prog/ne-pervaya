"use client";

import { useEffect, useReducer } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import AdminForbidden from "@/components/AdminForbidden";
import { useIsClient } from "@/hooks/useIsClient";
import {
  checkAdminAccess,
  type AdminAccessResult,
} from "@/lib/admin-auth";

type AccessState =
  | { status: "checking" }
  | { status: "forbidden"; reason: Exclude<AdminAccessResult, { ok: true }>["reason"] }
  | { status: "authorized" };

type AccessAction =
  | { type: "CHECK" }
  | {
      type: "RESULT";
      result: AdminAccessResult;
    };

function accessReducer(_state: AccessState, action: AccessAction): AccessState {
  if (action.type === "CHECK") {
    return { status: "checking" };
  }

  if (action.result.ok) {
    return { status: "authorized" };
  }

  return { status: "forbidden", reason: action.result.reason };
}

export default function AdminPage() {
  const isClient = useIsClient();
  const [access, dispatch] = useReducer(accessReducer, { status: "checking" });

  useEffect(() => {
    if (!isClient) return;

    dispatch({ type: "RESULT", result: checkAdminAccess() });
  }, [isClient]);

  if (!isClient || access.status === "checking") {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  if (access.status === "forbidden") {
    return <AdminForbidden reason={access.reason} />;
  }

  return <AdminDashboard />;
}
