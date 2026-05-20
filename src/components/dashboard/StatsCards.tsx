import { formatCurrency } from "@/lib/calculations";

interface Stats {
  currentMonthTotal: number;
  previousMonthTotal: number;
  avgMonthlyExpenses: number;
  monthOverMonthChange: number;
}


interface Props {
  stats: Stats;
  currency: string;
  profile: {
    monthlyIncome: number;
    monthlyFixedCosts: number;
    currency: string;
  } | null;
}

export function StatsCards({ stats, currency, profile }: Props) {
  const { currentMonthTotal, previousMonthTotal, avgMonthlyExpenses, monthOverMonthChange } = stats;
  const isUp = monthOverMonthChange > 0;

  const cards = [
    {
      label: "Dépenses ce mois",
      value: formatCurrency(currentMonthTotal, currency),
      sub: null,
      color: "text-white",
    },
    {
      label: "Mois précédent",
      value: formatCurrency(previousMonthTotal, currency),
      sub:
        previousMonthTotal > 0
          ? `${isUp ? "+" : ""}${monthOverMonthChange.toFixed(1)}% vs mois dernier`
          : null,
      color: isUp ? "text-red-400" : "text-emerald-400",
      subColor: isUp ? "text-red-500" : "text-emerald-500",
    },
    {
      label: "Moyenne mensuelle",
      value: formatCurrency(avgMonthlyExpenses, currency),
      sub: "3 derniers mois",
      color: "text-white",
      subColor: "text-gray-500",
    },
    {
      label: "Revenus nets",
      value: profile
        ? formatCurrency(profile.monthlyIncome - profile.monthlyFixedCosts, currency)
        : "—",
      sub: profile ? "Revenus - charges fixes" : "Configurez votre profil",
      color: "text-emerald-400",
      subColor: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4"
        >
          <p className="text-xs text-gray-500 mb-2">{card.label}</p>
          <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          {card.sub && (
            <p className={`text-xs mt-1 ${card.subColor ?? "text-gray-500"}`}>
              {card.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
