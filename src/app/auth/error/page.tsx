"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  AccessDenied: "Votre adresse email n'est pas autorisée à accéder à cette application.",
  Default: "Une erreur s'est produite lors de la connexion.",
};

export default function AuthError() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Accès refusé</h1>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <Link
          href="/auth/signin"
          className="inline-block bg-gray-800 hover:bg-gray-700 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
