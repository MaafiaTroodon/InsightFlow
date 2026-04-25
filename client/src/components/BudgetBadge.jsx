export function BudgetBadge({ isOverBudget }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isOverBudget ? 'bg-rose-500/15 text-rose-200' : 'bg-emerald-500/15 text-emerald-300'
      }`}
    >
      {isOverBudget ? 'Over Budget' : 'On Track'}
    </span>
  );
}
