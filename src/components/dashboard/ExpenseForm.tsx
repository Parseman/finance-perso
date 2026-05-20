"use client";

import { addExpense } from "@/app/actions";
import { useRef, useState } from "react";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "food", label: "🍔 Alimentation" },
  { value: "transport", label: "🚗 Transport" },
  { value: "leisure", label: "🎮 Loisirs" },
  { value: "health", label: "💊 Santé" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "bills", label: "📄 Factures" },
  { value: "other", label: "📦 Autre" },
];

export function ExpenseForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addExpense(formData);
      formRef.current?.reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      alert("Erreur : " + (e as Error).message);
    }
    setLoading(false);
  }

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Montant (€)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Date</label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Description</label>
        <input
          name="description"
          type="text"
          required
          placeholder="Ex: Courses Monoprix"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Catégorie</label>
        <select
          name="category"
          defaultValue="other"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          name="isAnticipated"
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 accent-amber-500"
        />
        <span className="text-xs text-gray-400">Dépense anticipée</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? "Ajout…" : success ? "✓ Ajouté !" : "Ajouter la dépense"}
      </button>
    </form>
  );
}
