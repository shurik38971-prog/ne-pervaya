export type AppTab = "today" | "progress" | "help" | "profile";

type BottomNavProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const TABS: { id: AppTab; label: string; icon: string }[] = [
  { id: "today", label: "Сегодня", icon: "☀" },
  { id: "progress", label: "Прогресс", icon: "↗" },
  { id: "help", label: "Помощь", icon: "✦" },
  { id: "profile", label: "Профиль", icon: "◎" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-colors ${
                isActive ? "text-red-500" : "text-zinc-500"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
