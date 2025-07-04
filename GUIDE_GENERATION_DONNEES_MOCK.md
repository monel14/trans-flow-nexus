# 📋 GUIDE COMPLET - GÉNÉRATION DES DONNÉES MOCK POUR TRANSFLOW NEXUS

## 🎯 Vue d'ensemble

Ce guide vous explique comment générer des données de démonstration complètes pour l'application TransFlow Nexus selon vos spécifications détaillées.

## 📊 Données qui seront créées

### 👥 Comptes utilisateurs
- **1 Admin Général** : `admin.general@transflow.com`
- **1 Sous-Admin** : `sous.admin@transflow.com`
- **1 Développeur** : `developer@transflow.com`
- **2 Chefs d'Agence** :
  - `chef.douala@transflow.com` (Agence de Douala)
  - `chef.yaoundé@transflow.com` (Agence de Yaoundé)
- **9 Agents** répartis entre les deux agences :
  - 4 agents à Douala : `agent1.douala@transflow.com` à `agent4.douala@transflow.com`
  - 5 agents à Yaoundé : `agent1.yaoundé@transflow.com` à `agent5.yaoundé@transflow.com`

**Mot de passe pour tous les comptes** : `Demo123!`

### 🏢 Structure organisationnelle
- **2 Agences** : Douala et Yaoundé
- **Rôles système** : Déjà configurés dans la base
- **Permissions** : Assignées selon les rôles

### 💳 Types d'opérations financières (réalistes pour l'Afrique de l'Ouest)
- **Dépôt Orange Money** (impact balance)
- **Retrait MTN MoMo** (impact balance)
- **Paiement Facture ENEO** (impact balance)
- **Paiement Abonnement Canal+** (impact balance)
- **Enregistrement KYC Client** (pas d'impact balance)
- **Transfert Western Union** (impact balance)

### 🔄 Opérations de test
- **~15 opérations en attente** (`status: pending`) pour tester la validation
- **~25 opérations complétées** (`status: completed`) avec commissions calculées
- **~8 opérations échouées** (`status: failed`) avec messages d'erreur réalistes

### 💰 Données financières
- **Règles de commission** : 2.5% par défaut (70% agent, 30% chef)
- **Enregistrements de commission** pour toutes les opérations complétées
- **Journal des transactions** (`transaction_ledger`) pour traçabilité

### 🎫 Flux de support
- **3 tickets de recharge ouverts** assignés aux chefs d'agence
- **1 ticket de recharge résolu** par l'admin général

### 🔔 Notifications
- Notifications d'opérations validées pour les agents
- Notifications d'opérations en attente pour les admins

## 🚀 Instructions d'exécution

### Méthode recommandée : Exécution SQL directe

1. **Ouvrez Supabase Dashboard**
   - Connectez-vous à [supabase.com](https://supabase.com)
   - Accédez à votre projet TransFlow Nexus

2. **Accédez à l'éditeur SQL**
   - Dans le menu latéral, cliquez sur "SQL Editor"
   - Créez une nouvelle requête

3. **Exécutez le script**
   - Copiez le contenu complet du fichier `generate_mock_data_complete.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" pour exécuter

4. **Vérifiez les résultats**
   - Le script affichera un rapport détaillé à la fin
   - Vérifiez les messages dans la console

### Méthode alternative : Script Python

Si vous préférez utiliser le script Python (nécessite les bonnes permissions) :

```bash
cd /app
python generate_comprehensive_mock_data.py --confirm
```

## 📋 Vérification des données créées

### Via l'interface Supabase
1. **Table Browser** → Vérifiez les tables :
   - `profiles` : Comptes utilisateurs
   - `agencies` : Agences créées
   - `operation_types` : Types d'opérations
   - `operations` : Opérations de test
   - `commission_records` : Commissions calculées

### Via l'application React
1. **Connexion** avec les comptes créés
2. **Navigation** selon les rôles :
   - Admin : Validation d'opérations, gestion système
   - Chef d'agence : Gestion agents, tickets de recharge
   - Agent : Nouvelles opérations, historique

## 🎯 Scénarios de test couverts

### ✅ Validation d'opérations
- Connexion admin → Page validation → Opérations en attente visibles
- Validation/rejet d'opérations
- Calcul automatique des commissions

### ✅ Flux de recharge
- Connexion agent → Demande de recharge
- Connexion chef → Traitement des demandes
- Connexion admin → Résolution des tickets

### ✅ Gestion des commissions
- Affichage des commissions par agent
- Historique des commissions par chef d'agence
- Rapports de commissions

### ✅ Opérations non-financières
- Test avec "Enregistrement KYC Client"
- Vérification que le balance n'est pas impacté

### ✅ Différents statuts d'opérations
- En attente (pending)
- Complétées (completed)
- Échouées (failed)
- Annulées (cancelled)

## 🔧 Données techniques

### Montants et devises
- **Devise** : XOF (Franc CFA)
- **Montants opérations** : 5,000 à 50,000 XOF
- **Commissions** : 2.5% avec min 100 XOF, max 5,000 XOF

### Références
- **Opérations** : Format `OP[YYYYMMDDHHMISS][XXX]`
- **Tickets** : Format `TCK[YYYYMMDDHHMISS][XXX]`

### Timestamps
- **Opérations récentes** : Derniers 30 jours
- **Opérations en attente** : Dernière semaine
- **Historique varié** : Distribution réaliste

## 🎉 Résultat attendu

Après exécution, vous disposerez d'une application TransFlow Nexus entièrement fonctionnelle avec :

- ✅ **Authentification** testée avec tous les rôles
- ✅ **Workflows financiers** complets
- ✅ **Données réalistes** pour démonstrations
- ✅ **Cas d'usage couverts** selon vos spécifications
- ✅ **Interface utilisateur** fonctionnelle pour tous les rôles

## 📞 Support

En cas de problème :
1. Vérifiez les messages d'erreur dans la console SQL
2. Assurez-vous que les fonctions RPC sont bien déployées
3. Vérifiez les permissions RLS si nécessaire

---

**🚀 Prêt pour la génération ? Exécutez le script SQL et profitez de votre application de démonstration complète !**