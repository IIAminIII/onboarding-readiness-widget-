const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreCircle({ score, color }) {
  const visibleScore = score ?? 0;
  const dashOffset = CIRCUMFERENCE * (1 - visibleScore / 100);
  const label = score === null ? "Not checked" : `${score}% ready`;

  return (
    <div
      className="score-circle"
      role="img"
      aria-label={`Onboarding readiness: ${label}`}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="score-circle__track" cx="60" cy="60" r={RADIUS} />
        <circle
          className="score-circle__value"
          cx="60"
          cy="60"
          r={RADIUS}
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="score-circle__label">
        <strong>{score === null ? "—" : score}</strong>
        {score !== null ? <span>%</span> : null}
      </div>
    </div>
  );
}
