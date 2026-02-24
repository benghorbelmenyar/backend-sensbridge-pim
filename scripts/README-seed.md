# Données de démo (seed)

## Pourquoi le dashboard et les approbations sont vides ?

Les compteurs à 0 et les tableaux vides sont **normaux** quand la base est neuve :

- **Dashboard** : les KPIs et graphiques lisent les collections `userprofiles`, `alerts`, `eventlogs`, `devices`. Si aucune donnée n’a été créée (ni depuis l’admin ni depuis l’app), tout reste à 0.
- **Approbations (app mobile)** : la liste « En attente » et « Utilisateurs app mobile » viennent de la collection **users** (inscriptions depuis l’app). Sans inscription depuis l’app, ces listes sont vides.

## Remplir avec des données de démo

Depuis la racine du backend :

```bash
npm run seed:dashboard
```

Ou directement :

```bash
node scripts/seed-dashboard.js
```

Le script insère :

- **Users (app mobile)** : 3 utilisateurs (1 en attente, 2 approuvés) → visibles dans **Approbations**
- **UserProfiles** : 8 profils CDC → **Utilisateurs (profils)** et graphique « Utilisateurs par profil »
- **Alertes** : sur les 7 derniers jours (Pleurs, Sirènes, Verre cassé) → **Alerts Overview** et « Alertes aujourd’hui »
- **Event logs** : ~25 événements → **Event Logs**
- **Devices** : 3 devices (dont 2 « connectés ») → **Devices actifs**

Ensuite, rechargez le dashboard et la page Approbations pour voir les données.

**Note** : Les utilisateurs seed ont le mot de passe `Password123` (pour tests uniquement). Ré-exécuter le script n’écrase pas les utilisateurs existants (même email) mais ajoute des alertes/events à chaque fois.
