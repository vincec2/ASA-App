type SettingsPageProps = {
  saveStatus: string;
  dataPath: string;
  meetingNotesFolder: string;
};

function SettingsPage({
  saveStatus,
  dataPath,
  meetingNotesFolder,
}: SettingsPageProps) {
  return (
    <section className="page-section">
      <h2>Settings</h2>
      <p className="page-note">
        Settings will eventually manage voice, storage, notifications, and
        backend connection.
      </p>

      <div className="settings-list">
        <p>
          <strong>Save status:</strong> {saveStatus}
        </p>

        <p>
          <strong>Local data file:</strong> {dataPath || "Not available yet"}
        </p>

        <p>
          <strong>Meeting notes folder:</strong>{" "}
          {meetingNotesFolder || "Not available yet"}
        </p>

        <p>
          <strong>Voice input:</strong> Not connected yet
        </p>

        <p>
          <strong>OpenAI backend:</strong> Coming later
        </p>
      </div>
    </section>
  );
}

export default SettingsPage;