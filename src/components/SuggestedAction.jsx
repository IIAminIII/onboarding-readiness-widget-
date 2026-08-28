export default function SuggestedAction({ message, colors }) {
  return (
    <section
      className="suggested-action"
      style={{ backgroundColor: colors.light, borderColor: colors.main }}
      aria-labelledby="suggested-action-title"
    >
      <div
        className="suggested-action__icon"
        style={{ backgroundColor: colors.main }}
        aria-hidden="true"
      >
        →
      </div>
      <div>
        <h2 id="suggested-action-title" style={{ color: colors.text }}>
          Suggested Action
        </h2>
        <p style={{ color: colors.text }}>{message}</p>
      </div>
    </section>
  );
}
