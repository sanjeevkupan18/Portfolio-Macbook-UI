"use client";

import { Bell } from "lucide-react";
import { useDesktop } from "@/context/DesktopContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Group, PaneTitle, Row } from "./controls";

export function NotificationsPane() {
  const { prefs, setPrefs } = useDesktop();
  const { notify } = useNotifications();
  return (
    <div>
      <PaneTitle>Notifications</PaneTitle>
      <Group>
        <Row label="Allow notifications" description="Show banners in the top-right corner">
          <Switch label="Allow notifications" checked={prefs.notificationsEnabled} onChange={(notificationsEnabled) => setPrefs({ notificationsEnabled })} />
        </Row>
        <Row label="Sound effects" description="Play a soft sound with notifications">
          <Switch label="Sound effects" checked={prefs.soundEffects} onChange={(soundEffects) => setPrefs({ soundEffects })} />
        </Row>
        <Row label="Send a test notification" description={prefs.notificationsEnabled && !prefs.focus ? "See how a banner looks" : "Banners are muted (notifications off or Focus on) but it will appear in history"}>
          <Button onClick={() => notify({ title: "Test notification", body: "Notifications are working.", kind: "info" })}>
            <Bell className="size-3.5" aria-hidden="true" /> Send test
          </Button>
        </Row>
      </Group>
    </div>
  );
}
