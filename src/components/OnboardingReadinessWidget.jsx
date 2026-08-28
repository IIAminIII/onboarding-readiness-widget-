import { useCallback, useEffect, useMemo, useState } from "react";
import { ONBOARDING_FIELDS } from "../constants/onboardingFields.js";
import {
  displayValue,
  formatDate,
  getLifecycle,
  HANDOFF_ASSIGNED,
  hasReadinessCheck,
  isHandoffAssigned,
  normalizeOnboardingStatus,
  normalizeReadinessLevel,
  normalizeScore,
  parseMissingFields,
} from "../utils/readiness.js";
import {
  getDealRecord,
  getReadinessRules,
  getRelatedTasks,
  getZohoSdk,
  normalizeRecordId,
} from "../services/zohoCrm.js";
import { buildTaskSummary, findOnboardingTask } from "../utils/onboardingTask.js";
import { buildLifecycleSteps } from "../utils/lifecycle.js";
import { buildActiveRules } from "../utils/readinessRules.js";
import InfoCard from "./InfoCard.jsx";
import MissingFields from "./MissingFields.jsx";
import OnboardingDetails from "./OnboardingDetails.jsx";
import OnboardingLifecycleTracker from "./OnboardingLifecycleTracker.jsx";
import OnboardingTaskCard from "./OnboardingTaskCard.jsx";
import ReadinessRules from "./ReadinessRules.jsx";
import ScoreCircle from "./ScoreCircle.jsx";
import StatusBadge from "./StatusBadge.jsx";
import SuggestedAction from "./SuggestedAction.jsx";
import { ErrorState, LoadingState } from "./WidgetState.jsx";

const OUTSIDE_DEALS_ERROR = "Please open this widget from a Deal record page.";

