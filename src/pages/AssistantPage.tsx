import type { AgendaItem, CalendarEvent, TaskItem } from "../types/domain";

type AssistantPageProps = {
  command: string;
  asaResponse: string;
  lastCommand: string;
  
  canUndo: boolean;
  undoDescription: string;
  onUndo: () => void;

  dayPlanPanelOpen: boolean;
  dayPlanTitle: string;
  dayPlanTasks: TaskItem[];
  dayPlanEvents: CalendarEvent[];
  onCloseDayPlanPanel: () => void;

  upcomingPanelOpen: boolean;
  upcomingPanelTitle: string;
  upcomingItems: AgendaItem[];
  onCloseUpcomingPanel: () => void;

  taskResultPanelOpen: boolean;
  taskResultTitle: string;
  taskResultItems: TaskItem[];
  onCloseTaskResultPanel: () => void;

  calendarResultPanelOpen: boolean;
  calendarResultTitle: string;
  calendarResultItems: CalendarEvent[];
  onCloseCalendarResultPanel: () => void;

  meetingNoteCaptureOpen: boolean;
  meetingNoteTitle: string;
  meetingNoteTranscript: string;

  onCommandChange: (value: string) => void;
  onRunCommand: () => void | Promise<void>;

  onMeetingNoteTitleChange: (value: string) => void;
  onMeetingNoteTranscriptChange: (value: string) => void;
  onSaveMeetingNote: () => void | Promise<void>;
  onCancelMeetingNoteCapture: () => void;
};

