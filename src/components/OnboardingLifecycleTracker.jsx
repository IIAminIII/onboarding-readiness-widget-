import {
  getLifecycleProgress,
  hasLifecycleMismatch,
  LIFECYCLE_MISMATCH_MESSAGE,
} from "../utils/lifecycle.js";

function getStepClassName(step) {
  if (step.completed) return "lifecycle-step is-completed";
  if (step.current) return "lifecycle-step is-current";
  return "lifecycle-step is-pending";
}

function getLineClassName(position, isDone) {
  const base = `lifecycle-step__line lifecycle-step__line--${position}`;
  return isDone ? `${base} is-done` : base;
}

export default function OnboardingLifecycleTracker({ steps, taskUnavailable }) {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const progress = getLifecycleProgress(steps);
  // A failed task fetch is reported in the Onboarding Task card; do not also
  // claim the task is missing when it simply could not be read.
  const showMismatch = !taskUnavailable && hasLifecycleMismatch(steps);

  return (
    <section className="section-card" aria-labelledby="onboarding-lifecycle-title">
      <div className="section-heading">
        <div>
          <h2 id="onboarding-lifecycle-title">Onboarding Lifecycle</h2>
          <p>Track the progress from readiness check to completed onboarding.</p>
        </div>
        <span className="section-count">
          {progress.done}/{progress.total}
        </span>
      </div>

      {showMismatch ? (
        <p className="lifecycle-warning" role="status">
          <span className="lifecycle-warning__icon" aria-hidden="true">
            !
          </span>
          {LIFECYCLE_MISMATCH_MESSAGE}
        </p>
      ) : null}

      <ol className="lifecycle-track">
        {steps.map((step, index) => (
          <li className={getStepClassName(step)} key={step.key}>
            <div className="lifecycle-step__marker">
              <span
                className={getLineClassName(
                  "before",
                  Boolean(steps[index - 1]?.completed),
                )}
                aria-hidden="true"
              />
              <span className="lifecycle-step__circle">
                {step.completed ? (
                  <span aria-hidden="true">✓</span>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={getLineClassName("after", step.completed)}
                aria-hidden="true"
              />
            </div>

            <div className="lifecycle-step__body">
              <span className="lifecycle-step__label">
                {step.label}
                {step.current ? (
                  <span className="lifecycle-step__badge">Current</span>
                ) : null}
              </span>
              <span className="lifecycle-step__description">
                {step.description}
              </span>
              <span className="lifecycle-step__status">{step.statusText}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
