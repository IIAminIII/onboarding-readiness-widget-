import {
  TASK_NOT_FOUND_ACTION,
  TASK_NOT_FOUND_MESSAGE,
} from "../constants/onboardingTask.js";
import {
  getTaskPriorityStyle,
  getTaskStatusStyle,
} from "../utils/onboardingTask.js";

const COMPLETED_COLORS = { main: "#16A34A", light: "#DCFCE7", text: "#166534" };
const CREATED_COLORS = { main: "#F97316", light: "#FFEDD5", text: "#9A3412" };
const NOT_CREATED_COLORS = { main: "#F97316", light: "#FFEDD5", text: "#9A3412" };

function getBadge(task) {
  if (!task) return { label: "Not Created", colors: NOT_CREATED_COLORS };
  if (task.isCompleted) return { label: "Completed", colors: COMPLETED_COLORS };
  return { label: "Created", colors: CREATED_COLORS };
}

function TaskBadge({ label, colors }) {
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: colors.light, color: colors.text }}
    >
      <span
        className="status-badge__dot"
        style={{ backgroundColor: colors.main }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

export default function OnboardingTaskCard({ task, isLoading, error }) {
  const heading = (
    <div className="section-heading">
      <div>
        <h2 id="onboarding-task-title">Onboarding Task</h2>
        <p>Tracks the kickoff task created for this onboarding process.</p>
      </div>
      {!isLoading && !error ? <TaskBadge {...getBadge(task)} /> : null}
    </div>
  );

  if (isLoading) {
    return (
      <section
        className="section-card"
        aria-labelledby="onboarding-task-title"
        aria-live="polite"
      >
        {heading}
        <div className="task-inline-state">
          <span className="spinner spinner--inline" aria-hidden="true" />
          <p>Loading related tasks from Zoho CRM…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-card" aria-labelledby="onboarding-task-title">
        {heading}
        <div className="task-inline-state task-inline-state--error" role="alert">
          <span className="task-inline-state__icon" aria-hidden="true">
            !
          </span>
          <div>
            <strong>Related tasks could not be loaded.</strong>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!task) {
    return (
      <section className="section-card" aria-labelledby="onboarding-task-title">
        {heading}
        <div className="task-warning">
          <p className="task-warning__message">{TASK_NOT_FOUND_MESSAGE}</p>
          <p className="task-warning__action">
            <span>Suggested Action</span>
            {TASK_NOT_FOUND_ACTION}
          </p>
        </div>
      </section>
    );
  }

  const statusStyle = getTaskStatusStyle(task.status);
  const priorityStyle = getTaskPriorityStyle(task.priority);

  return (
    <section
      className={
        task.isCompleted
          ? "section-card section-card--success"
          : "section-card"
      }
      aria-labelledby="onboarding-task-title"
    >
      {heading}

      <div className={task.isCompleted ? "task-subject task-subject--success" : "task-subject"}>
        <span>Subject</span>
        <strong>{task.subject}</strong>
      </div>

      <dl className="details-grid task-details-grid">
        <div className="detail-item">
          <dt>Due Date</dt>
          <dd>{task.dueDate}</dd>
        </div>
        <div className="detail-item">
          <dt>Priority</dt>
          <dd>
            <span
              className="task-chip"
              style={{
                backgroundColor: priorityStyle.light,
                color: priorityStyle.text,
              }}
            >
              {task.priority}
            </span>
          </dd>
        </div>
        <div className="detail-item">
          <dt>Task Status</dt>
          <dd>
            <span
              className="task-chip"
              style={{
                backgroundColor: statusStyle.light,
                color: statusStyle.text,
              }}
            >
              {task.status}
            </span>
          </dd>
        </div>
        {task.owner ? (
          <div className="detail-item">
            <dt>Owner</dt>
            <dd>{task.owner}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
