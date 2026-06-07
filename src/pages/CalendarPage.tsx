import ListArea from "../components/ListArea";
import type { CalendarEvent } from "../types/domain";

type CalendarPageProps = {
  events: CalendarEvent[];
  eventTitle: string;
  eventTime: string;
  onEventTitleChange: (value: string) => void;
  onEventTimeChange: (value: string) => void;
  onAddCalendarEvent: () => void;
};

function CalendarPage({
  events,
  eventTitle,
  eventTime,
  onEventTitleChange,
  onEventTimeChange,
  onAddCalendarEvent,
}: CalendarPageProps) {
  return (
    <section className="page-section">
      <h2>Calendar</h2>
      <p className="page-note">
        Calendar is a core ASA function. Events now save locally.
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
            <strong>{event.title}</strong>
            <span>{event.timeText}</span>
          </div>
        ))}
      </ListArea>
    </section>
  );
}

export default CalendarPage;