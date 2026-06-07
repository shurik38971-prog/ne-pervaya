"use client";

import { useEffect } from "react";
import {
  readPersistedCravingEndsAt,
  resyncCravingTimerInWorker,
} from "@/lib/craving-timer";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        await registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        const endsAt = readPersistedCravingEndsAt();
        if (endsAt && endsAt > Date.now()) {
          await resyncCravingTimerInWorker(endsAt);
        }
      } catch (error) {
        console.warn("[pwa] service worker registration failed:", error);
      }
    };

    if (document.readyState === "complete") {
      void register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
