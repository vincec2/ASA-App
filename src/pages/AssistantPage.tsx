type AssistantPageProps = {
  command: string;
  asaResponse: string;
  lastCommand: string;
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
          <button disabled>Press to Speak</button>
        </div>

        <div className="example-row">
          <button
            onClick={() =>
              onCommandChange("Hey ASA, can you remind me to call Daniel tomorrow?")
            }
          >
            Reminder example
          </button>

          <button
            onClick={() => onCommandChange("Hey ASA, what do I have to do today?")}
          >
            Today example
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