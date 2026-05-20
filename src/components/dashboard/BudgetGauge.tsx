"use client";

import { BudgetCalculation } from "@/lib/calculations";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  budgetCalc: BudgetCalculation;
  currency: string;
  goalLabel: string;
}

export function BudgetGauge({ budgetCalc, currency, goalLabel }: Props) {
  const {
    remainingBudget,
    maxVariableBudget,
    currentMonthSpent,
    remainingBudgetPercent,
    alertLevel,
    monthlySavingsRequired,
    monthsRemaining,
    isGoalAchievable,
  } = budgetCalc;

  const gaugeColor =
    alertLevel === "danger"
      ? "bg-red-500"
      : alertLevel === "warning"
      ? "bg-orange-400"
      : "bg-emerald-500";

  const gaugeTrack =
    alertLevel === "danger"
      ? "bg-red-500/10"
      : alertLevel === "warning"
      ? "bg-orange-500/10"
      : "bg-emerald-500/10";

  const textColor =
    alertLevel === "danger"
      ? "text-red-400"
      : alertLevel === "warning"
      ? "text-orange-400"
      : "text-emerald-400";

  const spentPercent = Math.min(
    maxVariableBudget > 0 ? (currentMonthSpent / maxVariableBudget) * 100 : 100,
    100
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Budget restant ce mois
          </p>
          <p className={`text-4xl font-bold mt-1 ${textColor}`}>
            {formatCurrency(remainingBudget, currency)}
          </p>
          {!isGoalAchievable && (
            <p className="text-xs text-red-400 mt-1">
              ⚠️ Revenu insuffisant pour atteindre l&apos;objectif
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Objectif : {goalLabel}</p>
          <p className="text-sm text-gray-400 mt-0.5">
            {monthsRemaining} mois restants
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Épargne req. :{" "}
            <span className="text-gray-300">
              {formatCurrency(monthlySavingsRequired, currency)}/mois
            </span>
          </p>
        </div>
      </div>

      {/* Barre de progression principale */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Dépensé ce mois</span>
          <span>
            {formatCurrency(currentMonthSpent, currency)} /{" "}
            {formatCurrency(maxVariableBudget, currency)}
          </span>
        </div>
        <div className={`h-3 rounded-full ${gaugeTrack} overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${gaugeColor}`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">0%</span>
          <span
            className={`font-medium ${
              remainingBudgetPercent <= 20
                ? "text-orange-400"
                : "text-gray-400"
            }`}
          >
            {remainingBudgetPercent.toFixed(0)}% restant
          </span>
          <span className="text-gray-600">100%</span>
        </div>
      </div>

      {/* Seuil d'alerte indicator */}
      <div className="relative h-1 bg-gray-800 rounded-full">
        {/* Ligne des 20% */}
        <div
          className="absolute top-0 h-full w-px bg-orange-500/50"
          style={{ left: "80%" }}
          title="Seuil d'alerte 20%"
        />
        <div
          className={`h-full rounded-full transition-all duration-700 ${gaugeColor} opacity-30`}
          style={{ width: `${spentPercent}%` }}
        />
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-xs text-gray-600">⚠ seuil 20%</span>
      </div>

      {/* Grille détails */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
        <div>
          <p className="text-xs text-gray-500">Revenus fixes</p>
          <p className="text-sm font-medium text-white mt-0.5">
            {formatCurrency(budgetCalc.maxVariableBudget + monthlySavingsRequired + currentMonthSpent, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Épargne mensuelle</p>
          <p className="text-sm font-medium text-blue-400 mt-0.5">
            {formatCurrency(monthlySavingsRequired, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Budget variable max</p>
          <p className="text-sm font-medium text-gray-300 mt-0.5">
            {formatCurrency(maxVariableBudget, currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
