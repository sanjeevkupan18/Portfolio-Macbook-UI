"use client";

import { useDesktop, type DockPosition, type WidgetId } from "@/context/DesktopContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Group, PaneTitle, Row } from "./controls";

const WIDGET_LABELS: Record<WidgetId, string> = { date: "Date", clock: "Clock", battery: "Battery", profile: "Profile", projects: "Projects" };
const WIDGET_IDS = Object.keys(WIDGET_LABELS) as WidgetId[];

export function DockPane() {
  const { prefs, setPrefs } = useDesktop();
  const mobile = useIsMobile();

  return (
    <div>
      <PaneTitle>Desktop &amp; Dock</PaneTitle>

      {!mobile && (
        <Group title="Dock">
          <Row label="Position on screen">
            <Segmented<DockPosition> label="Dock position" value={prefs.dockPosition} onChange={(dockPosition) => setPrefs({ dockPosition })} options={[{ value: "bottom", label: "Bottom" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
          </Row>
          <Row label="Size" description={`${prefs.dockSize} px`}>
            <Slider label="Dock size" min={40} max={80} value={prefs.dockSize} onChange={(dockSize) => setPrefs({ dockSize })} className="w-40" />
          </Row>
          <Row label="Magnification" description="Enlarge icons under the pointer">
            <Switch label="Dock magnification" checked={prefs.dockMagnification} onChange={(dockMagnification) => setPrefs({ dockMagnification })} />
          </Row>
          <Row label="Automatically hide the Dock">
            <Switch label="Automatically hide the Dock" checked={prefs.autoHideDock} onChange={(autoHideDock) => setPrefs({ autoHideDock })} />
          </Row>
        </Group>
      )}

      <Group title="Desktop">
        <Row label="Show desktop icons">
          <Switch label="Show desktop icons" checked={prefs.showDesktopIcons} onChange={(showDesktopIcons) => setPrefs({ showDesktopIcons })} />
        </Row>
        <Row label="Show widgets">
          <Switch label="Show widgets" checked={prefs.showWidgets} onChange={(showWidgets) => setPrefs({ showWidgets })} />
        </Row>
        {WIDGET_IDS.map((id) => (
          <Row key={id} label={`${WIDGET_LABELS[id]} widget`}>
            <Switch
              label={`${WIDGET_LABELS[id]} widget`}
              disabled={!prefs.showWidgets}
              checked={prefs.widgets[id]}
              onChange={(v) => setPrefs((p) => ({ widgets: { ...p.widgets, [id]: v } }))}
            />
          </Row>
        ))}
      </Group>

      <Group title="Clock">
        <Row label="24-hour time">
          <Switch label="24-hour time" checked={prefs.clock24} onChange={(clock24) => setPrefs({ clock24 })} />
        </Row>
      </Group>
    </div>
  );
}
