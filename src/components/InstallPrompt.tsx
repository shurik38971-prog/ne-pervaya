"use client";

import { useEffect, useReducer } from "react";
import { useIsClient } from "@/hooks/useIsClient";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallState = {
  initialized: boolean;
  hidden: boolean;
  isStandalone: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
};

type InstallAction =
  | {
      type: "INIT";
      payload: { hidden: boolean; isStandalone: boolean };
    }
  | { type: "SET_PROMPT"; payload: BeforeInstallPromptEvent }
  | { type: "HIDE" };

const initialState: InstallState = {
  initialized: false,
  hidden: true,
  isStandalone: false,
  deferredPrompt: null,
};

function installReducer(
  state: InstallState,
  action: InstallAction
): InstallState {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        initialized: true,
        hidden: action.payload.hidden,
        isStandalone: action.payload.isStandalone,
      };
    case "SET_PROMPT":
      return { ...state, deferredPrompt: action.payload, hidden: false };
    case "HIDE":
      return { ...state, hidden: true, deferredPrompt: null };
    default:
      return state;
  }
}

function readStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function InstallPrompt() {
  const isClient = useIsClient();
  const [state, dispatch] = useReducer(installReducer, initialState);

  useEffect(() => {
    if (!isClient) return;

    const dismissed = localStorage.getItem("pwa_install_dismissed") === "1";

    dispatch({
      type: "INIT",
      payload: {
        hidden: dismissed,
        isStandalone: readStandalone(),
      },
    });

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      dispatch({
        type: "SET_PROMPT",
        payload: event as BeforeInstallPromptEvent,
      });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [isClient]);

  if (
    !isClient ||
    !state.initialized ||
    state.isStandalone ||
    state.hidden ||
    !state.deferredPrompt
  ) {
    return null;
  }

  const deferredPrompt = state.deferredPrompt;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    localStorage.setItem("pwa_install_dismissed", "1");
    dispatch({ type: "HIDE" });
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", "1");
    dispatch({ type: "HIDE" });
  };

  return (
    <div className="fixed inset-x-0 bottom-24 z-30 mx-auto w-[calc(100%-2rem)] max-w-md">
      <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl shadow-black/40">
        <p className="text-sm font-semibold text-white">Установить «Не первая»</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          Добавь на главный экран — запуск без адресной строки, как приложение.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="min-h-11 flex-1 rounded-2xl bg-red-500 px-4 text-sm font-bold text-white active:scale-95"
          >
            Установить
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="min-h-11 rounded-2xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300 active:scale-95"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
}
