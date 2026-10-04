export type MessageStatus = "unread" | "read" | "archived";

export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export interface MessageStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; fieldErrors?: Record<string, string> };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