function AssistantPage({
  command,
  asaResponse,
  lastCommand,

  canUndo,
  undoDescription,
  onUndo,

  dayPlanPanelOpen,
  dayPlanTitle,
  dayPlanTasks,
  dayPlanEvents,
  onCloseDayPlanPanel,

  upcomingPanelOpen,
  upcomingPanelTitle,
  upcomingItems,
  onCloseUpcomingPanel,

  taskResultPanelOpen,
  taskResultTitle,
  taskResultItems,
  onCloseTaskResultPanel,

  calendarResultPanelOpen,
  calendarResultTitle,
  calendarResultItems,
  onCloseCalendarResultPanel,

  meetingNoteCaptureOpen,
  meetingNoteTitle,
  meetingNoteTranscript,

  onCommandChange,
  onRunCommand,

  onMeetingNoteTitleChange,
  onMeetingNoteTranscriptChange,
  onSaveMeetingNote,
  onCancelMeetingNoteCapture,
}: AssistantPageProps) {
  return (
    <section className="assistant-page">
      <div className="assistant-command-area">
        <label>Hey ASA, can you...</label>

        <div className="command-row">
          <input
            value={command}
            onChange={(event) => onCommandChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onRunCommand();
              }
            }}
            placeholder="remind me to call Daniel tomorrow"
          />

          <button onClick={onRunCommand}>Run Command</button>

          <button onClick={onUndo} disabled={!canUndo}>
            Undo
          </button>

          <button disabled>Press to Speak</button>
        </div>

        <p className="undo-status">
          {canUndo ? `Can undo: ${undoDescription}` : "Nothing to undo."}
        </p>

        <div className="example-row">
          <button
            onClick={() =>
              onCommandChange("Hey ASA, can you remind me to call Daniel tomorrow?")
            }
          >
            Reminder example
          </button>

          <button onClick={() => onCommandChange("Hey ASA, what do I have tomorrow?")}>
            Day plan example
          </button>

          <button onClick={() => onCommandChange("Hey ASA, what's next?")}>
            Next up example
          </button>

          <button onClick={() => onCommandChange("Hey ASA, what do I have coming up?")}>
            Upcoming example
          </button>

          <button onClick={() => onCommandChange("Hey ASA, record meeting notes")}>
            Meeting notes example
          </button>
        </div>
      </div>

      <div className="assistant-output">
        <div>
          <h2>ASA Response</h2>
          <p>{asaResponse}</p>
        </div>

        <div>
          <h2>Last Command</h2>
          <p>{lastCommand || "No command yet."}</p>
        </div>
      </div>

      {dayPlanPanelOpen && (
        <div className="assistant-result-panel">
          <div className="panel-title-row">
            <h2>{dayPlanTitle}</h2>
            <button onClick={onCloseDayPlanPanel}>Close</button>
          </div>

          <div className="today-section">
            <h3>Calendar</h3>

            {dayPlanEvents.length === 0 ? (
              <p className="empty-text-inline">No calendar events for this day.</p>
            ) : (
              <ul>
                {dayPlanEvents.map((event) => (
                  <li key={event.id}>
                    <strong>{event.title}</strong>
                    <span>
                      {event.timeText}
                      {event.timeOfDayText ? ` · time: ${event.timeOfDayText}` : ""}
                      {event.dateISO ? ` · date: ${event.dateISO}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="today-section">
            <h3>Tasks / Reminders / Follow-Ups</h3>

            {dayPlanTasks.length === 0 ? (
              <p className="empty-text-inline">No open tasks for this day.</p>
            ) : (
              <ul>
                {dayPlanTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <span>
                      {task.category}
                      {task.dueText ? ` · due: ${task.dueText}` : ""}
                      {task.dueTimeText ? ` · time: ${task.dueTimeText}` : ""}
                      {task.dueDateISO ? ` · date: ${task.dueDateISO}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {upcomingPanelOpen && (
        <div className="assistant-result-panel">
          <div className="panel-title-row">
            <h2>{upcomingPanelTitle}</h2>
            <button onClick={onCloseUpcomingPanel}>Close</button>
          </div>

          <div className="today-section">
            {upcomingItems.length === 0 ? (
              <p className="empty-text-inline">No upcoming items found.</p>
            ) : (
              <ul>
                {upcomingItems.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.kind}
                      {item.category ? ` · ${item.category}` : ""}
                      {item.timeText ? ` · ${item.timeText}` : ""}
                      {item.dateISO ? ` · ${item.dateISO}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {taskResultPanelOpen && (
        <div className="assistant-result-panel">
          <div className="panel-title-row">
            <h2>{taskResultTitle}</h2>
            <button onClick={onCloseTaskResultPanel}>Close</button>
          </div>

          <div className="today-section">
            {taskResultItems.length === 0 ? (
              <p className="empty-text-inline">No matching tasks.</p>
            ) : (
              <ul>
                {taskResultItems.map((task) => (
                  <li key={task.id}>
                    <strong className={task.status === "completed" ? "completed" : ""}>
                      {task.title}
                    </strong>
                    <span>
                      {task.category} · {task.status}
                      {task.dueText ? ` · due: ${task.dueText}` : ""}
                      {task.dueTimeText ? ` · time: ${task.dueTimeText}` : ""}
                      {task.dueDateISO ? ` · date: ${task.dueDateISO}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {calendarResultPanelOpen && (
        <div className="assistant-result-panel">
          <div className="panel-title-row">
            <h2>{calendarResultTitle}</h2>
            <button onClick={onCloseCalendarResultPanel}>Close</button>
          </div>

          <div className="today-section">
            {calendarResultItems.length === 0 ? (
              <p className="empty-text-inline">No matching calendar events.</p>
            ) : (
              <ul>
                {calendarResultItems.map((event) => (
                  <li key={event.id}>
                    <strong>{event.title}</strong>
                    <span>
                      {event.timeText}
                      {event.timeOfDayText ? ` · time: ${event.timeOfDayText}` : ""}
                      {event.dateISO ? ` · date: ${event.dateISO}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {meetingNoteCaptureOpen && (
        <div className="meeting-note-capture">
          <h2>Meeting Note Capture</h2>
          <p>
            Temporary text input for now. Later, ASA voice recording will fill
            this transcript automatically.
          </p>

          <input
            value={meetingNoteTitle}
            onChange={(event) => onMeetingNoteTitleChange(event.target.value)}
            placeholder="Meeting note title"
          />

          <textarea
            value={meetingNoteTranscript}
            onChange={(event) => onMeetingNoteTranscriptChange(event.target.value)}
            placeholder="Meeting transcript / spoken summary"
            rows={10}
          />

          <div className="capture-actions">
            <button onClick={onSaveMeetingNote}>Save Meeting Note File</button>
            <button onClick={onCancelMeetingNoteCapture}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AssistantPage;