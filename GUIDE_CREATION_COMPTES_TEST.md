# Guide de Création des Comptes de Test TransFlow Nexus

## 🎯 OBJECTIF
Ce guide vous explique comment créer des comptes de test complets pour votre application TransFlow Nexus avec des données mock réalistes pour tous les cas d'utilisation.

## 📋 ÉTAPES À SUIVRE

### 1. **Appliquer d'abord le correctif RLS v3**
Assurez-vous d'avoir appliqué le script `fix_rls_recursion_v3.sql` avant de continuer.

### 2. **Créer les données mock**
Appliquez le script `generate_mock_data.sql` dans Supabase SQL Editor pour créer :
- 4 agences (Dakar, Pikine, Thiès, Saint-Louis)
- 7 types d'opérations avec champs configurables
- Règles de commission
- 15+ opérations de test avec différents statuts
- Enregistrements de commissions
- Transactions ledger
- Demandes de support et recharge
- Configuration système

### 3. **Créer les utilisateurs dans Supabase Auth**
Allez dans **Authentication > Users** dans votre tableau de bord Supabase et créez ces utilisateurs :

#### 👨‍💼 ADMINISTRATEURS
```
Email: admin@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 11111111-1111-1111-1111-111111111111
Métadonnées: {"name": "Moussa DIOP", "role": "admin_general"}
```

```
Email: sousadmin@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 22222222-2222-2222-2222-222222222222
Métadonnées: {"name": "Aminata FALL", "role": "sous_admin"}
```

#### 👨‍💻 DÉVELOPPEUR
```
Email: dev@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 55555555-5555-5555-5555-555555555555
Métadonnées: {"name": "Ibrahima SARR", "role": "developer"}
```

#### 🏢 CHEFS D'AGENCE

**Chef Agence Dakar Centre**
```
Email: chef.dakar@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 33333333-3333-3333-3333-333333333333
Métadonnées: {"name": "Ousmane KANE", "role": "chef_agence", "agency": "Dakar Centre"}
```

**Chef Agence Pikine**
```
Email: chef.pikine@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 33333333-3333-3333-3333-333333333334
Métadonnées: {"name": "Adama THIAW", "role": "chef_agence", "agency": "Pikine"}
```

**Chef Agence Thiès**
```
Email: chef.thies@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 33333333-3333-3333-3333-333333333335
Métadonnées: {"name": "Babacar NDOUR", "role": "chef_agence", "agency": "Thiès"}
```

#### 👥 AGENTS

**Agents Agence Dakar Centre**
```
Email: agent1.dakar@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 44444444-4444-4444-4444-444444444444
Métadonnées: {"name": "Fatou NDIAYE", "role": "agent", "agency": "Dakar Centre"}
```

```
Email: agent2.dakar@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 44444444-4444-4444-4444-444444444445
Métadonnées: {"name": "Mamadou DIOUF", "role": "agent", "agency": "Dakar Centre"}
```

```
Email: agent3.dakar@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 44444444-4444-4444-4444-444444444446
Métadonnées: {"name": "Awa SECK", "role": "agent", "agency": "Dakar Centre"}
```

**Agents Agence Pikine**
```
Email: agent1.pikine@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 44444444-4444-4444-4444-444444444447
Métadonnées: {"name": "Seynabou GUEYE", "role": "agent", "agency": "Pikine"}
```

```
Email: agent2.pikine@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 44444444-4444-4444-4444-444444444448
Métadonnées: {"name": "Modou SALL", "role": "agent", "agency": "Pikine"}
```

**Agent Agence Thiès**
```
Email: agent1.thies@transflownexus.com
Mot de passe: TransFlow2024!
ID utilisateur: 44444444-4444-4444-4444-444444444449
Métadonnées: {"name": "Mariama WADE", "role": "agent", "agency": "Thiès"}
```

## 🎮 CAS D'UTILISATION DISPONIBLES

### 📊 **Données Disponibles pour Test**

#### **Opérations**
- ✅ Transferts nationaux (complétés, en attente, échoués)
- ✅ Transferts internationaux (vers France, Mali, etc.)
- ✅ Dépôts et retraits d'espèces
- ✅ Paiements de factures (SENELEC, SDE)
- ✅ Recharges mobiles (Orange, Free, Expresso)
- ✅ Changes de devises

#### **Commissions**
- ✅ Commissions générées et réparties (agent 60%, chef 25%, agence 15%)
- ✅ Différents statuts (gagnées, en attente, annulées)

#### **Gestion**
- ✅ Demandes de recharge (approuvées, en attente, rejetées)
- ✅ Tickets de support (différentes catégories et priorités)
- ✅ Logs d'erreur système
- ✅ Configuration système

### 🔍 **Tests Possibles par Rôle**

#### **👨‍💼 Admin Général** (`admin@transflownexus.com`)
- Dashboard global avec KPIs
- Gestion des agences et chefs d'agence
- Validation des opérations importantes
- Vue globale des commissions
- Gestion des tickets de support
- Configuration système

#### **👨‍🏢 Chef d'Agence** (`chef.dakar@transflownexus.com`)
- Dashboard de son agence
- Gestion des agents de son agence
- Validation des opérations de ses agents
- Suivi des commissions d'agence
- Approbation des demandes de recharge

#### **👥 Agent** (`agent1.dakar@transflownexus.com`)
- Dashboard personnel
- Création d'opérations de tous types
- Suivi de ses commissions
- Demandes de recharge
- Historique de ses transactions

#### **👨‍💻 Développeur** (`dev@transflownexus.com`)
- Configuration des types d'opérations
- Gestion des champs dynamiques
- Règles de commission
- Logs d'erreur système
- Métriques techniques

## 🎯 **Scénarios de Test Recommandés**

### 1. **Test Workflow Complet**
1. Se connecter comme agent
2. Créer une nouvelle opération
3. Se connecter comme chef d'agence
4. Valider l'opération
5. Vérifier la génération des commissions
6. Vérifier les entrées dans le ledger

### 2. **Test Gestion Multi-Agences**
1. Se connecter comme admin
2. Voir les données de toutes les agences
3. Se connecter comme chef d'agence
4. Voir seulement les données de son agence

### 3. **Test Demandes et Approbations**
1. Se connecter comme agent
2. Créer une demande de recharge
3. Se connecter comme chef d'agence
4. Approuver/rejeter la demande

### 4. **Test Configuration**
1. Se connecter comme développeur
2. Modifier les types d'opérations
3. Configurer les règles de commission
4. Tester avec un agent

## ⚠️ **IMPORTANT**
- Utilisez les IDs exacts fournis pour les utilisateurs Supabase
- Les profils sont déjà créés avec ces IDs dans la base de données
- Mot de passe uniforme : `TransFlow2024!`
- Désactivez la confirmation d'email dans Supabase pour faciliter les tests

## ✅ **Vérification**
Une fois tous les comptes créés, testez la connexion avec chaque rôle pour vous assurer que :
- L'authentification fonctionne
- Les dashboards se chargent selon le rôle
- Les données apparaissent correctement
- Les opérations peuvent être créées et validées