"use client";

/**
 * SidebarContext — single source of truth for sidebar state across
 * AppShell, AppSidebar (desktop rail + mobile overlay), and Topbar.
 *
 * State:
 *   collapsed   — desktop icon-only mode, persisted to localStorage
 *   mobileOpen  — mobile overlay visibility (transient, not persisted)
 *
 * Effects:
 *   - localStorage hydration (two-step SSR-safe pattern: default false
 *     on first render to match server, then rehydrate in useEffect)
 *   - localStorage persistence on toggle (try/catch wrapped)
 *   - cmd/ctrl+B keyboard listener with input-focus guard
 *   - Escape key closes mobileOpen
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const COLLAPSED_STORAGE_KEY = "lingona.sidebar.collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Two-step SSR-safe: start false (matches server), hydrate in useEffect.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpenState] = useState(false);

  // Hydrate from localStorage after mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      /* localStorage unavailable (privacy mode, quota) — keep default */
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => !v);
  }, []);

  const setMobileOpen = useCallback((open: boolean) => {
    setMobileOpenState(open);
  }, []);

  // Cmd/Ctrl+B global toggle, guarded against typing targets.
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() !== "b" || e.shiftKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      toggleCollapsed();
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [toggleCollapsed]);

  // Escape closes mobile overlay.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpenState(false);
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [mobileOpen]);

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, toggleCollapsed, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    // Safe no-op fallback for components rendered outside the provider
    // (e.g. Topbar reused on public pages). Avoids hard crash.
    return {
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => {},
      setMobileOpen: () => {},
    };
  }
  return ctx;
}
