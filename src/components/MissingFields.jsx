export default function MissingFields({ fields }) {
  const hasMissingFields = fields.length > 0;

  return (
    <section className="section-card" aria-labelledby="missing-fields-title">
      <div className="section-heading">
        <div>
          <h2 id="missing-fields-title">Missing Fields</h2>
          <p>Information still required before onboarding can begin.</p>
        </div>
        <span className="section-count">
          {hasMissingFields ? fields.length : 0}
        </span>
      </div>

      <div className="pill-list">
        {hasMissingFields ? (
          fields.map((field) => (
            <span className="pill pill--missing" key={field}>
              <span aria-hidden="true">×</span>
              {field}
            </span>
          ))
        ) : (
          <span className="pill pill--complete">
            <span aria-hidden="true">✓</span>
            No missing fields
          </span>
        )}
      </div>
    </section>
  );
}
