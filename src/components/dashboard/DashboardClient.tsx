"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { calculateBudget, formatCurrency } from "@/lib/calculations";
import { Expense, FinancialGoal, FinancialProfile } from "@/app/actions";
import { BudgetGauge } from "./BudgetGauge";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseList } from "./ExpenseList";
import { ProfileForm } from "./ProfileForm";
import { GoalProgress } from "./GoalProgress";
import { StatsCards } from "./StatsCards";

interface Props {
  userEmail: string;
  profile: FinancialProfile | null;
  goals: FinancialGoal[];
  goal: FinancialGoal | null;
  currentExpenses: Expense[];
  previousExpenses: Expense[];
  last3MonthsExpenses: Expense[];
  recentExpenses: Expense[];
}

function filterExpenses(expenses: Expense[], includeAnticipated: boolean) {
  return includeAnticipated ? expenses : expenses.filter((e) => !e.isAnticipated);
}

export function DashboardClient({
  userEmail,
  profile,
  goals,
  goal,
  currentExpenses,
  previousExpenses,
  last3MonthsExpenses,
  recentExpenses,
}: Props) {
  const [includeAnticipated, setIncludeAnticipated] = useState(false);

  const stats = useMemo(() => {
    const current = filterExpenses(currentExpenses, includeAnticipated);
    const previous = filterExpenses(previousExpenses, includeAnticipated);
    const last3 = filterExpenses(last3MonthsExpenses, includeAnticipated);

    const currentMonthTotal = current.reduce((s, e) => s + e.amount, 0);
    const previousMonthTotal = previous.reduce((s, e) => s + e.amount, 0);
    const avgMonthlyExpenses = last3.reduce((s, e) => s + e.amount, 0) / 3;
    const categoryBreakdown = current.reduce(
      (acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; },
      {} as Record<string, number>
    );

    return {
      currentMonthTotal,
      previousMonthTotal,
      avgMonthlyExpenses,
      categoryBreakdown,
      monthOverMonthChange:
        previousMonthTotal > 0
          ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
          : 0,
    };
  }, [currentExpenses, previousExpenses, last3MonthsExpenses, includeAnticipated]);

  const budgetCalc =
    profile && goal
      ? calculateBudget(
          {
            currentCapital: profile.currentCapital,
            monthlyIncome: profile.monthlyIncome,
            monthlyFixedCosts: profile.monthlyFixedCosts,
          },
          { targetCapital: goal.targetCapital, targetDate: goal.targetDate },
          stats.currentMonthTotal,
          goal.createdAt
        )
      : null;

  const currency = profile?.currency ?? "EUR";
  const isConfigured = !!profile && !!goal;
  const monthLabel = format(new Date(), "MMMM yyyy", { locale: fr });

  const hasAnticipated =
    currentExpenses.some((e) => e.isAnticipated) ||
    recentExpenses.some((e) => e.isAnticipated);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-400">₿</span>
            <span className="font-semibold text-white">FinancePerso</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">{userEmail}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white capitalize">{monthLabel}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {isConfigured
                ? "Vue d'ensemble de vos finances"
                : "Configurez votre profil et objectif pour commencer"}
            </p>
          </div>

          {hasAnticipated && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setIncludeAnticipated((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  includeAnticipated ? "bg-amber-500" : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    includeAnticipated ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-xs text-gray-400">Inclure les dépenses anticipées</span>
            </label>
          )}
        </div>

        {budgetCalc?.alertLevel === "danger" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <p className="text-red-400 font-medium text-sm">Budget dépassé !</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Vous avez dépassé votre budget variable mensuel. Votre objectif financier est en danger.
              </p>
            </div>
          </div>
        )}
        {budgetCalc?.alertLevel === "warning" && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-orange-400 font-medium text-sm">Budget presque épuisé</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Il vous reste moins de 20% de votre budget variable. Faites attention pour atteindre votre objectif.
              </p>
            </div>
          </div>
        )}

        {budgetCalc && profile && goal && (
          <BudgetGauge budgetCalc={budgetCalc} currency={currency} goalLabel={goal.label} />
        )}

        <StatsCards stats={stats} currency={currency} profile={profile} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <span>➕</span> Ajouter une dépense
            </h2>
            <ExpenseForm />
          </div>

          <GoalProgress
            goals={goals}
            profile={profile}
            currency={currency}
            currentMonthTotal={stats.currentMonthTotal}
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-300 mb-6 flex items-center gap-2">
            <span>⚙️</span> Profil financier
          </h2>
          <ProfileForm profile={profile} />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <span>📋</span> Dépenses récentes
          </h2>
          <ExpenseList expenses={recentExpenses} currency={currency} />
        </div>
      </main>
    </div>
  );
}
