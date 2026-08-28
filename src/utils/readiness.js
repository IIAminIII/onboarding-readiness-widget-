export const READINESS_LEVELS = {
  READY: "Ready",
  NEEDS_REVIEW: "Needs Review",
  INCOMPLETE: "Incomplete",
  NOT_CHECKED: "Not Checked",
};

const LEVEL_STYLES = {
  [READINESS_LEVELS.READY]: {
    main: "#16A34A",
    light: "#DCFCE7",
    text: "#166534",
  },
  [READINESS_LEVELS.NEEDS_REVIEW]: {
    main: "#F97316",
    light: "#FFEDD5",
    text: "#9A3412",
  },
  [READINESS_LEVELS.INCOMPLETE]: {
    main: "#EF4444",
    light: "#FEE2E2",
    text: "#991B1B",
  },
  [READINESS_LEVELS.NOT_CHECKED]: {
    main: "#64748B",
    light: "#F1F5F9",
    text: "#475569",
  },
};

export const NOT_CHECKED_ACTION =
  "Click Check Onboarding Readiness to calculate the onboarding score.";

export function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function normalizeReadinessLevel(value) {
  if (!hasValue(value)) return READINESS_LEVELS.NOT_CHECKED;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "ready") return READINESS_LEVELS.READY;
  if (normalized === "needs review") return READINESS_LEVELS.NEEDS_REVIEW;
  if (normalized === "incomplete") return READINESS_LEVELS.INCOMPLETE;
  return READINESS_LEVELS.NOT_CHECKED;
}

export function getLevelStyle(level) {
  return LEVEL_STYLES[level] || LEVEL_STYLES[READINESS_LEVELS.NOT_CHECKED];
}

export function normalizeScore(value) {
  if (!hasValue(value)) return null;

  const parsed = Number.parseFloat(String(value).replace("%", ""));
  if (!Number.isFinite(parsed)) return null;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

export function parseMissingFields(value) {
  if (!hasValue(value)) return [];

  return String(value)
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);
}

export function getSummary(level) {
  switch (level) {
    case READINESS_LEVELS.READY:
      return "All key onboarding information appears to be in place.";
    case READINESS_LEVELS.NEEDS_REVIEW:
      return "Some onboarding details still need attention.";
    case READINESS_LEVELS.INCOMPLETE:
      return "Required onboarding information is still missing.";
    default:
      return "Readiness has not been calculated for this Deal yet.";
  }
}

export function getSuggestedAction(level) {
  switch (level) {
    case READINESS_LEVELS.READY:
      return "This Deal is ready for onboarding. You can proceed with kickoff scheduling or project handoff.";
    case READINESS_LEVELS.NEEDS_REVIEW:
      return "Review the missing information and complete the important fields before starting onboarding.";
    case READINESS_LEVELS.INCOMPLETE:
      return "Complete the missing fields before starting client onboarding.";
    default:
      return NOT_CHECKED_ACTION;
  }
}

export function displayValue(value, fallback = "Not available") {
  return hasValue(value) ? String(value).trim() : fallback;
}

export function formatDate(value) {
  if (!hasValue(value)) return "Not available";

  const raw = String(value).trim();
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export const ONBOARDING_STATUSES = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  READY: "Ready for Onboarding",
  MISSING_INFORMATION: "Missing Information",
  UNKNOWN: "Unknown",
};

export const HANDOFF_ASSIGNED = "Project Team Assigned";

const STATUS_STYLES = {
  [ONBOARDING_STATUSES.COMPLETED]: {
    main: "#16A34A",
    light: "#DCFCE7",
    text: "#166534",
  },
  [ONBOARDING_STATUSES.IN_PROGRESS]: {
    main: "#2563EB",
    light: "#DBEAFE",
    text: "#1D4ED8",
  },
  [ONBOARDING_STATUSES.READY]: {
    main: "#16A34A",
    light: "#DCFCE7",
    text: "#166534",
  },
  [ONBOARDING_STATUSES.MISSING_INFORMATION]: {
    main: "#EF4444",
    light: "#FEE2E2",
    text: "#991B1B",
  },
};

