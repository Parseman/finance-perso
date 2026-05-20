import {
  startOfMonth,
  endOfMonth,
  differenceInCalendarMonths,
  addMonths,
} from "date-fns";

export interface FinancialProfile {
  currentCapital: number;
  monthlyIncome: number;
  monthlyFixedCosts: number;
}

export interface FinancialGoal {
  targetCapital: number;
  targetDate: Date;
}

export interface BudgetCalculation {
  // Épargne
  totalSavingsRequired: number;
  monthlySavingsRequired: number;
  monthsRemaining: number;

  // Budget mensuel
  maxVariableBudget: number;
  currentMonthSpent: number;
  remainingBudget: number;
  remainingBudgetPercent: number;

  // Alertes
  alertLevel: "safe" | "warning" | "danger";
  isGoalAchievable: boolean;

  // Progression
  capitalProgressPercent: number;
  timeProgressPercent: number;
}

export function calculateBudget(
  profile: FinancialProfile,
  goal: FinancialGoal,
  currentMonthExpenses: number,
  goalCreatedAt: Date = new Date()
): BudgetCalculation {
  const now = new Date();
  const monthsRemaining = Math.max(
    differenceInCalendarMonths(goal.targetDate, now),
    1
  );

  // Logique métier principale
  const totalSavingsRequired = Math.max(
    goal.targetCapital - profile.currentCapital,
    0
  );
  const monthlySavingsRequired = totalSavingsRequired / monthsRemaining;
  const maxVariableBudget =
    profile.monthlyIncome - profile.monthlyFixedCosts - monthlySavingsRequired;
  const remainingBudget = maxVariableBudget - currentMonthExpenses;
  const remainingBudgetPercent =
    maxVariableBudget > 0
      ? Math.max((remainingBudget / maxVariableBudget) * 100, 0)
      : 0;

  // Niveaux d'alerte
  let alertLevel: "safe" | "warning" | "danger" = "safe";
  if (remainingBudgetPercent <= 0 || remainingBudget < 0) {
    alertLevel = "danger";
  } else if (remainingBudgetPercent <= 20) {
    alertLevel = "warning";
  }

  // Est-ce que l'objectif est atteignable ?
  const isGoalAchievable = maxVariableBudget >= 0;

  // Progression vers l'objectif
  const totalRequired = goal.targetCapital - (profile.currentCapital - totalSavingsRequired);
  const capitalProgressPercent =
    goal.targetCapital > 0
      ? Math.min((profile.currentCapital / goal.targetCapital) * 100, 100)
      : 100;

  const totalMonths = differenceInCalendarMonths(goal.targetDate, goalCreatedAt);
  const elapsedMonths = totalMonths - monthsRemaining;
  const timeProgressPercent =
    totalMonths > 0
      ? Math.min((elapsedMonths / totalMonths) * 100, 100)
      : 100;

  return {
    totalSavingsRequired,
    monthlySavingsRequired,
    monthsRemaining,
    maxVariableBudget,
    currentMonthSpent: currentMonthExpenses,
    remainingBudget,
    remainingBudgetPercent,
    alertLevel,
    isGoalAchievable,
    capitalProgressPercent,
    timeProgressPercent,
  };
}

export function getCurrentMonthRange() {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

export function getPreviousMonthRange() {
  const now = new Date();
  const prevMonth = addMonths(now, -1);
  return {
    start: startOfMonth(prevMonth),
    end: endOfMonth(prevMonth),
  };
}

export function formatCurrency(
  amount: number,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
