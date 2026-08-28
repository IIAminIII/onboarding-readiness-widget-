import { ONBOARDING_FIELDS } from "../constants/onboardingFields.js";
import {
  hasValue,
  normalizeOnboardingStatus,
  ONBOARDING_STATUSES,
} from "./readiness.js";

export const LIFECYCLE_STEPS = [
  {
    key: "readiness_checked",
    label: "Readiness Checked",
    description: "Deal info reviewed",
  },
  {
    key: "onboarding_started",
    label: "Onboarding Started",
    description: "Handoff process started",
  },
  {
    key: "task_created",
    label: "Task Created",
    description: "Kickoff task created",
  },
  {
    key: "task_completed",
    label: "Task Completed",
    description: "Kickoff task completed",
  },
  {
    key: "onboarding_completed",
    label: "Onboarding Completed",
    description: "Project team assigned",
  },
];

/**
 * Derives the five lifecycle steps from data the widget already holds in
 * state. Never triggers a CRM call and never mutates a record.
 */
export function buildLifecycleSteps(deal, onboardingTask) {
  const level = deal?.[ONBOARDING_FIELDS.level];
  const score = deal?.[ONBOARDING_FIELDS.score];
  const status = normalizeOnboardingStatus(deal?.[ONBOARDING_FIELDS.status]);

  const readinessChecked = hasValue(level) || hasValue(score);
  const onboardingStarted =
    status === ONBOARDING_STATUSES.IN_PROGRESS ||
    status === ONBOARDING_STATUSES.COMPLETED;
  const taskCreated = Boolean(onboardingTask);
  const taskCompleted = taskCreated && Boolean(onboardingTask?.isCompleted);
  const onboardingCompleted = status === ONBOARDING_STATUSES.COMPLETED;

  const completed = [
    readinessChecked,
    onboardingStarted,
    taskCreated,
    taskCompleted,
    onboardingCompleted,
  ];

  // Exactly one step is current, and none once onboarding is completed.
  let currentIndex = -1;
  if (!onboardingCompleted) {
    if (!readinessChecked) currentIndex = 0;
    else if (!onboardingStarted) currentIndex = 1;
    else if (!taskCreated) currentIndex = 2;
    else if (!taskCompleted) currentIndex = 3;
    else currentIndex = 4;
  }

  return LIFECYCLE_STEPS.map((step, index) => {
    const isCompleted = completed[index];
    const isCurrent = index === currentIndex;

    return {
      ...step,
      completed: isCompleted,
      current: isCurrent,
      statusText: getStepStatusText(isCompleted, isCurrent),
    };
  });
}

function getStepStatusText(isCompleted, isCurrent) {
  if (isCompleted) return "Done";
  if (isCurrent) return "In progress";
  return "Pending";
}

export const LIFECYCLE_MISMATCH_MESSAGE =
  "Lifecycle mismatch detected: Onboarding is marked Completed, but the kickoff task is missing or not completed.";

/**
 * Reports the inconsistency without changing any step: onboarding is marked
 * Completed while the kickoff task is missing or still open. Step completion
 * stays evidence-based, so those steps remain pending.
 */
export function hasLifecycleMismatch(steps) {
  if (!Array.isArray(steps)) return false;

  const isDone = (key) =>
    Boolean(steps.find((step) => step.key === key)?.completed);

  return (
    isDone("onboarding_completed") &&
    !(isDone("task_created") && isDone("task_completed"))
  );
}

export function getLifecycleProgress(steps) {
  const total = steps.length;
  const done = steps.filter((step) => step.completed).length;

  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}
