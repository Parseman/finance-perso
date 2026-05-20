# FinancePerso 💸

Application de gestion de finances personnelles construite avec Next.js 14, SQLite/Prisma et NextAuth.

---

## Architecture du projet

```
finance-app/
├── prisma/
│   ├── schema.prisma          # Schéma BDD (SQLite)
│   ├── seed.ts                # Script de seed (optionnel)
│   └── dev.db                 # Fichier SQLite (généré)
│
├── src/
│   ├── app/
│   │   ├── actions.ts         # Server Actions (dépenses, profil, objectif, stats)
│   │   ├── layout.tsx         # Layout racine
│   │   ├── page.tsx           # Redirection vers /dashboard ou /auth/signin
│   │   ├── globals.css        # Styles globaux (Tailwind)
│   │   ├── providers.tsx      # SessionProvider
│   │   │
│   │   ├── api/auth/
│   │   │   └── [...nextauth]/route.ts  # Handler NextAuth
│   │   │
│   │   ├── auth/
│   │   │   ├── signin/page.tsx         # Page de connexion (magic link)
│   │   │   ├── verify/page.tsx         # Page confirmation email envoyé
│   │   │   └── error/page.tsx          # Page erreur (accès refusé, etc.)
│   │   │
│   │   └── dashboard/
│   │       └── page.tsx       # Dashboard principal (Server Component)
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── BudgetGauge.tsx    # Jauge visuelle budget restant + alertes
│   │   │   ├── ExpenseForm.tsx    # Formulaire ajout dépense
│   │   │   ├── ExpenseList.tsx    # Liste dépenses récentes + suppression
│   │   │   ├── ProfileForm.tsx    # Formulaire profil financier
│   │   │   ├── GoalForm.tsx       # Formulaire objectif financier
│   │   │   ├── GoalProgress.tsx   # Progression vers l'objectif
│   │   │   └── StatsCards.tsx     # 4 cartes de stats
│   │   └── ui/
│   │       └── toaster.tsx        # Notifications toast
│   │
│   ├── lib/
│   │   ├── auth.ts            # Configuration NextAuth + whitelist
│   │   ├── prisma.ts          # Client Prisma singleton
│   │   └── calculations.ts    # Toute la logique métier financière
│   │
│   └── types/
│       └── next-auth.d.ts     # Extension types NextAuth (user.id)
│
├── .env.local.example         # Variables d'environnement (à copier)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Logique métier (calculations.ts)

```
Épargne totale requise     = Capital Cible − Capital Actuel
Épargne mensuelle requise  = Épargne totale / Mois restants
Budget Variable Max        = (Revenus − Charges fixes) − Épargne mensuelle
Budget Restant             = Budget Variable Max − Dépenses variables du mois

Seuils d'alerte:
  🟢 Safe    : Budget restant > 20% du budget max
  🟠 Warning : Budget restant entre 0% et 20% du budget max
  🔴 Danger  : Budget restant < 0% (dépassement)
```

---

## Installation

### 1. Cloner / créer le projet

```bash
# Créer un nouveau projet Next.js avec ce code
# Ou cloner ce dépôt

cd finance-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
```

Éditez `.env.local` :

```env
DATABASE_URL="file:./dev.db"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générez-avec: openssl rand -base64 32"

# Authentification par magic link (email)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="votre-email@gmail.com"
EMAIL_SERVER_PASSWORD="votre-mot-de-passe-app-google"
EMAIL_FROM="FinancePerso <votre-email@gmail.com>"

# Whitelist : seuls ces emails peuvent se connecter
ALLOWED_EMAILS="vous@example.com"
```

> **Gmail** : activez l'authentification 2FA puis créez un "mot de passe d'application" sur https://myaccount.google.com/apppasswords

### 4. Initialiser la base de données

```bash
npm run db:push
```

Cela crée le fichier `prisma/dev.db` et toutes les tables.

### 5. Lancer en développement

```bash
npm run dev
```

Ouvrir http://localhost:3000

---

## Utilisation

### Première connexion
1. Allez sur http://localhost:3000
2. Entrez votre email (doit être dans `ALLOWED_EMAILS`)
3. Cliquez sur le lien reçu par email

### Configuration initiale
1. **Profil financier** → Renseignez capital de départ, capital actuel, revenus fixes, charges fixes
2. **Objectif financier** → Définissez votre capital cible et la date limite
3. Le dashboard calcule automatiquement votre budget variable mensuel

### Utilisation quotidienne
- Ajoutez vos dépenses variables via le formulaire rapide
- La jauge se met à jour en temps réel
- Surveillez les alertes orange/rouge

---

## Commandes utiles

```bash
npm run dev          # Lancer en développement
npm run build        # Build de production
npm run db:push      # Appliquer le schéma Prisma (sans migration)
npm run db:studio    # Interface graphique Prisma Studio
```

---

## Déploiement (optionnel)

### Vercel (recommandé pour Next.js)
1. `npm run build` pour vérifier que tout compile
2. Pushez sur GitHub
3. Importez sur Vercel
4. Ajoutez toutes les variables d'environnement
5. **Note** : SQLite fonctionne en dev ; pour la production Vercel, migrez vers **Turso** (SQLite edge) ou **PlanetScale** (MySQL) — changez juste le `provider` dans `schema.prisma`

### Docker (auto-hébergement)
Créez un `Dockerfile` standard Next.js + montez un volume pour `prisma/dev.db`.

---

## Évolutions possibles

- [ ] Graphiques d'évolution des dépenses (recharts — déjà installé)
- [ ] Import CSV de relevés bancaires
- [ ] Notifications email en fin de mois
- [ ] Multi-objectifs avec priorités
- [ ] Mode sombre/clair toggle
- [ ] Export PDF du rapport mensuel
