export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="panel rounded-[28px] p-5">
      <p className="text-sm font-semibold text-[var(--color-text-soft)]">{label}</p>
      <p className="heading-font mt-4 text-4xl font-bold">{value}</p>
      <p className="mt-3 text-sm text-[var(--color-text-soft)]">{note}</p>
    </div>
  );
}
