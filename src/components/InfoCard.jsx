export default function InfoCard({ label, value, accentColor }) {
  return (
    <article className="info-card">
      <span className="info-card__label">{label}</span>
      <strong className="info-card__value" style={{ color: accentColor }}>
        {value}
      </strong>
    </article>
  );
}