export function normalizeOnboardingStatus(value) {
  if (!hasValue(value)) return ONBOARDING_STATUSES.UNKNOWN;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "completed") return ONBOARDING_STATUSES.COMPLETED;
  if (normalized === "in progress") return ONBOARDING_STATUSES.IN_PROGRESS;
  if (normalized === "ready for onboarding") return ONBOARDING_STATUSES.READY;
  if (normalized === "missing information") {
    return ONBOARDING_STATUSES.MISSING_INFORMATION;
  }
  return ONBOARDING_STATUSES.UNKNOWN;
}

export function isHandoffAssigned(value) {
  return (
    hasValue(value) &&
    String(value).trim().toLowerCase() === HANDOFF_ASSIGNED.toLowerCase()
  );
}

export function hasReadinessCheck({ level, score, lastCheck }) {
  return hasValue(level) || hasValue(score) || hasValue(lastCheck);
}

function getLevelTitle(level) {
  return level === READINESS_LEVELS.NOT_CHECKED
    ? "Readiness check required"
    : `${level} for onboarding`;
}

/**
 * Onboarding Status drives the headline, badge, colours and suggested action.
 * Anything the status does not cover falls back to the readiness level so the
 * original behaviour is preserved for unrecognised statuses.
 */
export function getLifecycle({ status, level, checked }) {
  switch (status) {
    case ONBOARDING_STATUSES.COMPLETED:
      return {
        status,
        title: "Onboarding Completed",
        badgeLabel: "Completed",
        summary:
          "Onboarding is completed for this Deal. The project team has been assigned and no further readiness action is required.",
        suggestedAction:
          "Onboarding is completed and the project team has been assigned.",
        colors: STATUS_STYLES[status],
        isCompleted: true,
      };
    case ONBOARDING_STATUSES.IN_PROGRESS:
      return {
        status,
        title: "Onboarding In Progress",
        badgeLabel: "In Progress",
        summary: "Onboarding has started and the kickoff work is underway.",
        suggestedAction:
          "Complete the kickoff task, then click Complete Onboarding.",
        colors: STATUS_STYLES[status],
        isCompleted: false,
      };
    case ONBOARDING_STATUSES.READY:
      return {
        status,
        title: "Ready for Onboarding",
        badgeLabel: "Ready",
        summary: "This Deal has everything it needs to begin onboarding.",
        suggestedAction:
          "Click Start Onboarding to begin the handoff process.",
        colors: STATUS_STYLES[status],
        isCompleted: false,
      };
    case ONBOARDING_STATUSES.MISSING_INFORMATION:
      return {
        status,
        title: "Missing Information",
        badgeLabel: "Missing Information",
        summary: getSummary(READINESS_LEVELS.INCOMPLETE),
        suggestedAction: getSuggestedAction(READINESS_LEVELS.INCOMPLETE),
        colors: STATUS_STYLES[status],
        isCompleted: false,
      };
    default:
      break;
  }

  if (!checked) {
    return {
      status: ONBOARDING_STATUSES.UNKNOWN,
      title: "Readiness check required",
      badgeLabel: READINESS_LEVELS.NOT_CHECKED,
      summary: getSummary(READINESS_LEVELS.NOT_CHECKED),
      suggestedAction: NOT_CHECKED_ACTION,
      colors: getLevelStyle(READINESS_LEVELS.NOT_CHECKED),
      isCompleted: false,
    };
  }

  return {
    status: ONBOARDING_STATUSES.UNKNOWN,
    title: getLevelTitle(level),
    badgeLabel: level,
    summary: getSummary(level),
    suggestedAction: getSuggestedAction(level),
    colors: getLevelStyle(level),
    isCompleted: false,
  };
}
