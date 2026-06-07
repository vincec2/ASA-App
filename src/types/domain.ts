export type Page =
  | "assistant"
  | "calendar"
  | "tasks"
  | "meeting-notes"
  | "dashboard"
  | "settings";

export type TaskCategory = "task" | "reminder" | "follow-up";

export type TaskStatus = "open" | "completed";

export type TaskItem = {
  id: number;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  timeText: string;
};

export type MeetingNote = {
  id: number;
  title: string;
  fileName: string;
  filePath?: string;
  createdAt: string;
};

export type StoredData = {
  tasks: TaskItem[];
  events: CalendarEvent[];
  meetingNotes: MeetingNote[];
};