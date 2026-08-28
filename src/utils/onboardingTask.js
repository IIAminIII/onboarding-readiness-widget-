import {
  ONBOARDING_TASK_SUBJECT,
  TASK_FIELDS,
} from "../constants/onboardingTask.js";
import { displayValue, formatDate } from "./readiness.js";

const TASK_STATUS_STYLES = {
  completed: { light: "#DCFCE7", text: "#166534" },
  "not started": { light: "#F1F5F9", text: "#475569" },
  "in progress": { light: "#FFEDD5", text: "#9A3412" },
  deferred: { light: "#FFEDD5", text: "#9A3412" },
  "waiting on someone else": { light: "#FFEDD5", text: "#9A3412" },
};

const TASK_PRIORITY_STYLES = {
  high: { light: "#FEE2E2", text: "#991B1B" },
  highest: { light: "#FEE2E2", text: "#991B1B" },
  low: { light: "#F1F5F9", text: "#475569" },
  lowest: { light: "#F1F5F9", text: "#475569" },
};

const NEUTRAL_STYLE = { light: "#F1F5F9", text: "#475569" };

export function findOnboardingTask(tasks) {
  if (!Array.isArray(tasks)) return null;

  const target = ONBOARDING_TASK_SUBJECT.trim().toLowerCase();

  return (
    tasks.find(
      (task) =>
        String(task?.[TASK_FIELDS.subject] ?? "")
          .trim()
          .toLowerCase() === target,
    ) || null
  );
}

export function getTaskOwnerName(task) {
  const owner = task?.[TASK_FIELDS.owner];

  if (!owner) return "";
  if (typeof owner === "string") return owner.trim();

  return String(owner.name || owner.full_name || owner.email || "").trim();
}

export function isTaskCompleted(status) {
  return String(status ?? "").trim().toLowerCase() === "completed";
}

export function getTaskStatusStyle(status) {
  return TASK_STATUS_STYLES[String(status).trim().toLowerCase()] || NEUTRAL_STYLE;
}

export function getTaskPriorityStyle(priority) {
  return (
    TASK_PRIORITY_STYLES[String(priority).trim().toLowerCase()] || NEUTRAL_STYLE
  );
}

export function buildTaskSummary(task) {
  if (!task) return null;

  const owner = getTaskOwnerName(task);

  return {
    subject: displayValue(task[TASK_FIELDS.subject]),
    dueDate: formatDate(task[TASK_FIELDS.dueDate]),
    priority: displayValue(task[TASK_FIELDS.priority], "Not set"),
    status: displayValue(task[TASK_FIELDS.status], "Not set"),
    isCompleted: isTaskCompleted(task[TASK_FIELDS.status]),
    owner: owner || "",
  };
}
