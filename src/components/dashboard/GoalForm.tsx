"use client";

import { addGoal } from "@/app/actions";
import { useState } from "react";
import { format, addMonths } from "date-fns";

interface Props {
  onSaved?: () => void;
}

export function GoalForm({ onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const defaultDate = format(addMonths(new Date(), 12), "yyyy-MM-dd");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addGoal(formData);
      onSaved?.();
    } catch (e) {
      alert("Erreur : " + (e as Error).message);
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Libellé de l&apos;objectif</label>
        <input
          name="label"
          type="text"
          placeholder="Ex: Apport immobilier, Voyage…"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Capital cible (€)</label>
        <input
          name="targetCapital"
          type="number"
          step="0.01"
          required
          placeholder="50000"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Date cible</label>
        <input
          name="targetDate"
          type="date"
          required
          defaultValue={defaultDate}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? "Enregistrement…" : "Ajouter l'objectif"}
      </button>
    </form>
  );
}
