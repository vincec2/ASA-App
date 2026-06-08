import { useEffect, useMemo, useState } from "react";
import "./App.css";

import AppHeader from "./components/AppHeader";
import DueNowBanner from "./components/DueNowBanner";
import useLocalAsaData from "./hooks/useLocalAsaData";

import AssistantPage from "./pages/AssistantPage";
import CalendarPage from "./pages/CalendarPage";
import MeetingNotesPage from "./pages/MeetingNotesPage";
import SettingsPage from "./pages/SettingsPage";
import TasksPage from "./pages/TasksPage";

import {
  applyCalendarEventUpdate,
  buildCalendarEvent,
  findCalendarEventByQuery,
  findCalendarMatches,
} from "./services/calendarService";
import {
  getCalendarDeleteQuery,
  getMeetingNoteQuery,
  getTaskActionQuery,
  looksLikeCalendarCreationCommand,
  looksLikeUndoCommand,
  parseCalendarCommand,
  parseCalendarMoveCommand,
  parseCalendarRenameCommand,
  parseTaskLikeCommand,
  parseTaskMoveCommand,
  parseTaskRenameCommand,
} from "./services/commandService";
import {
  applyTaskUpdate,
  buildTask,
  filterTasks,
  findTaskByQuery,
} from "./services/taskService";

import {
  getDateISOFromPlanCommand,
  getDateLabelForISO,
  getTodayISODate,
} from "./services/dateService";

import { getTimeSortValue } from "./services/timeService";

import {
  buildNextAgendaItem,
  buildUpcomingAgendaItems,
} from "./services/agendaService";

import type {
  AgendaItem,
  CalendarEvent,
  MeetingNote,
  Page,
  TaskCategory,
  TaskCategoryFilter,
  TaskItem,
  TaskStatusFilter,
} from "./types/domain";

