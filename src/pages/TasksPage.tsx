import { useState } from "react";
import ListArea from "../components/ListArea";
import type {
  TaskCategory,
  TaskCategoryFilter,
  TaskItem,
  TaskStatusFilter,
} from "../types/domain";

type TasksPageProps = {
  tasks: TaskItem[];
  totalTaskCount: number;
  manualTaskTitle: string;
  manualTaskCategory: TaskCategory;
  manualTaskDueText: string;
  taskCategoryFilter: TaskCategoryFilter;
  taskStatusFilter: TaskStatusFilter;
  onManualTaskTitleChange: (value: string) => void;
  onManualTaskCategoryChange: (value: TaskCategory) => void;
  onManualTaskDueTextChange: (value: string) => void;
  onTaskCategoryFilterChange: (value: TaskCategoryFilter) => void;
  onTaskStatusFilterChange: (value: TaskStatusFilter) => void;
  onAddManualTask: () => void;
  onToggleTaskStatus: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onUpdateTask: (
    taskId: number,
    updates: {
      title: string;
      category: TaskCategory;
      dueText: string;
    }
  ) => void;
};

function TasksPage({
  tasks,
  totalTaskCount,
  manualTaskTitle,
  manualTaskCategory,
  manualTaskDueText,
  taskCategoryFilter,
  taskStatusFilter,
  onManualTaskTitleChange,
  onManualTaskCategoryChange,
  onManualTaskDueTextChange,
  onTaskCategoryFilterChange,
  onTaskStatusFilterChange,
  onAddManualTask,
  onToggleTaskStatus,
  onDeleteTask,
  onUpdateTask,
}: TasksPageProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskCategory, setEditTaskCategory] =
    useState<TaskCategory>("task");
  const [editTaskDueText, setEditTaskDueText] = useState("");

  function startEditingTask(task: TaskItem) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskCategory(task.category);
    setEditTaskDueText(task.dueText ?? "");
  }

  function cancelEditingTask() {
    setEditingTaskId(null);
    setEditTaskTitle("");
    setEditTaskCategory("task");
    setEditTaskDueText("");
  }

  function saveEditingTask() {
    if (editingTaskId === null) return;

    onUpdateTask(editingTaskId, {
      title: editTaskTitle,
      category: editTaskCategory,
      dueText: editTaskDueText,
    });

    cancelEditingTask();
  }

  return (
    <section className="page-section">
      <h2>Tasks</h2>
      <p className="page-note">
        Tasks include normal tasks, reminders, and follow-ups.
      </p>

      <div className="form-row task-form-row">
        <input
          value={manualTaskTitle}
          onChange={(event) => onManualTaskTitleChange(event.target.value)}
          placeholder="Task title"
        />

        <input
          value={manualTaskDueText}
          onChange={(event) => onManualTaskDueTextChange(event.target.value)}
          placeholder="Due text, e.g. tomorrow at 10"
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

      <div className="filter-panel">
        <div>
          <span>Type:</span>

          <button
            className={taskCategoryFilter === "all" ? "active-filter" : ""}
            onClick={() => onTaskCategoryFilterChange("all")}
          >
            All
          </button>

          <button
            className={taskCategoryFilter === "task" ? "active-filter" : ""}
            onClick={() => onTaskCategoryFilterChange("task")}
          >
            Tasks
          </button>

          <button
            className={taskCategoryFilter === "reminder" ? "active-filter" : ""}
            onClick={() => onTaskCategoryFilterChange("reminder")}
          >
            Reminders
          </button>

          <button
            className={taskCategoryFilter === "follow-up" ? "active-filter" : ""}
            onClick={() => onTaskCategoryFilterChange("follow-up")}
          >
            Follow-Ups
          </button>
        </div>

        <div>
          <span>Status:</span>

          <button
            className={taskStatusFilter === "open" ? "active-filter" : ""}
            onClick={() => onTaskStatusFilterChange("open")}
          >
            Open
          </button>

          <button
            className={taskStatusFilter === "completed" ? "active-filter" : ""}
            onClick={() => onTaskStatusFilterChange("completed")}
          >
            Completed
          </button>

          <button
            className={taskStatusFilter === "all" ? "active-filter" : ""}
            onClick={() => onTaskStatusFilterChange("all")}
          >
            All
          </button>
        </div>

        <p>
          Showing {tasks.length} of {totalTaskCount}
        </p>
      </div>

      <ListArea emptyText="No matching tasks.">
        {tasks.map((task) => (
          <div className="list-item" key={task.id}>
            {editingTaskId === task.id ? (
              <div className="edit-row">
                <input
                  value={editTaskTitle}
                  onChange={(event) => setEditTaskTitle(event.target.value)}
                  placeholder="Task title"
                />

                <input
                  value={editTaskDueText}
                  onChange={(event) => setEditTaskDueText(event.target.value)}
                  placeholder="Due text"
                />

                <select
                  value={editTaskCategory}
                  onChange={(event) =>
                    setEditTaskCategory(event.target.value as TaskCategory)
                  }
                >
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="follow-up">Follow-Up</option>
                </select>

                <button onClick={saveEditingTask}>Save</button>
                <button onClick={cancelEditingTask}>Cancel</button>
              </div>
            ) : (
              <>
                <div>
                  <strong
                    className={task.status === "completed" ? "completed" : ""}
                  >
                    {task.title}
                  </strong>

                  <span>
                    {task.category} · {task.status}
                    {task.dueText ? ` · due: ${task.dueText}` : ""}
                    {task.dueDateISO ? ` · date: ${task.dueDateISO}` : ""}
                    {task.dueTimeText ? ` · time: ${task.dueTimeText}` : ""} ·{" "}
                    {task.createdAt}
                  </span>
                </div>

                <div className="list-actions">
                  <button onClick={() => onToggleTaskStatus(task.id)}>
                    {task.status === "open" ? "Complete" : "Reopen"}
                  </button>

                  <button onClick={() => startEditingTask(task)}>Edit</button>
                  <button onClick={() => onDeleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </ListArea>
    </section>
  );
}

export default TasksPage;