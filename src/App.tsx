import { useState } from "react";
import "./App.css";

type Page =
  | "dashboard"
  | "calendar"
  | "tasks"
  | "reminders"
  | "meeting-notes"
  | "follow-ups"
  | "search"
  | "settings";

type NavItem = {
  id: Page;
  label: string;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "calendar", label: "Calendar" },
  { id: "tasks", label: "Tasks" },
  { id: "reminders", label: "Reminders" },
  { id: "meeting-notes", label: "Meeting Notes" },
  { id: "follow-ups", label: "Follow-Ups" },
  { id: "search", label: "Search" },
  { id: "settings", label: "Settings" },
];

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const currentPageTitle =
    navItems.find((item) => item.id === activePage)?.label ?? "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-mark">A</div>
          <div>
            <h1>ASA App</h1>
            <p>Artificial Secretary Assistant</p>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${
                activePage === item.id ? "nav-button-active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>Local-first desktop assistant</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ASA Workspace</p>
            <h2>{currentPageTitle}</h2>
          </div>

          <button className="voice-button">Press to Speak</button>
        </header>

        <section className="page-content">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "calendar" && (
            <PlaceholderPage
              title="Calendar"
              description="Create, edit, reschedule, and manage meetings or appointments."
            />
          )}
          {activePage === "tasks" && (
            <PlaceholderPage
              title="Tasks"
              description="Create tasks, set due dates, track priorities, and mark work complete."
            />
          )}
          {activePage === "reminders" && (
            <PlaceholderPage
              title="Reminders"
              description="Create one-time or recurring reminders and receive local notifications."
            />
          )}
          {activePage === "meeting-notes" && (
            <PlaceholderPage
              title="Meeting Notes"
              description="Record meeting summaries, decisions, action items, and follow-ups."
            />
          )}
          {activePage === "follow-ups" && (
            <PlaceholderPage
              title="Follow-Ups"
              description="Track pending responsibilities from meetings, calls, and discussions."
            />
          )}
          {activePage === "search" && (
            <PlaceholderPage
              title="Search"
              description="Search across tasks, reminders, calendar events, notes, and follow-ups."
            />
          )}
          {activePage === "settings" && (
            <PlaceholderPage
              title="Settings"
              description="Manage local app settings, AI settings, voice settings, and preferences."
            />
          )}
        </section>
      </main>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="dashboard-grid">
      <section className="hero-card">
        <p className="eyebrow">Today</p>
        <h3>Welcome to ASA App</h3>
        <p>
          Your local-first executive assistant for tasks, reminders, meetings,
          notes, follow-ups, search, and weekly planning.
        </p>

        <div className="hero-actions">
          <button>Create Task</button>
          <button>Create Reminder</button>
          <button>Add Meeting Note</button>
        </div>
      </section>

      <InfoCard title="Upcoming Meetings" value="0" description="No meetings yet." />
      <InfoCard title="Active Tasks" value="0" description="No active tasks yet." />
      <InfoCard title="Due Reminders" value="0" description="No reminders due." />
      <InfoCard title="Pending Follow-Ups" value="0" description="No pending follow-ups." />

      <section className="wide-card">
        <h3>Weekly Briefing Preview</h3>
        <p>
          Once tasks, reminders, calendar events, and follow-ups are added, ASA
          will summarize your upcoming week here.
        </p>
      </section>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <section className="info-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{description}</span>
    </section>
  );
}

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="placeholder-page">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="empty-state">
        <p>This page is ready for the next build step.</p>
      </div>
    </section>
  );
}

export default App;