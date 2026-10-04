"use client";

import { useState } from "react";
import { Database, HardDrive } from "lucide-react";
import { useDesktop } from "@/context/DesktopContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Group, PaneTitle } from "./controls";

export function PrivacyPane() {
  const { resetAll } = useDesktop();
  const { notify } = useNotifications();
  const [confirming, setConfirming] = useState(false);

  const doReset = () => {
    resetAll();
    setConfirming(false);
    notify({ title: "Desktop reset", body: "Preferences and local data were cleared.", kind: "success" });
  };

  return (
    <div>
      <PaneTitle>Privacy</PaneTitle>
      <Group title="What is stored">
        <div className="flex gap-3 py-3">
          <HardDrive className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-medium">On this device only</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">Your preferences (theme, accent, wallpaper, Dock and widget settings), your window layout and a few session flags are saved in your browser&apos;s local storage so the desktop looks the same next time. They are never sent to a server.</p>
          </div>
        </div>
        <div className="flex gap-3 py-3">
          <Database className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-medium">Contact form messages</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">If you send a message from the Contact app, the name, email and message you submit are stored in a database so Sanjeev can read and reply to them.</p>
          </div>
        </div>
      </Group>

      <Group title="Reset">
        <div className="py-3">
          <p className="text-[13px] font-medium">Reset desktop &amp; clear local data</p>
          <p className="mt-0.5 mb-3 text-[12.5px] text-muted">Restores every setting to its default and removes the data above from this browser.</p>
          {confirming ? (
            <div role="alertdialog" aria-label="Confirm reset" className="flex flex-wrap items-center gap-2 rounded-lg bg-hover p-3">
              <p className="basis-full text-[13px] font-medium">Reset everything? This can&apos;t be undone.</p>
              <Button variant="danger" onClick={doReset}>Yes, reset</Button>
              <Button onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirming(true)}>Reset desktop &amp; clear local data</Button>
          )}
        </div>
      </Group>
    </div>
  );
}
