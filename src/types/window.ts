import type { AppId, AppLaunch } from "./app";

export interface Point { x: number; y: number }
export interface Size { width: number; height: number }
export interface Bounds extends Point, Size {}

export interface WindowState {
  id: string;
  appId: AppId;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: Point;
  size: Size;
  launch: AppLaunch;
}
