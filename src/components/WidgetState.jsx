export function LoadingState() {
  return (
    <main className="widget-shell widget-shell--centered" aria-live="polite">
      <div className="state-card">
        <span className="spinner" aria-hidden="true" />
        <h1>Loading onboarding readiness</h1>
        <p>Connecting to Zoho CRM and retrieving this Deal.</p>
      </div>
    </main>
  );
}

export function ErrorState({ message }) {
  return (
    <main className="widget-shell widget-shell--centered" role="alert">
      <div className="state-card state-card--error">
        <span className="state-card__icon" aria-hidden="true">
          !
        </span>
        <h1>Unable to load readiness</h1>
        <p>{message}</p>
      </div>
    </main>
  );
}
