"use client";

import { useState } from "react";
import BottomNav, { type AppTab } from "@/components/BottomNav";
import CravingMode from "@/components/CravingMode";
import HelpTab from "@/components/tabs/HelpTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import ProgressTab from "@/components/tabs/ProgressTab";
import TodayTab from "@/components/tabs/TodayTab";
import { useApp } from "@/context/AppProvider";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const {
    state,
    selectTrigger,
    declareCravingWin,
    selectHelpedMethod,
    completeCravingWin,
    relapse,
  } = useApp();

  return (
    <>
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-6 text-white">
        {activeTab === "today" && <TodayTab />}
        {activeTab === "progress" && <ProgressTab />}
        {activeTab === "help" && <HelpTab />}
        {activeTab === "profile" && <ProfileTab />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {state.cravingMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-zinc-950 px-4 py-6 [-webkit-overflow-scrolling:touch]">
          <div className="mx-auto w-full max-w-md py-2">
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
      )}
    </>
  );
}
