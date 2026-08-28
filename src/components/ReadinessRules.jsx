import { NO_RULES_MESSAGE } from "../constants/readinessRules.js";
import { getRulesSummary } from "../utils/readinessRules.js";
import InfoCard from "./InfoCard.jsx";

function RuleBadges() {
  return (
    <span className="rule-item__badges">
      <span className="rule-badge rule-badge--required">Required</span>
      <span className="rule-badge rule-badge--active">Active</span>
    </span>
  );
}

export default function ReadinessRules({ rules, isLoading, error }) {
  const heading = (
    <div className="section-heading">
      <div>
        <h2 id="readiness-rules-title">Readiness Rules</h2>
        <p>Active admin rules used to calculate this Deal’s readiness score.</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section
        className="section-card"
        aria-labelledby="readiness-rules-title"
        aria-live="polite"
      >
        {heading}
        <div className="task-inline-state">
          <span className="spinner spinner--inline" aria-hidden="true" />
          <p>Loading readiness rules from Zoho CRM…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-card" aria-labelledby="readiness-rules-title">
        {heading}
        <div className="task-inline-state task-inline-state--error" role="alert">
          <span className="task-inline-state__icon" aria-hidden="true">
            !
          </span>
          <div>
            <strong>Readiness rules could not be loaded.</strong>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const list = Array.isArray(rules) ? rules : [];
  const summary = getRulesSummary(list);

  return (
    <section className="section-card" aria-labelledby="readiness-rules-title">
      {heading}

      <div className="info-grid info-grid--flush">
        <InfoCard
          label="Active Rules"
          value={summary.activeRulesCount}
          accentColor="#111827"
        />
        <InfoCard
          label="Total Weight"
          value={summary.totalRuleWeight}
          accentColor="#2563EB"
        />
        <InfoCard
          label="Target Module"
          value={summary.targetModule}
          accentColor="#111827"
        />
      </div>

      {list.length === 0 ? (
        <p className="rules-empty">{NO_RULES_MESSAGE}</p>
      ) : (
        <ul className="rule-list">
          {list.map((rule) => (
            <li className="rule-item" key={rule.id}>
              <div className="rule-item__main">
                <span className="rule-item__label">{rule.label}</span>
                <span className="rule-item__weight">Weight: {rule.weight}</span>
              </div>
              <RuleBadges />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
