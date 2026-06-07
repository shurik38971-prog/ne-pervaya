"use client";

import AppShell from "@/components/AppShell";
import Onboarding from "@/components/Onboarding";
import { AppProvider, useApp } from "@/context/AppProvider";
import { todayISO } from "@/lib/app-reducer";
import { useIsClient } from "@/hooks/useIsClient";

function AppContent() {
  const isClient = useIsClient();
  const { state, dispatch, completeOnboarding } = useApp();

  if (!isClient || !state.hydrated) {
    return <main className="min-h-screen bg-zinc-950" />;
  }

  if (!state.onboardingCompleted) {
    return (
      <Onboarding
        quitDate={state.quitDate || todayISO()}
        cigarettesPerDay={state.cigarettesPerDay}
        packPrice={state.packPrice}
        personalReason={state.personalReason}
        onQuitDateChange={(value) =>
          dispatch({ type: "SET_QUIT_DATE", value })
        }
        onCigarettesPerDayChange={(value) =>
          dispatch({ type: "SET_CIGARETTES_PER_DAY", value })
        }
        onPackPriceChange={(value) =>
          dispatch({ type: "SET_PACK_PRICE", value })
        }
        onPersonalReasonChange={(value) =>
          dispatch({ type: "SET_PERSONAL_REASON", value })
        }
        onComplete={completeOnboarding}
      />
    );
  }

  return (
    <main className="w-full overflow-x-hidden bg-zinc-950">
      <AppShell />
    </main>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
