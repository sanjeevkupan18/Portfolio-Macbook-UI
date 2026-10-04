import { shortcuts } from "@/data/shortcuts";
import { PaneTitle } from "./controls";

export function KeyboardPane() {
  return (
    <div>
      <PaneTitle>Keyboard</PaneTitle>
      <div className="overflow-hidden rounded-xl bg-surface shadow-[0_0_0_0.5px_var(--border)]">
        <table className="w-full text-left text-[13px]">
          <caption className="sr-only">Keyboard shortcuts</caption>
          <thead className="text-[12px] text-muted">
            <tr className="border-b border-border">
              <th scope="col" className="px-3.5 py-2 font-semibold">Action</th>
              <th scope="col" className="px-3.5 py-2 font-semibold">Shortcut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shortcuts.map((s) => (
              <tr key={`${s.keys.join("+")}-${s.label}`}>
                <td className="px-3.5 py-2.5 align-top">
                  {s.label}
                  {s.note && <span className="mt-0.5 block text-[12px] text-muted">{s.note}</span>}
                </td>
                <td className="px-3.5 py-2.5 align-top">
                  <span className="flex flex-wrap gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="rounded-md bg-hover px-1.5 py-0.5 font-sans text-[12px] whitespace-nowrap shadow-[0_0_0_0.5px_var(--border)]">{k}</kbd>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
