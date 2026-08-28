export default function StatusBadge({ level, colors }) {
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: colors.light, color: colors.text }}
    >
      <span
        className="status-badge__dot"
        style={{ backgroundColor: colors.main }}
        aria-hidden="true"
      />
      {level}
    </span>
  );
}
