import { useEffect, useState } from "react";
import type { CalendarEvent, MeetingNote, StoredData, TaskItem } from "../types/domain";

function useLocalAsaData() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading local data...");
  const [dataPath, setDataPath] = useState("");
  const [meetingNotesFolder, setMeetingNotesFolder] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLocalData() {
      if (!window.asa?.loadData) {
        setSaveStatus("Local Electron storage is not available.");
        setDataLoaded(true);
        return;
      }

      try {
        const storedData = await window.asa.loadData();

        if (cancelled) return;

        setTasks(Array.isArray(storedData.tasks) ? (storedData.tasks as TaskItem[]) : []);
        setEvents(Array.isArray(storedData.events) ? (storedData.events as CalendarEvent[]) : []);
        setMeetingNotes(
          Array.isArray(storedData.meetingNotes)
            ? (storedData.meetingNotes as MeetingNote[])
            : []
        );

        const localPath = await window.asa.getDataPath();

        if (cancelled) return;

        setDataPath(localPath);

        if (window.asa?.getMeetingNotesFolder) {
          const localMeetingNotesFolder = await window.asa.getMeetingNotesFolder();

          if (!cancelled) {
            setMeetingNotesFolder(localMeetingNotesFolder);
          }
        }

        setSaveStatus("Local data loaded.");
      } catch {
        setSaveStatus("Could not load local data.");
      } finally {
        if (!cancelled) {
          setDataLoaded(true);
        }
      }
    }

    loadLocalData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dataLoaded || !window.asa?.saveData) return;

    const saveTimer = window.setTimeout(async () => {
      const dataToSave: StoredData = {
        tasks,
        events,
        meetingNotes,
      };

      try {
        await window.asa?.saveData(dataToSave);
        setSaveStatus("Saved locally.");
      } catch {
        setSaveStatus("Save failed.");
      }
    }, 300);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [tasks, events, meetingNotes, dataLoaded]);

  return {
    tasks,
    setTasks,
    events,
    setEvents,
    meetingNotes,
    setMeetingNotes,
    saveStatus,
    dataPath,
    meetingNotesFolder,
  };
}

export default useLocalAsaData;