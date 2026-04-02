# Nexidior-Ride : Moteur de Réservation Haute-Disponibilité

Nexidior-Ride est une infrastructure backend robuste conçue pour les plateformes de logistique et de covoiturage à forte concurrence. Développé avec NestJS, Prisma et PostgreSQL, ce moteur garantit l'intégrité absolue des données sous une charge massive tout en intégrant une logique de temps réel avancée.

## Architecture & Fonctionnalités Clés

Ce projet a été architecturé pour répondre à 4 défis techniques majeurs :

### 1. Le Core : Algorithme de Matching Temporel Dynamique
Le système ne se contente pas d'un simple matching spatial. Il intègre la notion de **"Buffer de Sécurité Voyageur"**.
* **Geospatial & Temporel :** Utilisation de requêtes spatiales couplées à l'évaluation des heures de vol, des terminaux et des temps de check-in requis.
* **Résilience IA-Proof :** Recalcul en temps réel. Si un conducteur signale un retard (ex: 15 minutes), le système invalide dynamiquement les matchs qui mettraient le passager en risque de rater son vol, garantissant la marge de sécurité.

### 2. Concurrence et Atomicité (Anti-Overbooking)
Le Moteur de Convergence est conçu pour absorber des pics de trafic massifs (ex: 100 utilisateurs sur les 3 dernières places d'un trajet Douala Centre ➔ Aéroport).
* **Pessimistic Locking :** Implémentation d'un verrouillage SQL strict (`SELECT ... FOR UPDATE`) au sein d'une transaction interactive Prisma.
* **Garantie d'intégrité :** Évite les "race conditions" et rend l'overbooking physiquement impossible au niveau de la base de données. *Un script de stress test est fourni pour le prouver.*

### 3. Architecture Event-Driven & Temps Réel
Le découplage des processus est assuré par une architecture orientée événements.
* **Event Bus :** Utilisation de `EventEmitter2` de NestJS. Dès qu'un match est validé, les actions secondaires (mise à jour des stocks, notifications, génération de tickets) sont traitées de manière asynchrone pour ne pas bloquer la transaction principale.
* **WebSockets :** Intégration d'une Gateway WebSockets permettant de pousser le statut du trajet sur le dashboard du conducteur en temps réel (< 200ms).

### 4. Sécurité & Clean Code
* **Authentification Avancée :** j'ai implémenté une stratégie d'authentification à double jeton avec **Refresh Token Rotation** :
    * **Access Token (15 min)** : Limite l'exposition en cas d'interception.
    * **Refresh Token Rotation (7 jours)** : À chaque rafraîchissement d'accès, le système invalide l'ancien Refresh Token et en génère un nouveau.
    * **Détection d'Anomalies** : Le stockage du hash en base de données permet d'invalider instantanément une session (Logout) ou de détecter des tentatives de réutilisation de jetons périmés, protégeant ainsi contre le vol de session.
    * **Pragmatisme** : Ce choix offre un équilibre optimal entre une expérience utilisateur fluide (session prolongée par l'activité) et une sécurité bancaire.
* **RBAC :** Contrôle d'accès granulaire basé sur les rôles (Passager, Conducteur, Admin).
* **Observabilité :** Middleware de tracking de performance pour mesurer la latence de chaque requête vers le moteur, couplé à un logger structuré.

---

## Installation & Démarrage

### Prérequis
* Node.js (v18+)
* PostgreSQL (avec l'extension PostGIS activée)

### Initialisation
```bash
# 1. Installation des dépendances
npm install

# 2. Configuration (Créer un fichier .env basé sur .env.example)
# DATABASE_URL="postgresql://user:password@localhost:5432/nexride?schema=public"

# 3. Génération du client Prisma et des types
npx prisma generate

# 4. Migration et peuplement de la base de données (Seed)
npx prisma db push
npx prisma db seed
 
# 5. Démarrer le serveur
npm run start:dev

# 6. Lancer le test de charge
npx ts-node scripts/stress-test.ts
```

### Documentation
```bash
# La documentation Swagger est accessible sur :
http://localhost:3000/api/docs
```

### Comment valider le Stress Test (Procédure)
Pour constater l'anti-overbooking en temps réel :
1. **Peupler la base de donnée** : `npx prisma db seed`
2. **Démarrer le serveur** : `npm run start:dev`
2. **Obtenir un Token** : Connectez-vous via Swagger (`/auth/login`) avec les identifiants du seed (`passager1@test.com` / `password123`).
2. **Obtenir un id de trajet** : Connectez-vous à la table des trajets et récupérez l'ID d'un trajet.
3. **Configurer le script** : Ouvrez `scripts/stress-test.ts`, collez le token dans la variable `VALID_TOKEN` et l'ID du trajet dans la variable `TARGET_RIDE_ID`.
4. **Lancer le test** : Dans un nouveau terminal, exécutez `npx ts-node scripts/stress-test.ts`.
*Le script affichera le nombre exact de succès correspondant aux places disponibles, prouvant l'efficacité du verrouillage pessimiste.*
