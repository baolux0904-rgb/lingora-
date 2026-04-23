"use client";

import useSound from "@/hooks/useSound";
import { itemsForSurface, BOTTOMNAV_LABEL_OVERRIDES } from "@/config/nav";

interface BottomNavProps {
  active: string;
  onChange: (id: string) => void;
}

const BOTTOMNAV_ITEMS = itemsForSurface("bottomnav");

export default function BottomNav({ active, onChange }: BottomNavProps) {
  const { play } = useSound();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-1"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderTop: "1px solid var(--color-border)",
        height: "calc(68px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {BOTTOMNAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        const displayLabel = BOTTOMNAV_LABEL_OVERRIDES[id] ?? label;

        return (
          <button
            key={id}
            onClick={() => { play("click", 0.2); onChange(id); }}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-[transform,color] duration-normal active:scale-95"
          >
            <div
              className="flex items-center justify-center rounded-xl transition-[transform,background-color,color] duration-normal"
              style={{
                width: 40,
                height: 40,
                backgroundColor: isActive ? "rgba(0, 168, 150, 0.10)" : "transparent",
                transform: isActive ? "scale(1.1)" : "scale(1)",
                color: isActive ? "#00A896" : "var(--color-text-tertiary)",
              }}
            >
              <Icon size={24} />
            </div>
            <span
              className="text-xs transition-colors duration-normal"
              style={{
                color: isActive ? "#00A896" : "var(--color-text-tertiary)",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {displayLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
