export default function OnboardingDetails({ items, notes }) {
  return (
    <section className="section-card" aria-labelledby="onboarding-details-title">
      <div className="section-heading">
        <div>
          <h2 id="onboarding-details-title">Onboarding Details</h2>
          <p>Supporting readiness information from the Deal record.</p>
        </div>
      </div>

      <dl className="details-grid">
        {items.map((item) => (
          <div
            className={
              item.tone === "success"
                ? "detail-item detail-item--success"
                : "detail-item"
            }
            key={item.label}
          >
            <dt>{item.label}</dt>
            <dd>
              {item.tone === "success" ? (
                <span className="detail-item__check" aria-hidden="true">
                  ✓
                </span>
              ) : null}
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="notes-block">
        <span>Onboarding Notes</span>
        <p>{notes}</p>
      </div>
    </section>
  );
}
