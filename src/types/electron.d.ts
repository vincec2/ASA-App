export {};

type MeetingNoteRecord = {
  id: number;
  title: string;
  fileName: string;
  filePath?: string;
  createdAt: string;
};

declare global {
  interface Window {
    asa?: {
      appName: string;

      loadData: () => Promise<{
        tasks: unknown[];
        events: unknown[];
        meetingNotes: unknown[];
      }>;

      saveData: (data: unknown) => Promise<{ ok: boolean }>;

      getDataPath: () => Promise<string>;

      getMeetingNotesFolder: () => Promise<string>;

      createMeetingNote: (payload: {
        title: string;
        content: string;
      }) => Promise<{
        ok: boolean;
        note?: MeetingNoteRecord;
        error?: string;
      }>;

      readMeetingNote: (fileName: string) => Promise<{
        ok: boolean;
        content?: string;
        filePath?: string;
        error?: string;
      }>;

      openMeetingNote: (fileName: string) => Promise<{
        ok: boolean;
        filePath?: string;
        error?: string;
      }>;
    };
  }
}