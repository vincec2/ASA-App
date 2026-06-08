import { useState } from "react";
import ListArea from "../components/ListArea";
import type { CalendarEvent } from "../types/domain";

type CalendarPageProps = {
  events: CalendarEvent[];
  eventTitle: string;
  eventTime: string;
  onEventTitleChange: (value: string) => void;
  onEventTimeChange: (value: string) => void;
  onAddCalendarEvent: () => void;
  onDeleteCalendarEvent: (eventId: number) => void;
  onUpdateCalendarEvent: (
    eventId: number,
    updates: {
      title: string;
      timeText: string;
    }
  ) => void;
};

function CalendarPage({
  events,
  eventTitle,
  eventTime,
  onEventTitleChange,
  onEventTimeChange,
  onAddCalendarEvent,
  onDeleteCalendarEvent,
  onUpdateCalendarEvent,
}: CalendarPageProps) {
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventTimeText, setEditEventTimeText] = useState("");

  function startEditingEvent(event: CalendarEvent) {
    setEditingEventId(event.id);
    setEditEventTitle(event.title);
    setEditEventTimeText(event.timeText);
  }

  function cancelEditingEvent() {
    setEditingEventId(null);
    setEditEventTitle("");
    setEditEventTimeText("");
  }

  function saveEditingEvent() {
    if (editingEventId === null) return;

    onUpdateCalendarEvent(editingEventId, {
      title: editEventTitle,
      timeText: editEventTimeText,
    });

    cancelEditingEvent();
  }

  return (
    <section className="page-section">
      <h2>Calendar</h2>
      <p className="page-note">
        Calendar is a core ASA function. Events save locally.
      </p>

      <div className="form-row">
        <input
          value={eventTitle}
          onChange={(event) => onEventTitleChange(event.target.value)}
          placeholder="Meeting title"
        />

        <input
          value={eventTime}
          onChange={(event) => onEventTimeChange(event.target.value)}
          placeholder="Time, date, or natural text"
        />

        <button onClick={onAddCalendarEvent}>Add Event</button>
      </div>

      <ListArea emptyText="No calendar events yet.">
        {events.map((event) => (
          <div className="list-item" key={event.id}>
            {editingEventId === event.id ? (
              <div className="edit-row">
                <input
                  value={editEventTitle}
                  onChange={(inputEvent) =>
                    setEditEventTitle(inputEvent.target.value)
                  }
                  placeholder="Event title"
                />

                <input
                  value={editEventTimeText}
                  onChange={(inputEvent) =>
                    setEditEventTimeText(inputEvent.target.value)
                  }
                  placeholder="Time, date, or natural text"
                />

                <button onClick={saveEditingEvent}>Save</button>
                <button onClick={cancelEditingEvent}>Cancel</button>
              </div>
            ) : (
              <>
                <div>
                  <strong>{event.title}</strong>
                  <span>
                    {event.timeText}
                    {event.dateISO ? ` · date: ${event.dateISO}` : ""}
                    {event.timeOfDayText
                      ? ` · time: ${event.timeOfDayText}`
                      : ""}
                  </span>
                </div>

                <div className="list-actions">
                  <button onClick={() => startEditingEvent(event)}>Edit</button>
                  <button onClick={() => onDeleteCalendarEvent(event.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </ListArea>
    </section>
  );
}

export default CalendarPage;