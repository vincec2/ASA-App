import ListArea from "../components/ListArea";
import type { TaskCategory, TaskItem } from "../types/domain";

type TasksPageProps = {
  tasks: TaskItem[];
  manualTaskTitle: string;
  manualTaskCategory: TaskCategory;
  onManualTaskTitleChange: (value: string) => void;
  onManualTaskCategoryChange: (value: TaskCategory) => void;
  onAddManualTask: () => void;
  onToggleTaskStatus: (taskId: number) => void;
};

function TasksPage({
  tasks,
  manualTaskTitle,
  manualTaskCategory,
  onManualTaskTitleChange,
  onManualTaskCategoryChange,
  onAddManualTask,
  onToggleTaskStatus,
}: TasksPageProps) {
  return (
    <section className="page-section">
      <h2>Tasks</h2>
      <p className="page-note">
        Tasks include normal tasks, reminders, and follow-ups. These now save
        locally.
      </p>

      <div className="form-row">
        <input
          value={manualTaskTitle}
          onChange={(event) => onManualTaskTitleChange(event.target.value)}
          placeholder="Task title"
        />

        <select
          value={manualTaskCategory}
          onChange={(event) =>
            onManualTaskCategoryChange(event.target.value as TaskCategory)
          }
        >
          <option value="task">Task</option>
          <option value="reminder">Reminder</option>
          <option value="follow-up">Follow-Up</option>
        </select>

        <button onClick={onAddManualTask}>Add</button>
      </div>

      <ListArea emptyText="No tasks yet.">
        {tasks.map((task) => (
          <div className="list-item" key={task.id}>
            <div>
              <strong className={task.status === "completed" ? "completed" : ""}>
                {task.title}
              </strong>

              <span>
                {task.category} · {task.status} · {task.createdAt}
              </span>
            </div>

            <button onClick={() => onToggleTaskStatus(task.id)}>
              {task.status === "open" ? "Complete" : "Reopen"}
            </button>
          </div>
        ))}
      </ListArea>
    </section>
  );
}

export default TasksPage;