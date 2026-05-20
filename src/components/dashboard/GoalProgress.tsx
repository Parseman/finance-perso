"use client";

import { calculateBudget, BudgetCalculation, formatCurrency } from "@/lib/calculations";
import { FinancialGoal, FinancialProfile } from "@/app/actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { GoalForm } from "./GoalForm";

interface Props {
  goals: FinancialGoal[];
  profile: FinancialProfile | null;
  currency: string;
  currentMonthTotal: number;
}

export function GoalProgress({ goals, profile, currency, currentMonthTotal }: Props) {
  const [selectedId, setSelectedId] = useState(goals[0]?.id ?? "");
  const [adding, setAdding] = useState(false);

  const goal = goals.find((g) => g.id === selectedId) ?? goals[0];

  const budgetCalc: BudgetCalculation | null =
    profile && goal
      ? calculateBudget(
          {
            currentCapital: profile.currentCapital,
            monthlyIncome: profile.monthlyIncome,
            monthlyFixedCosts: profile.monthlyFixedCosts,
          },
          { targetCapital: goal.targetCapital, targetDate: goal.targetDate },
          currentMonthTotal,
          goal.createdAt
        )
      : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <span>🎯</span> Objectifs financiers
        </h2>
        <button
          onClick={() => setAdding(!adding)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {adding ? "Annuler" : "+ Nouvel objectif"}
        </button>
      </div>

      {adding ? (
        <GoalForm onSaved={() => setAdding(false)} />
      ) : (
        <>
          {goals.length > 1 && (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          )}

          {goal && budgetCalc ? (
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500">Capital cible</p>
                  <p className="text-2xl font-bold text-white mt-0.5">
                    {formatCurrency(goal.targetCapital, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Échéance</p>
                  <p className="text-sm text-gray-300 mt-0.5">
                    {format(new Date(goal.targetDate), "d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-xs text-gray-600">{budgetCalc.monthsRemaining} mois</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progression du capital</span>
                  <span>{budgetCalc.capitalProgressPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${budgetCalc.capitalProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Avancement temporel</span>
                  <span>{budgetCalc.timeProgressPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${budgetCalc.timeProgressPercent}%` }}
                  />
                </div>
              </div>

              {budgetCalc.capitalProgressPercent < budgetCalc.timeProgressPercent - 5 && (
                <p className="text-xs text-orange-400 bg-orange-500/10 rounded-lg px-3 py-2">
                  📉 Vous êtes en retard sur votre objectif de capital par rapport au temps écoulé.
                </p>
              )}
              {budgetCalc.capitalProgressPercent >= budgetCalc.timeProgressPercent && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
                  ✅ Vous êtes en avance sur votre objectif !
                </p>
              )}
            </div>
          ) : (
            <GoalForm />
          )}
        </>
      )}
    </div>
  );
}
