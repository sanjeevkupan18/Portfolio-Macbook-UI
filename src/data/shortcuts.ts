export interface ShortcutDef { keys: string[]; label: string; note?: string }

export const shortcuts: ShortcutDef[] = [
  { keys: ["⌘/Ctrl", "K"], label: "Open Spotlight search" },
  { keys: ["Esc"], label: "Close the open menu, panel or dialog — otherwise close the active window", note: "Not triggered while typing in a field" },
  { keys: ["⌘/Ctrl", "W"], label: "Close active window", note: "Browsers may reserve this — use Alt+W instead" },
  { keys: ["Alt", "W"], label: "Close active window" },
  { keys: ["⌘/Ctrl", "M"], label: "Minimize active window", note: "Alt+M also works" },
  { keys: ["Alt", "M"], label: "Minimize active window" },
  { keys: ["⌘/Ctrl", "Shift", "F"], label: "Toggle maximize / full screen" },
  { keys: ["Double-click"], label: "Window title bar toggles maximize" },
  { keys: ["Right-click"], label: "Desktop and Dock context menus" },
];
