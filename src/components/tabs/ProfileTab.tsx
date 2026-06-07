"use client";

import { useApp } from "@/context/AppProvider";
import PersonalReason from "@/components/PersonalReason";
import StartSettings from "@/components/StartSettings";

export default function ProfileTab() {
  const { state, dispatch } = useApp();

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Настройки старта и твоя личная причина
        </p>
      </header>

      <PersonalReason reason={state.personalReason} />

      <StartSettings
        quitDate={state.quitDate}
        cigarettesPerDay={state.cigarettesPerDay}
        packPrice={state.packPrice}
        onQuitDateChange={(value) =>
          dispatch({ type: "SET_QUIT_DATE", value })
        }
        onCigarettesPerDayChange={(value) =>
          dispatch({ type: "SET_CIGARETTES_PER_DAY", value })
        }
        onPackPriceChange={(value) =>
          dispatch({ type: "SET_PACK_PRICE", value })
        }
      />
    </div>
  );
}
