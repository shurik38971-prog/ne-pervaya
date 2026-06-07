"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BottomNav, { type AppTab } from "@/components/BottomNav";
import CravingMode from "@/components/CravingMode";
import HelpTab from "@/components/tabs/HelpTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import ProgressTab from "@/components/tabs/ProgressTab";
import TodayTab from "@/components/tabs/TodayTab";
import { useApp } from "@/context/AppProvider";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [mounted, setMounted] = useState(false);
  const {
    state,
    selectTrigger,
    declareCravingWin,
    selectHelpedMethod,
    completeCravingWin,
    relapse,
  } = useApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const scrollRoot = document.querySelector(".app-scroll");
    if (!scrollRoot) return;

    scrollRoot.classList.toggle("is-locked", state.cravingMode);

    return () => {
      scrollRoot.classList.remove("is-locked");
    };
  }, [state.cravingMode]);

  const cravingOverlay =
    state.cravingMode && mounted ? (
      <div className="overlay-scroll bg-zinc-950 px-4 py-6">
        <div className="mx-auto w-full max-w-md py-2 pb-8">
          <CravingMode
            secondsLeft={state.secondsLeft}
            timerDone={state.cravingTimerDone}
            cravingHelpStep={state.cravingHelpStep}
            personalReason={state.personalReason}
            triggers={state.triggers}
            helpedMethods={state.helpedMethods}
            selectedTrigger={state.selectedTrigger}
            onSelectTrigger={selectTrigger}
            onDeclareWin={declareCravingWin}
            onSelectHelpedMethod={selectHelpedMethod}
            onCompleteWin={completeCravingWin}
            onRelapse={relapse}
          />
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-6 text-white">
        {activeTab === "today" && <TodayTab />}
        {activeTab === "progress" && <ProgressTab />}
        {activeTab === "help" && <HelpTab />}
        {activeTab === "profile" && <ProfileTab />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {cravingOverlay && createPortal(cravingOverlay, document.body)}
    </>
  );
}
