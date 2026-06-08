import type { TaskItem } from "../types/domain";

type DueNowBannerProps = {
  dueTasks: TaskItem[];
  onOpenAssistant: () => void;
  onCompleteTask: (taskId: number) => void;
  onDismissTask: (taskId: number) => void;
  onSnoozeTask: (taskId: number, minutes: number) => void;
};

function DueNowBanner({
  dueTasks,
  onOpenAssistant,
  onCompleteTask,
  onDismissTask,
  onSnoozeTask,
}: DueNowBannerProps) {
  if (dueTasks.length === 0) {
    return null;
  }

  return (
    <div className="due-now-banner">
      <div className="due-now-header">
        <div>
          <strong>Due now / overdue</strong>
          <span>{dueTasks.length} item(s) need attention.</span>
        </div>

        <button onClick={onOpenAssistant}>View in Assistant</button>
      </div>

      <div className="due-now-list">
        {dueTasks.slice(0, 3).map((task) => (
          <div className="due-now-item" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <span>
                {task.category}
                {task.dueText ? ` · due: ${task.dueText}` : ""}
                {task.dueDateISO ? ` · date: ${task.dueDateISO}` : ""}
                {task.dueTimeText ? ` · time: ${task.dueTimeText}` : ""}
              </span>
            </div>

            <div className="due-now-actions">
              <button onClick={() => onCompleteTask(task.id)}>Complete</button>
              <button onClick={() => onSnoozeTask(task.id, 10)}>Snooze 10m</button>
              <button onClick={() => onSnoozeTask(task.id, 60)}>Snooze 1h</button>
              <button onClick={() => onDismissTask(task.id)}>Dismiss</button>
            </div>
          </div>
        ))}

        {dueTasks.length > 3 && (
          <p className="due-now-more">+ {dueTasks.length - 3} more</p>
        )}
      </div>
    </div>
  );
}

export default DueNowBanner;