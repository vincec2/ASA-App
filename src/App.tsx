import { useMemo, useState } from "react";
import "./App.css";

import AppHeader from "./components/AppHeader";
import useLocalAsaData from "./hooks/useLocalAsaData";

import AssistantPage from "./pages/AssistantPage";
import CalendarPage from "./pages/CalendarPage";
import DashboardPage from "./pages/DashboardPage";
import MeetingNotesPage from "./pages/MeetingNotesPage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";

import { buildCalendarEvent, findCalendarMatches } from "./services/calendarService";
import {
  getFollowUpTitle,
  getMeetingNoteQuery,
  getReminderTitle,
  getTaskTitle,
  looksLikeCalendarCreationCommand,
  parseCalendarCommand,
} from "./services/commandService";
import { buildTask } from "./services/taskService";

import type { MeetingNote, Page, TaskCategory } from "./types/domain";

function App() {
  const [activePage, setActivePage] = useState<Page>("assistant");

  const {
    tasks,
    setTasks,
    events,
    setEvents,
    meetingNotes,
    setMeetingNotes,
    saveStatus,
    dataPath,
    meetingNotesFolder,
  } = useLocalAsaData();

  const [command, setCommand] = useState("");
  const [asaResponse, setAsaResponse] = useState(
    "Ready. Try typing a command like: Hey ASA, can you remind me to call Daniel tomorrow?"
  );
  const [lastCommand, setLastCommand] = useState("");

  const [manualTaskTitle, setManualTaskTitle] = useState("");
  const [manualTaskCategory, setManualTaskCategory] =
    useState<TaskCategory>("task");

  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [meetingNoteTitle, setMeetingNoteTitle] = useState("");
  const [meetingNoteTranscript, setMeetingNoteTranscript] = useState("");
  const [meetingNoteCaptureOpen, setMeetingNoteCaptureOpen] = useState(false);
  const [selectedMeetingNoteTitle, setSelectedMeetingNoteTitle] = useState("");
  const [selectedMeetingNoteContent, setSelectedMeetingNoteContent] =
    useState("");

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks]
  );

  function createTask(title: string, category: TaskCategory) {
    const newTask = buildTask(title, category);

    if (!newTask) {
      setAsaResponse("I need a task title before I can create it.");
      return;
    }

    setTasks((current) => [newTask, ...current]);
    setAsaResponse(`Created ${category}: "${newTask.title}".`);
    setActivePage("tasks");
  }

  function addManualTask() {
    createTask(manualTaskTitle, manualTaskCategory);
    setManualTaskTitle("");
    setManualTaskCategory("task");
  }

  function createCalendarEvent(title: string, timeText: string) {
    const newEvent = buildCalendarEvent(title, timeText);

    if (!newEvent) {
      setAsaResponse("Calendar event needs a title.");
      return false;
    }

    setEvents((current) => [newEvent, ...current]);
    setAsaResponse(`Added calendar event: "${newEvent.title}" — ${newEvent.timeText}.`);
    setActivePage("calendar");

    return true;
  }

  function addCalendarEvent() {
    const created = createCalendarEvent(eventTitle, eventTime);

    if (created) {
      setEventTitle("");
      setEventTime("");
    }
  }

  function toggleTaskStatus(taskId: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "open" ? "completed" : "open",
            }
          : task
      )
    );
  }

  async function saveMeetingNoteFile() {
    if (!window.asa?.createMeetingNote) {
      setAsaResponse("Meeting note file storage is not available.");
      return;
    }

    const title = meetingNoteTitle.trim() || "Untitled Meeting Note";
    const content = meetingNoteTranscript.trim();

    if (!content) {
      setAsaResponse("Meeting note transcript is empty.");
      return;
    }

    try {
      const result = await window.asa.createMeetingNote({
        title,
        content,
      });

      if (!result.ok || !result.note) {
        setAsaResponse(result.error || "Could not save meeting note.");
        return;
      }

      setMeetingNotes((current) => [result.note as MeetingNote, ...current]);
      setMeetingNoteTitle("");
      setMeetingNoteTranscript("");
      setMeetingNoteCaptureOpen(false);
      setSelectedMeetingNoteTitle(result.note.title);
      setSelectedMeetingNoteContent(content);
      setAsaResponse(`Saved meeting note: "${result.note.title}".`);
      setActivePage("meeting-notes");
    } catch {
      setAsaResponse("Could not save meeting note.");
    }
  }

  async function readMeetingNote(note: MeetingNote) {
    if (!window.asa?.readMeetingNote) {
      setAsaResponse("Meeting note reader is not available.");
      return;
    }

    try {
      const result = await window.asa.readMeetingNote(note.fileName);

      if (!result.ok || !result.content) {
        setAsaResponse(result.error || "Could not open meeting note.");
        return;
      }

      setSelectedMeetingNoteTitle(note.title);
      setSelectedMeetingNoteContent(result.content);
    } catch {
      setAsaResponse("Could not open meeting note.");
    }
  }

  async function openMeetingNoteExternally(note: MeetingNote) {
    if (!window.asa?.openMeetingNote) {
      setAsaResponse("External file opening is not available.");
      return;
    }

    try {
      const result = await window.asa.openMeetingNote(note.fileName);

      if (!result.ok) {
        setAsaResponse(result.error || "Could not open the text file.");
        return;
      }

      setAsaResponse(`Opened text file: "${note.title}".`);
    } catch {
      setAsaResponse("Could not open the text file.");
    }
  }

  function cancelMeetingNoteCapture() {
    setMeetingNoteCaptureOpen(false);
    setMeetingNoteTitle("");
    setMeetingNoteTranscript("");
    setAsaResponse("Meeting note capture cancelled.");
  }

  async function handleCommand() {
    const raw = command.trim();

    if (!raw) {
      setAsaResponse("Type a command first.");
      return;
    }

    setLastCommand(raw);

    const lower = raw.toLowerCase();

    if (
      lower.includes("what do i have to do today") ||
      lower.includes("show my tasks") ||
      lower.includes("task list")
    ) {
      setAsaResponse("Showing your open task list.");
      setActivePage("tasks");
      setCommand("");
      return;
    }

    if (lower.includes("remind me to")) {
      createTask(getReminderTitle(raw), "reminder");
      setCommand("");
      return;
    }

    if (lower.includes("follow up")) {
      createTask(getFollowUpTitle(raw), "follow-up");
      setCommand("");
      return;
    }

    if (lower.includes("add a task") || lower.includes("create a task")) {
      createTask(getTaskTitle(raw), "task");
      setCommand("");
      return;
    }

    if (looksLikeCalendarCreationCommand(raw)) {
      const parsedEvent = parseCalendarCommand(raw);

      createCalendarEvent(parsedEvent.title, parsedEvent.timeText);
      setCommand("");
      return;
    }

    if (
      lower.includes("do i have") ||
      lower.includes("anything scheduled") ||
      lower.includes("am i free")
    ) {
      if (events.length === 0) {
        setAsaResponse(
          "Checking your calendar. You do not have any calendar events saved yet."
        );
        setActivePage("calendar");
        setCommand("");
        return;
      }

      const matches = findCalendarMatches(raw, events);

      if (matches.length === 0) {
        setAsaResponse("Checking your calendar. I did not find a matching event.");
      } else {
        const resultText = matches
          .slice(0, 3)
          .map((event) => `${event.title} — ${event.timeText}`)
          .join("; ");

        setAsaResponse(
          `I found ${matches.length} matching calendar event(s): ${resultText}`
        );
      }

      setActivePage("calendar");
      setCommand("");
      return;
    }

    if (lower.includes("record meeting notes")) {
      setAsaResponse(
        "Meeting note capture started. For now, type the transcript here; later this will be filled by voice recording."
      );
      setMeetingNoteCaptureOpen(true);
      setActivePage("assistant");
      setCommand("");
      return;
    }

    if (
      lower.includes("pull up meeting notes") ||
      lower.includes("open meeting notes")
    ) {
      const query = getMeetingNoteQuery(raw);

      if (!query) {
        setAsaResponse("Showing your saved meeting notes.");
        setActivePage("meeting-notes");
        setCommand("");
        return;
      }

      const match = meetingNotes.find((note) => {
        const title = note.title.toLowerCase();
        const fileName = note.fileName.toLowerCase();

        return title.includes(query) || fileName.includes(query);
      });

      if (!match) {
        setAsaResponse(`I could not find meeting notes matching "${query}".`);
        setActivePage("meeting-notes");
        setCommand("");
        return;
      }

      await readMeetingNote(match);
      setAsaResponse(`Opened meeting note: "${match.title}".`);
      setActivePage("meeting-notes");
      setCommand("");
      return;
    }

    setAsaResponse(
      "I understood the command text, but I do not have that action connected yet."
    );
    setCommand("");
  }

  return (
    <div className="app-shell">
      <AppHeader activePage={activePage} onPageChange={setActivePage} />

      <main className="app-main">
        {activePage === "assistant" && (
          <AssistantPage
            command={command}
            asaResponse={asaResponse}
            lastCommand={lastCommand}
            meetingNoteCaptureOpen={meetingNoteCaptureOpen}
            meetingNoteTitle={meetingNoteTitle}
            meetingNoteTranscript={meetingNoteTranscript}
            onCommandChange={setCommand}
            onRunCommand={handleCommand}
            onMeetingNoteTitleChange={setMeetingNoteTitle}
            onMeetingNoteTranscriptChange={setMeetingNoteTranscript}
            onSaveMeetingNote={saveMeetingNoteFile}
            onCancelMeetingNoteCapture={cancelMeetingNoteCapture}
          />
        )}

        {activePage === "calendar" && (
          <CalendarPage
            events={events}
            eventTitle={eventTitle}
            eventTime={eventTime}
            onEventTitleChange={setEventTitle}
            onEventTimeChange={setEventTime}
            onAddCalendarEvent={addCalendarEvent}
          />
        )}

        {activePage === "tasks" && (
          <TasksPage
            tasks={tasks}
            manualTaskTitle={manualTaskTitle}
            manualTaskCategory={manualTaskCategory}
            onManualTaskTitleChange={setManualTaskTitle}
            onManualTaskCategoryChange={setManualTaskCategory}
            onAddManualTask={addManualTask}
            onToggleTaskStatus={toggleTaskStatus}
          />
        )}

        {activePage === "meeting-notes" && (
          <MeetingNotesPage
            meetingNotes={meetingNotes}
            selectedMeetingNoteTitle={selectedMeetingNoteTitle}
            selectedMeetingNoteContent={selectedMeetingNoteContent}
            onReadMeetingNote={readMeetingNote}
            onOpenMeetingNoteExternally={openMeetingNoteExternally}
          />
        )}

        {activePage === "dashboard" && (
          <DashboardPage
            openTaskCount={openTasks.length}
            eventCount={events.length}
            meetingNoteCount={meetingNotes.length}
          />
        )}

        {activePage === "settings" && (
          <SettingsPage
            saveStatus={saveStatus}
            dataPath={dataPath}
            meetingNotesFolder={meetingNotesFolder}
          />
        )}
      </main>
    </div>
  );
}

export default App;