type UndoSnapshot = {
  tasks: TaskItem[];
  events: CalendarEvent[];
  description: string;
};

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
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null);

  const [currentTimeTick, setCurrentTimeTick] = useState(Date.now());
  const [dismissedDueTaskIds, setDismissedDueTaskIds] = useState<number[]>([]);
  const [snoozedDueTaskUntilById, setSnoozedDueTaskUntilById] = useState<
    Record<number, number>
  >({});

  const [dayPlanPanelOpen, setDayPlanPanelOpen] = useState(false);
  const [dayPlanTitle, setDayPlanTitle] = useState("Day Plan");
  const [dayPlanTasks, setDayPlanTasks] = useState<TaskItem[]>([]);
  const [dayPlanEvents, setDayPlanEvents] = useState<CalendarEvent[]>([]);

  const [upcomingPanelOpen, setUpcomingPanelOpen] = useState(false);
  const [upcomingPanelTitle, setUpcomingPanelTitle] = useState("Upcoming");
  const [upcomingItems, setUpcomingItems] = useState<AgendaItem[]>([]);

  const [taskResultPanelOpen, setTaskResultPanelOpen] = useState(false);
  const [taskResultTitle, setTaskResultTitle] = useState("");
  const [taskResultItems, setTaskResultItems] = useState<TaskItem[]>([]);

  const [calendarResultPanelOpen, setCalendarResultPanelOpen] = useState(false);
  const [calendarResultTitle, setCalendarResultTitle] = useState("");
  const [calendarResultItems, setCalendarResultItems] = useState<CalendarEvent[]>([]);

  const [manualTaskTitle, setManualTaskTitle] = useState("");
  const [manualTaskCategory, setManualTaskCategory] =
    useState<TaskCategory>("task");
  const [manualTaskDueText, setManualTaskDueText] = useState("");
  
  const [taskCategoryFilter, setTaskCategoryFilter] =
    useState<TaskCategoryFilter>("all");

  const [taskStatusFilter, setTaskStatusFilter] =
    useState<TaskStatusFilter>("open");

  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [meetingNoteTitle, setMeetingNoteTitle] = useState("");
  const [meetingNoteTranscript, setMeetingNoteTranscript] = useState("");
  const [meetingNoteCaptureOpen, setMeetingNoteCaptureOpen] = useState(false);
  const [selectedMeetingNoteTitle, setSelectedMeetingNoteTitle] = useState("");
  const [selectedMeetingNoteContent, setSelectedMeetingNoteContent] =
    useState("");

  function getCurrentMinutes() {
    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();
  }

  const visibleTasks = useMemo(
    () => filterTasks(tasks, taskCategoryFilter, taskStatusFilter),
    [tasks, taskCategoryFilter, taskStatusFilter]
  );

  const dueNowTasks = useMemo(() => {
    const todayISO = getTodayISODate();
    const currentMinutes = getCurrentMinutes();

    return tasks.filter((task) => {
      if (task.status !== "open") return false;
      if (!task.dueDateISO) return false;

      const isPastDate = task.dueDateISO < todayISO;
      const isToday = task.dueDateISO === todayISO;

      if (isPastDate) {
        return true;
      }

      if (!isToday) {
        return false;
      }

      if (typeof task.dueTimeMinutes !== "number") {
        return true;
      }

      return task.dueTimeMinutes <= currentMinutes;
    });
  }, [tasks, currentTimeTick]);

  const dueNowBannerTasks = useMemo(() => {
    return dueNowTasks.filter((task) => {
      if (dismissedDueTaskIds.includes(task.id)) {
        return false;
      }

      const snoozedUntil = snoozedDueTaskUntilById[task.id];

      if (typeof snoozedUntil === "number" && snoozedUntil > currentTimeTick) {
        return false;
      }

      return true;
    });
  }, [
    dueNowTasks,
    dismissedDueTaskIds,
    snoozedDueTaskUntilById,
    currentTimeTick,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTimeTick(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  function saveUndoSnapshot(description: string) {
    setUndoSnapshot({
      tasks: tasks.map((task) => ({ ...task })),
      events: events.map((event) => ({ ...event })),
      description,
    });
  }

  function undoLastAction() {
    if (!undoSnapshot) {
      setAsaResponse("Nothing to undo.");
      setActivePage("assistant");
      setCommand("");
      return;
    }

    setTasks(undoSnapshot.tasks);
    setEvents(undoSnapshot.events);

    setAsaResponse(`Undid: ${undoSnapshot.description}.`);
    setUndoSnapshot(null);
    closeAssistantResultPanels();
    setActivePage("assistant");
    setCommand("");
  }

  function createTask(title: string, category: TaskCategory, dueText = "") {
    const newTask = buildTask(title, category, dueText);

    if (!newTask) {
      setAsaResponse("I need a task title before I can create it.");
      return;
    }

    saveUndoSnapshot(`created ${category} "${newTask.title}"`);

    setTasks((current) => [newTask, ...current]);
    setAsaResponse(
      `Created ${category}: "${newTask.title}"${
        newTask.dueText ? ` — due ${newTask.dueText}` : ""
      }.`
    );
    setActivePage("tasks");
  }

  function addManualTask() {
    createTask(manualTaskTitle, manualTaskCategory, manualTaskDueText);
    setManualTaskTitle("");
    setManualTaskDueText("");
    setManualTaskCategory("task");
  }

  function createCalendarEvent(title: string, timeText: string) {
    const newEvent = buildCalendarEvent(title, timeText);

    if (!newEvent) {
      setAsaResponse("Calendar event needs a title.");
      return false;
    }

    saveUndoSnapshot(`created calendar event "${newEvent.title}"`);

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
    const match = tasks.find((task) => task.id === taskId);

    saveUndoSnapshot(
      match ? `changed status for "${match.title}"` : "changed task status"
    );

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

    setAsaResponse("Task status changed.");
  }

  function completeTaskById(taskId: number) {
    const match = tasks.find((task) => task.id === taskId);

    saveUndoSnapshot(
      match ? `completed "${match.title}"` : "completed a task"
    );

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );
  }

  function deleteTask(taskId: number) {
    const match = tasks.find((task) => task.id === taskId);

    saveUndoSnapshot(
      match ? `deleted "${match.title}"` : "deleted a task"
    );

    setTasks((current) => current.filter((task) => task.id !== taskId));
    setAsaResponse("Task deleted.");
  }

  function deleteCalendarEvent(eventId: number) {
    const match = events.find((event) => event.id === eventId);

    saveUndoSnapshot(
      match ? `deleted calendar event "${match.title}"` : "deleted a calendar event"
    );

    setEvents((current) => current.filter((event) => event.id !== eventId));
    setAsaResponse("Calendar event deleted.");
  }

  function updateTaskItem(
    taskId: number,
    updates: {
      title?: string;
      category?: TaskCategory;
      dueText?: string;
    }
  ) {
    const match = tasks.find((task) => task.id === taskId);

    saveUndoSnapshot(
      match ? `updated "${match.title}"` : "updated a task"
    );

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? applyTaskUpdate(task, updates) : task
      )
    );

    setAsaResponse("Task updated.");
  }

  function updateCalendarEventItem(
    eventId: number,
    updates: {
      title?: string;
      timeText?: string;
    }
  ) {
    const match = events.find((event) => event.id === eventId);

    saveUndoSnapshot(
      match ? `updated calendar event "${match.title}"` : "updated a calendar event"
    );

    setEvents((current) =>
      current.map((event) =>
        event.id === eventId ? applyCalendarEventUpdate(event, updates) : event
      )
    );

    setAsaResponse("Calendar event updated.");
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

  function showTaskView(
    categoryFilter: TaskCategoryFilter,
    statusFilter: TaskStatusFilter,
    response: string
  ) {
    const matchingTasks = filterTasks(tasks, categoryFilter, statusFilter);

    setTaskCategoryFilter(categoryFilter);
    setTaskStatusFilter(statusFilter);

    closeAssistantResultPanels();
    setTaskResultPanelOpen(true);
    setTaskResultTitle(response.replace(/\.$/, ""));
    setTaskResultItems(matchingTasks);

    setAsaResponse(response);
    setActivePage("assistant");
    setCommand("");
  }

  function closeAssistantResultPanels() {
    setDayPlanPanelOpen(false);
    setUpcomingPanelOpen(false);
    setTaskResultPanelOpen(false);
    setCalendarResultPanelOpen(false);
  }

  function showDayPlanPanel(raw: string) {
    const targetDateISO = getDateISOFromPlanCommand(raw);
    const dateLabel = getDateLabelForISO(targetDateISO);
    const title = `Day Plan — ${dateLabel}`;

    const matchingEvents = events
      .filter((event) => event.dateISO === targetDateISO)
      .sort(
        (a, b) =>
          getTimeSortValue(a.timeMinutes) - getTimeSortValue(b.timeMinutes)
      );

    const matchingTasks = tasks
      .filter((task) => task.status === "open" && task.dueDateISO === targetDateISO)
      .sort(
        (a, b) =>
          getTimeSortValue(a.dueTimeMinutes) -
          getTimeSortValue(b.dueTimeMinutes)
      );

    closeAssistantResultPanels();

    setDayPlanTitle(title);
    setDayPlanEvents(matchingEvents);
    setDayPlanTasks(matchingTasks);
    setDayPlanPanelOpen(true);

    setAsaResponse(
      `Showing ${matchingEvents.length} calendar event(s) and ${matchingTasks.length} open task(s) for ${dateLabel}.`
    );

    setActivePage("assistant");
    setCommand("");
  }

  function showUpcomingPanel() {
    const items = buildUpcomingAgendaItems(tasks, events, 7);

    closeAssistantResultPanels();

    setUpcomingPanelTitle("Upcoming — Next 7 Days");
    setUpcomingItems(items);
    setUpcomingPanelOpen(true);

    setAsaResponse(`Showing ${items.length} upcoming item(s) for the next 7 days.`);
    setActivePage("assistant");
    setCommand("");
  }

  function showNextUpPanel() {
    const nextItem = buildNextAgendaItem(tasks, events);
    const items = nextItem ? [nextItem] : [];

    closeAssistantResultPanels();

    setUpcomingPanelTitle("Next Up");
    setUpcomingItems(items);
    setUpcomingPanelOpen(true);

    if (!nextItem) {
      setAsaResponse("I could not find any upcoming calendar events or open tasks.");
    } else {
      setAsaResponse(
        `Next up: ${nextItem.title}${
          nextItem.timeText ? ` at ${nextItem.timeText}` : ""
        } on ${nextItem.dateISO}.`
      );
    }

    setActivePage("assistant");
    setCommand("");
  }

  function showDueTasksPanel() {
    closeAssistantResultPanels();

    setTaskResultPanelOpen(true);
    setTaskResultTitle("Due Now / Overdue");
    setTaskResultItems(dueNowTasks);

    setAsaResponse(`Showing ${dueNowTasks.length} due item(s).`);
    setActivePage("assistant");
    setCommand("");
  }

  function dismissDueTask(taskId: number) {
    setDismissedDueTaskIds((current) =>
      current.includes(taskId) ? current : [...current, taskId]
    );

    setAsaResponse(
      "Dismissed this reminder from the banner for this session. It will still appear when you ask what is due."
    );
  }

  function snoozeDueTask(taskId: number, minutes: number) {
    const snoozedUntil = Date.now() + minutes * 60 * 1000;

    setSnoozedDueTaskUntilById((current) => ({
      ...current,
      [taskId]: snoozedUntil,
    }));

    setAsaResponse(
      `Snoozed this reminder from the banner for ${minutes} minute(s). It will still appear when you ask what is due.`
    );
  }

  async function handleCommand() {
    const raw = command.trim();

    if (!raw) {
      setAsaResponse("Type a command first.");
      return;
    }

    setLastCommand(raw);

    const lower = raw.toLowerCase();

    if (looksLikeUndoCommand(raw)) {
      undoLastAction();
      return;
    }

    if (
      lower.includes("what is due") ||
      lower.includes("what's due") ||
      lower.includes("show due") ||
      lower.includes("show overdue") ||
      lower.includes("what is overdue") ||
      lower.includes("what's overdue")
    ) {
      showDueTasksPanel();
      return;
    }

    if (
      lower.includes("snooze reminder") ||
      lower.includes("snooze task") ||
      lower.includes("snooze due")
    ) {
      const match = dueNowTasks[0];

      if (!match) {
        setAsaResponse("There are no due reminders to snooze.");
        setCommand("");
        return;
      }

      snoozeDueTask(match.id, 10);
      setCommand("");
      return;
    }

    if (
      lower.includes("what's next") ||
      lower.includes("what is next") ||
      lower.includes("next up")
    ) {
      showNextUpPanel();
      return;
    }

    if (
      lower.includes("coming up") ||
      lower.includes("upcoming") ||
      lower.includes("next 7 days") ||
      lower.includes("next seven days")
    ) {
      showUpcomingPanel();
      return;
    }

    if (
      lower.includes("what do i have") ||
      lower.includes("what's on") ||
      lower.includes("what is on") ||
      lower.includes("what do i need to do")
    ) {
      showDayPlanPanel(raw);
      return;
    }

    if (
      lower.includes("show my tasks") ||
      lower.includes("task list")
    ) {
      showTaskView("all", "open", "Showing your open task list.");
      return;
    }

    if (
      lower.includes("show reminders") ||
      lower.includes("my reminders") ||
      lower.includes("what reminders")
    ) {
      showTaskView("reminder", "open", "Showing your open reminders.");
      return;
    }

    if (
      lower.includes("show follow-ups") ||
      lower.includes("show follow ups") ||
      lower.includes("my follow-ups") ||
      lower.includes("my follow ups") ||
      lower.includes("what follow-ups") ||
      lower.includes("what follow ups")
    ) {
      showTaskView("follow-up", "open", "Showing your open follow-ups.");
      return;
    }

    if (
      lower.includes("show completed tasks") ||
      lower.includes("completed tasks") ||
      lower.includes("what have i completed")
    ) {
      showTaskView("all", "completed", "Showing your completed tasks.");
      return;
    }

    if (
      lower.includes("show all tasks") ||
      lower.includes("all tasks")
    ) {
      showTaskView("all", "all", "Showing all tasks.");
      return;
    }

    if (lower.includes("remind me to")) {
      const parsedTask = parseTaskLikeCommand(raw, "reminder");
      createTask(parsedTask.title, "reminder", parsedTask.dueText);
      setCommand("");
      return;
    }

    if (
      lower.includes("rename task") ||
      lower.includes("rename reminder") ||
      lower.includes("rename follow-up") ||
      lower.includes("rename follow up")
    ) {
      const parsed = parseTaskRenameCommand(raw);

      if (!parsed) {
        setAsaResponse("Use: rename task [old name] to [new name].");
        setCommand("");
        return;
      }

      const match = findTaskByQuery(tasks, parsed.query);

      if (!match) {
        setAsaResponse(`I could not find a task matching "${parsed.query}".`);
        setActivePage("assistant");
        setCommand("");
        return;
      }

      updateTaskItem(match.id, { title: parsed.value });
      closeAssistantResultPanels();
      setAsaResponse(`Renamed ${match.category}: "${match.title}" to "${parsed.value}".`);
      setActivePage("assistant");
      setCommand("");
      return;
    }

    if (
      lower.includes("move task") ||
      lower.includes("move reminder") ||
      lower.includes("move follow-up") ||
      lower.includes("move follow up") ||
      lower.includes("reschedule task") ||
      lower.includes("reschedule reminder") ||
      lower.includes("reschedule follow-up") ||
      lower.includes("reschedule follow up")
    ) {
      const parsed = parseTaskMoveCommand(raw);

      if (!parsed) {
        setAsaResponse("Use: move task [name] to [new due text].");
        setCommand("");
        return;
      }

      const match = findTaskByQuery(tasks, parsed.query);

      if (!match) {
        setAsaResponse(`I could not find a task matching "${parsed.query}".`);
        setActivePage("assistant");
        setCommand("");
        return;
      }

      updateTaskItem(match.id, { dueText: parsed.dueText });
      closeAssistantResultPanels();
      setAsaResponse(
        `Moved ${match.category}: "${match.title}" to ${parsed.dueText}.`
      );
      setActivePage("assistant");
      setCommand("");
      return;
    }

    if (
      lower.includes("complete task") ||
      lower.includes("complete reminder") ||
      lower.includes("complete follow-up") ||
      lower.includes("complete follow up") ||
      lower.includes("mark task complete") ||
      lower.includes("mark reminder complete")
    ) {
      const query = getTaskActionQuery(raw);
      const match = findTaskByQuery(tasks, query);

      if (!match) {
        setAsaResponse(`I could not find a task matching "${query}".`);
        setActivePage("tasks");
        setCommand("");
        return;
      }

      completeTaskById(match.id);
      setAsaResponse(`Completed ${match.category}: "${match.title}".`);
      setActivePage("tasks");
      setCommand("");
      return;
    }

    if (
      lower.includes("delete task") ||
      lower.includes("delete reminder") ||
      lower.includes("delete follow-up") ||
      lower.includes("delete follow up")
    ) {
      const query = getTaskActionQuery(raw);
      const match = findTaskByQuery(tasks, query);

      if (!match) {
        setAsaResponse(`I could not find a task matching "${query}".`);
        setActivePage("tasks");
        setCommand("");
        return;
      }

      deleteTask(match.id);
      setAsaResponse(`Deleted ${match.category}: "${match.title}".`);
      setActivePage("tasks");
      setCommand("");
      return;
    }

    if (lower.includes("follow up")) {
      const parsedTask = parseTaskLikeCommand(raw, "follow-up");
      createTask(parsedTask.title, "follow-up", parsedTask.dueText);
      setCommand("");
      return;
    }

    if (lower.includes("add a task") || lower.includes("create a task")) {
      const parsedTask = parseTaskLikeCommand(raw, "task");
      createTask(parsedTask.title, "task", parsedTask.dueText);
      setCommand("");
      return;
    }

    if (
      lower.includes("rename event") ||
      lower.includes("rename meeting") ||
      lower.includes("rename appointment") ||
      lower.includes("rename calendar event")
    ) {
      const parsed = parseCalendarRenameCommand(raw);

      if (!parsed) {
        setAsaResponse("Use: rename meeting [old name] to [new name].");
        setCommand("");
        return;
      }

      const match = findCalendarEventByQuery(events, parsed.query);

      if (!match) {
        setAsaResponse(`I could not find a calendar event matching "${parsed.query}".`);
        setActivePage("assistant");
        setCommand("");
        return;
      }

      updateCalendarEventItem(match.id, { title: parsed.value });
      closeAssistantResultPanels();
      setAsaResponse(`Renamed calendar event: "${match.title}" to "${parsed.value}".`);
      setActivePage("assistant");
      setCommand("");
      return;
    }

    if (
      lower.includes("move event") ||
      lower.includes("move meeting") ||
      lower.includes("move appointment") ||
      lower.includes("move calendar event") ||
      lower.includes("reschedule event") ||
      lower.includes("reschedule meeting") ||
      lower.includes("reschedule appointment") ||
      lower.includes("reschedule calendar event")
    ) {
      const parsed = parseCalendarMoveCommand(raw);

      if (!parsed) {
        setAsaResponse("Use: reschedule meeting [name] to [new date/time].");
        setCommand("");
        return;
      }

      const match = findCalendarEventByQuery(events, parsed.query);

      if (!match) {
        setAsaResponse(`I could not find a calendar event matching "${parsed.query}".`);
        setActivePage("assistant");
        setCommand("");
        return;
      }

      updateCalendarEventItem(match.id, { timeText: parsed.timeText });
      closeAssistantResultPanels();
      setAsaResponse(`Rescheduled calendar event: "${match.title}" to ${parsed.timeText}.`);
      setActivePage("assistant");
      setCommand("");
      return;
    }

    if (
      lower.includes("delete event") ||
      lower.includes("delete meeting") ||
      lower.includes("delete appointment") ||
      lower.includes("delete calendar event") ||
      lower.includes("cancel event") ||
      lower.includes("cancel meeting") ||
      lower.includes("cancel appointment") ||
      lower.includes("cancel calendar event")
    ) {
      const query = getCalendarDeleteQuery(raw);
      const match = findCalendarEventByQuery(events, query);

      if (!match) {
        setAsaResponse(`I could not find a calendar event matching "${query}".`);
        setActivePage("calendar");
        setCommand("");
        return;
      }

      deleteCalendarEvent(match.id);
      setAsaResponse(`Deleted calendar event: "${match.title}".`);
      setActivePage("calendar");
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

      closeAssistantResultPanels();
      setCalendarResultPanelOpen(true);
      setCalendarResultTitle("Calendar Results");
      setCalendarResultItems(matches);

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

      setActivePage("assistant");
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

      <DueNowBanner
        dueTasks={dueNowBannerTasks}
        onOpenAssistant={showDueTasksPanel}
        onCompleteTask={completeTaskById}
        onDismissTask={dismissDueTask}
        onSnoozeTask={snoozeDueTask}
      />
      <main className="app-main">
        {activePage === "assistant" && (
          <AssistantPage
            command={command}
            asaResponse={asaResponse}
            lastCommand={lastCommand}
            canUndo={undoSnapshot !== null}
            undoDescription={undoSnapshot?.description ?? ""}
            onUndo={undoLastAction}
            dayPlanPanelOpen={dayPlanPanelOpen}
            dayPlanTitle={dayPlanTitle}
            dayPlanTasks={dayPlanTasks}
            dayPlanEvents={dayPlanEvents}
            onCloseDayPlanPanel={() => setDayPlanPanelOpen(false)}
            taskResultPanelOpen={taskResultPanelOpen}
            taskResultTitle={taskResultTitle}
            taskResultItems={taskResultItems}
            onCloseTaskResultPanel={() => setTaskResultPanelOpen(false)}
            calendarResultPanelOpen={calendarResultPanelOpen}
            calendarResultTitle={calendarResultTitle}
            calendarResultItems={calendarResultItems}
            onCloseCalendarResultPanel={() => setCalendarResultPanelOpen(false)}
            meetingNoteCaptureOpen={meetingNoteCaptureOpen}
            meetingNoteTitle={meetingNoteTitle}
            meetingNoteTranscript={meetingNoteTranscript}
            onCommandChange={setCommand}
            onRunCommand={handleCommand}
            onMeetingNoteTitleChange={setMeetingNoteTitle}
            onMeetingNoteTranscriptChange={setMeetingNoteTranscript}
            onSaveMeetingNote={saveMeetingNoteFile}
            onCancelMeetingNoteCapture={cancelMeetingNoteCapture}
            upcomingPanelOpen={upcomingPanelOpen}
            upcomingPanelTitle={upcomingPanelTitle}
            upcomingItems={upcomingItems}
            onCloseUpcomingPanel={() => setUpcomingPanelOpen(false)}
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
            onDeleteCalendarEvent={deleteCalendarEvent}
            onUpdateCalendarEvent={updateCalendarEventItem}
          />
        )}

        {activePage === "tasks" && (
          <TasksPage
            tasks={visibleTasks}
            totalTaskCount={tasks.length}
            manualTaskTitle={manualTaskTitle}
            manualTaskCategory={manualTaskCategory}
            manualTaskDueText={manualTaskDueText}
            taskCategoryFilter={taskCategoryFilter}
            taskStatusFilter={taskStatusFilter}
            onManualTaskTitleChange={setManualTaskTitle}
            onManualTaskCategoryChange={setManualTaskCategory}
            onManualTaskDueTextChange={setManualTaskDueText}
            onTaskCategoryFilterChange={setTaskCategoryFilter}
            onTaskStatusFilterChange={setTaskStatusFilter}
            onAddManualTask={addManualTask}
            onToggleTaskStatus={toggleTaskStatus}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTaskItem}
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