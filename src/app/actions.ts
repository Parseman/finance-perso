"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getCurrentMonthRange, getPreviousMonthRange } from "@/lib/calculations";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FinancialProfile {
  id: string;
  userId: string;
  startingCapital: number;
  currentCapital: number;
  monthlyIncome: number;
  monthlyFixedCosts: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  isAnticipated: boolean;
  createdAt: Date;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  targetCapital: number;
  targetDate: Date;
  label: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfile(row: any): FinancialProfile {
  return {
    id: row.id,
    userId: row.user_id,
    startingCapital: row.starting_capital,
    currentCapital: row.current_capital,
    monthlyIncome: row.monthly_income,
    monthlyFixedCosts: row.monthly_fixed_costs,
    currency: row.currency,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExpense(row: any): Expense {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    description: row.description,
    category: row.category,
    date: new Date(row.date),
    isAnticipated: row.is_anticipated ?? false,
    createdAt: new Date(row.created_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGoal(row: any): FinancialGoal {
  return {
    id: row.id,
    userId: row.user_id,
    targetCapital: row.target_capital,
    targetDate: new Date(row.target_date),
    label: row.label,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ─── Dépenses ────────────────────────────────────────────────────────────────

export async function addExpense(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non authentifié");

  const amount = parseFloat(formData.get("amount") as string);
  const description = (formData.get("description") as string).trim();
  const category = (formData.get("category") as string) || "other";
  const dateStr = formData.get("date") as string;
  const date = dateStr ? new Date(dateStr) : new Date();
  const isAnticipated = formData.get("isAnticipated") === "on";

  if (!amount || amount <= 0) throw new Error("Montant invalide");
  if (!description) throw new Error("Description requise");

  const { error } = await supabase.from("expenses").insert({
    user_id: session.user.id,
    amount,
    description,
    category,
    date: date.toISOString(),
    is_anticipated: isAnticipated,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

// ─── Profil financier ────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non authentifié");

  const { error } = await supabase.from("financial_profiles").upsert(
    {
      user_id: session.user.id,
      starting_capital: parseFloat(formData.get("startingCapital") as string) || 0,
      current_capital: parseFloat(formData.get("currentCapital") as string) || 0,
      monthly_income: parseFloat(formData.get("monthlyIncome") as string) || 0,
      monthly_fixed_costs: parseFloat(formData.get("monthlyFixedCosts") as string) || 0,
      currency: (formData.get("currency") as string) || "EUR",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

// ─── Objectif financier ──────────────────────────────────────────────────────

export async function addGoal(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non authentifié");

  const targetCapital = parseFloat(formData.get("targetCapital") as string);
  const targetDate = new Date(formData.get("targetDate") as string);
  const label = (formData.get("label") as string) || "Mon objectif";

  if (!targetCapital || targetCapital <= 0) throw new Error("Capital cible invalide");
  if (!targetDate || isNaN(targetDate.getTime())) throw new Error("Date invalide");

  const { error } = await supabase.from("financial_goals").insert({
    user_id: session.user.id,
    target_capital: targetCapital,
    target_date: targetDate.toISOString(),
    label,
    is_active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

// ─── Statistiques ────────────────────────────────────────────────────────────

export async function getDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non authentifié");

  const userId = session.user.id;
  const { start: currentStart, end: currentEnd } = getCurrentMonthRange();
  const { start: prevStart, end: prevEnd } = getPreviousMonthRange();

  const [
    profileResult,
    goalsResult,
    currentExpensesResult,
    previousExpensesResult,
    recentExpensesResult,
  ] = await Promise.all([
    supabase.from("financial_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .gte("date", currentStart.toISOString())
      .lte("date", currentEnd.toISOString())
      .order("date", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .gte("date", prevStart.toISOString())
      .lte("date", prevEnd.toISOString()),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(10),
  ]);

  const profile = profileResult.data ? mapProfile(profileResult.data) : null;
  const goals = (goalsResult.data ?? []).map(mapGoal);
  const currentExpenses = (currentExpensesResult.data ?? []).map(mapExpense);
  const previousExpenses = (previousExpensesResult.data ?? []).map(mapExpense);
  const recentExpenses = (recentExpensesResult.data ?? []).map(mapExpense);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const { data: last3MonthsRaw } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .gte("date", threeMonthsAgo.toISOString());
  const last3MonthsExpenses = (last3MonthsRaw ?? []).map(mapExpense);

  return {
    profile,
    goals,
    goal: goals[0] ?? null,
    currentExpenses,
    previousExpenses,
    last3MonthsExpenses,
    recentExpenses,
  };
}
