import SummaryBox from "../components/SummaryBox";

type DashboardPageProps = {
  openTaskCount: number;
  eventCount: number;
  meetingNoteCount: number;
};

function DashboardPage({
  openTaskCount,
  eventCount,
  meetingNoteCount,
}: DashboardPageProps) {
  return (
    <section className="page-section">
      <h2>Dashboard</h2>
      <p className="page-note">
        Secondary overview only. ASA should not be dashboard-first.
      </p>

      <div className="summary-grid">
        <SummaryBox label="Open Tasks" value={openTaskCount} />
        <SummaryBox label="Calendar Events" value={eventCount} />
        <SummaryBox label="Meeting Notes" value={meetingNoteCount} />
      </div>
    </section>
  );
}

export default DashboardPage;