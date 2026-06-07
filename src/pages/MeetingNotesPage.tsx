import ListArea from "../components/ListArea";
import type { MeetingNote } from "../types/domain";

type MeetingNotesPageProps = {
  meetingNotes: MeetingNote[];
  selectedMeetingNoteTitle: string;
  selectedMeetingNoteContent: string;
  onReadMeetingNote: (note: MeetingNote) => void | Promise<void>;
  onOpenMeetingNoteExternally: (note: MeetingNote) => void | Promise<void>;
};

function MeetingNotesPage({
  meetingNotes,
  selectedMeetingNoteTitle,
  selectedMeetingNoteContent,
  onReadMeetingNote,
  onOpenMeetingNoteExternally,
}: MeetingNotesPageProps) {
  return (
    <section className="page-section">
      <h2>Meeting Notes</h2>
      <p className="page-note">
        Meeting notes are saved as separate local text files. New notes should be
        created through ASA voice commands.
      </p>

      <ListArea emptyText="No meeting note files yet.">
        {meetingNotes.map((note) => (
          <div className="list-item" key={note.id}>
            <div>
              <strong>{note.title}</strong>
              <span>
                {note.fileName} · {note.createdAt}
              </span>
            </div>

            <div className="list-actions">
              <button onClick={() => onReadMeetingNote(note)}>View</button>
              <button onClick={() => onOpenMeetingNoteExternally(note)}>
                Open .txt
              </button>
            </div>
          </div>
        ))}
      </ListArea>

      {selectedMeetingNoteContent && (
        <div className="note-reader">
          <h3>{selectedMeetingNoteTitle}</h3>
          <pre>{selectedMeetingNoteContent}</pre>
        </div>
      )}
    </section>
  );
}

export default MeetingNotesPage;