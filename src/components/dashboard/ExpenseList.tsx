"use client";

import { deleteExpense } from "@/app/actions";
import { formatCurrency } from "@/lib/calculations";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  leisure: "🎮",
  health: "💊",
  shopping: "🛍️",
  bills: "📄",
  other: "📦",
};

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  isAnticipated: boolean;
}

interface Props {
  expenses: Expense[];
  currency: string;
}

export function ExpenseList({ expenses, currency }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette dépense ?")) return;
    setDeleting(id);
    await deleteExpense(id);
    setDeleting(null);
  }

  if (expenses.length === 0) {
    return (
      <p className="text-gray-600 text-sm text-center py-8">
        Aucune dépense enregistrée.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className={`flex items-center justify-between py-3 px-4 rounded-xl transition-colors group ${
            expense.isAnticipated
              ? "bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20"
              : "bg-gray-800/50 hover:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{CATEGORY_ICONS[expense.category] ?? "📦"}</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-white font-medium">{expense.description}</p>
                {expense.isAnticipated && (
                  <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-md">
                    anticipée
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {format(new Date(expense.date), "d MMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${expense.isAnticipated ? "text-amber-400" : "text-white"}`}>
              -{formatCurrency(expense.amount, currency)}
            </span>
            <button
              onClick={() => handleDelete(expense.id)}
              disabled={deleting === expense.id}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-xs disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