export default function OnboardingReadinessWidget() {
  const sdkAvailable = Boolean(
    getZohoSdk()?.embeddedApp?.on && getZohoSdk()?.embeddedApp?.init,
  );
  const [dealId, setDealId] = useState("");
  const [deal, setDeal] = useState(null);
  const [onboardingTask, setOnboardingTask] = useState(null);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [rules, setRules] = useState([]);
  const [isRulesLoading, setIsRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState("");
  const [isInitializing, setIsInitializing] = useState(sdkAvailable);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(
    sdkAvailable
      ? ""
      : "Zoho CRM SDK is unavailable. Open this widget inside Zoho CRM.",
  );

  const fetchOnboardingTask = useCallback(async (recordId) => {
    setIsTaskLoading(true);

    try {
      setTaskError("");
      const tasks = await getRelatedTasks(recordId);
      const matchedTask = findOnboardingTask(tasks);
      console.log("Onboarding Task matched record:", matchedTask);
      setOnboardingTask(buildTaskSummary(matchedTask));
    } catch (taskFetchError) {
      console.error("Onboarding Task fetch error:", taskFetchError);
      setOnboardingTask(null);
      setTaskError(
        taskFetchError?.message ||
          "Zoho CRM could not load the related Tasks. Please try again.",
      );
    } finally {
      setIsTaskLoading(false);
    }
  }, []);

  const fetchReadinessRules = useCallback(async () => {
    setIsRulesLoading(true);

    try {
      setRulesError("");
      const records = await getReadinessRules();
      setRules(buildActiveRules(records));
    } catch (rulesFetchError) {
      console.error("Onboarding Readiness rules fetch error:", rulesFetchError);
      setRules([]);
      setRulesError(
        rulesFetchError?.message ||
          "Zoho CRM could not load the readiness rules. Please try again.",
      );
    } finally {
      setIsRulesLoading(false);
    }
  }, []);

  const fetchDeal = useCallback(
    async (recordId, isRefresh = false) => {
      if (!recordId) {
        setError("The Deal ID is missing. Please reopen the widget from a Deal record.");
        setIsInitializing(false);
        return;
      }

      if (isRefresh) setIsRefreshing(true);

      try {
        setError("");
        const currentDeal = await getDealRecord(recordId);
        setDeal(currentDeal);
        // Related Tasks and admin rules are fetched after the Deal. Both
        // handle their own errors so neither blocks the readiness UI.
        await Promise.all([fetchOnboardingTask(recordId), fetchReadinessRules()]);
      } catch (fetchError) {
        console.error("Onboarding Readiness fetch error:", fetchError);
        setError(
          fetchError?.message ||
            "Zoho CRM could not load this Deal. Please try again.",
        );
      } finally {
        setIsInitializing(false);
        setIsRefreshing(false);
      }
    },
    [fetchOnboardingTask, fetchReadinessRules],
  );

  useEffect(() => {
    // Register PageLoad before initializing the Zoho Embedded App SDK.
    const zoho = getZohoSdk();
    if (!zoho?.embeddedApp?.on || !zoho?.embeddedApp?.init) {
      return;
    }

    zoho.embeddedApp.on("PageLoad", (pageData) => {
      console.log("Onboarding Readiness PageLoad data:", pageData);

      if (pageData?.Entity !== "Deals") {
        setError(OUTSIDE_DEALS_ERROR);
        setIsInitializing(false);
        return;
      }

      const recordId = normalizeRecordId(pageData?.EntityId);
      if (!recordId) {
        setError("The Deal ID is missing. Please reopen the widget from a Deal record.");
        setIsInitializing(false);
        return;
      }

      setDealId(recordId);
      fetchDeal(recordId);
    });

    try {
      zoho.embeddedApp.init();
    } catch (initializationError) {
      console.error("Onboarding Readiness SDK initialization error:", initializationError);
      queueMicrotask(() => {
        setError("Zoho CRM SDK could not be initialized. Please reopen the widget.");
        setIsInitializing(false);
      });
    }
  }, [fetchDeal]);

  const readiness = useMemo(() => {
    if (!deal) return null;

    const score = normalizeScore(deal[ONBOARDING_FIELDS.score]);
    const level = normalizeReadinessLevel(deal[ONBOARDING_FIELDS.level]);
    const rawStatus = deal[ONBOARDING_FIELDS.status];
    const rawHandoff = deal[ONBOARDING_FIELDS.handoffStatus];
    const status = normalizeOnboardingStatus(rawStatus);
    const checked = hasReadinessCheck({
      level: deal[ONBOARDING_FIELDS.level],
      score: deal[ONBOARDING_FIELDS.score],
      lastCheck: deal[ONBOARDING_FIELDS.lastCheck],
    });
    const lifecycle = getLifecycle({ status, level, checked });
    const handoffAssigned = isHandoffAssigned(rawHandoff);

    return {
      score,
      level,
      colors: lifecycle.colors,
      lifecycle,
      handoffAssigned,
      status: displayValue(rawStatus, "Not checked"),
      missingFields: parseMissingFields(deal[ONBOARDING_FIELDS.missingFields]),
      summary: lifecycle.summary,
      suggestedAction: lifecycle.suggestedAction,
      notes: displayValue(deal[ONBOARDING_FIELDS.notes], "No onboarding notes added."),
      details: [
        {
          label: "Required Assets",
          value: displayValue(deal[ONBOARDING_FIELDS.assetsStatus]),
        },
        {
          label: "Kickoff Date",
          value: formatDate(deal[ONBOARDING_FIELDS.kickoffDate]),
        },
        {
          label: "Handoff Status",
          value: displayValue(rawHandoff),
          tone: handoffAssigned ? "success" : undefined,
        },
        {
          label: "Last Readiness Check",
          value: formatDate(deal[ONBOARDING_FIELDS.lastCheck]),
        },
      ],
    };
  }, [deal]);

  const lifecycleSteps = useMemo(() => {
    if (!deal) return [];

    const steps = buildLifecycleSteps(deal, onboardingTask);
    console.log("Onboarding lifecycle steps:", steps);
    return steps;
  }, [deal, onboardingTask]);

  if (isInitializing) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!readiness) return <ErrorState message="The Deal record is unavailable." />;

  return (
    <main className="widget-shell">
      <header className="widget-header">
        <div>
          <p className="widget-header__eyebrow">Deal onboarding</p>
          <h1>Onboarding Readiness</h1>
          <p>Check whether this Deal is ready for client onboarding.</p>
        </div>
        <button
          className="refresh-button"
          type="button"
          onClick={() => fetchDeal(dealId, true)}
          disabled={isRefreshing}
        >
          <svg
            className={isRefreshing ? "refresh-button__icon is-spinning" : "refresh-button__icon"}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20 11a8.1 8.1 0 0 0-14.9-4.3L3 9m0 0V4m0 5h5M4 13a8.1 8.1 0 0 0 14.9 4.3L21 15m0 0v5m0-5h-5" />
          </svg>
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <section
        className={
          readiness.lifecycle.isCompleted
            ? "readiness-card readiness-card--success"
            : "readiness-card"
        }
        style={{ "--level-color": readiness.colors.main }}
        aria-labelledby="readiness-overview-title"
      >
        <ScoreCircle score={readiness.score} color={readiness.colors.main} />
        <div className="readiness-card__content">
          <StatusBadge
            level={readiness.lifecycle.badgeLabel}
            colors={readiness.colors}
          />
          <h2 id="readiness-overview-title">{readiness.lifecycle.title}</h2>
          <p>{readiness.summary}</p>
          <div className="readiness-card__status">
            <div className="readiness-card__status-item">
              <span>Onboarding status</span>
              <strong>{readiness.status}</strong>
            </div>
            {readiness.handoffAssigned ? (
              <div className="readiness-card__status-item">
                <span>Handoff</span>
                <strong className="handoff-chip">
                  <span aria-hidden="true">✓</span>
                  {HANDOFF_ASSIGNED}
                </strong>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="info-grid" aria-label="Readiness overview">
        <InfoCard
          label="Readiness Score"
          value={readiness.score === null ? "Not checked" : `${readiness.score}%`}
          accentColor={readiness.colors.main}
        />
        <InfoCard
          label="Readiness Level"
          value={readiness.level}
          accentColor={readiness.colors.main}
        />
        <InfoCard
          label="Onboarding Status"
          value={readiness.status}
          accentColor="#111827"
        />
      </section>

      <OnboardingLifecycleTracker
        steps={lifecycleSteps}
        taskUnavailable={isTaskLoading || Boolean(taskError)}
      />

      <MissingFields fields={readiness.missingFields} />
      <SuggestedAction
        message={readiness.suggestedAction}
        colors={readiness.colors}
      />
      <OnboardingTaskCard
        task={onboardingTask}
        isLoading={isTaskLoading}
        error={taskError}
      />
      <OnboardingDetails items={readiness.details} notes={readiness.notes} />
      <ReadinessRules
        rules={rules}
        isLoading={isRulesLoading}
        error={rulesError}
      />
    </main>
  );
}
