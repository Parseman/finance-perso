"use client";

import { updateProfile } from "@/app/actions";
import { useState } from "react";

interface Profile {
  startingCapital: number;
  currentCapital: number;
  monthlyIncome: number;
  monthlyFixedCosts: number;
  currency: string;
}

interface Props {
  profile: Profile | null;
}

export function ProfileForm({ profile }: Props) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Capital de départ (€)</label>
        <input
          name="startingCapital"
          type="number"
          step="0.01"
          defaultValue={profile?.startingCapital ?? ""}
          placeholder="10000"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Capital actuel (€)</label>
        <input
          name="currentCapital"
          type="number"
          step="0.01"
          defaultValue={profile?.currentCapital ?? ""}
          placeholder="10000"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Revenus mensuels fixes (€)</label>
        <input
          name="monthlyIncome"
          type="number"
          step="0.01"
          defaultValue={profile?.monthlyIncome ?? ""}
          placeholder="3000"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Dépenses fixes mensuelles (€)</label>
        <input
          name="monthlyFixedCosts"
          type="number"
          step="0.01"
          defaultValue={profile?.monthlyFixedCosts ?? ""}
          placeholder="1500"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Devise</label>
        <select
          name="currency"
          defaultValue={profile?.currency ?? "EUR"}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        >
          <option value="EUR">EUR – Euro</option>
          <option value="USD">USD – Dollar</option>
          <option value="GBP">GBP – Livre sterling</option>
          <option value="CHF">CHF – Franc suisse</option>
        </select>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? "Sauvegarde…" : saved ? "✓ Sauvegardé !" : "Sauvegarder"}
        </button>
      </div>
    </form>
  );
}
