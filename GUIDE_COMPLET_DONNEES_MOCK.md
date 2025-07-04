# 🎯 GUIDE COMPLET - CRÉATION DES DONNÉES MOCK TRANSFLOW NEXUS

## 📚 OBJECTIF
Ce guide vous permet de créer un environnement de test complet avec des données réalistes pour tous les cas d'utilisation de votre application TransFlow Nexus.

## 🚀 INSTRUCTIONS ÉTAPE PAR ÉTAPE

### ✅ **ÉTAPE 1 : Corriger le problème RLS** (OBLIGATOIRE)
1. Appliquez d'abord le script `fix_rls_recursion_v3.sql` dans Supabase SQL Editor
2. Vérifiez que vous voyez le message "Migration v3 terminée avec succès !"

### ✅ **ÉTAPE 2 : Créer les données mock**
1. Dans Supabase SQL Editor, exécutez le script `generate_mock_data.sql`
2. Vérifiez que vous voyez le message "DONNÉES MOCK CRÉÉES AVEC SUCCÈS !"

### ✅ **ÉTAPE 3 : Vérifier les données**
1. Exécutez le script `verify_mock_data.sql` pour vérifier que tout est correct
2. Vérifiez que tous les éléments affichent "✅ OK"

### ✅ **ÉTAPE 4A : Créer les utilisateurs (Option Automatique)**
1. Récupérez votre clé `service_role` dans Supabase (Settings > API)
2. Modifiez le fichier `create_test_users.py` avec votre clé
3. Exécutez le script : `python create_test_users.py`

### ✅ **ÉTAPE 4B : Créer les utilisateurs (Option Manuelle)**
1. Suivez les instructions dans `GUIDE_CREATION_COMPTES_TEST.md`
2. Créez chaque utilisateur manuellement dans Supabase Auth

## 📊 DONNÉES CRÉÉES

### 🏢 **4 AGENCES**
- **Dakar Centre** : Chef + 3 agents, balance 1,500,000 XOF
- **Pikine** : Chef + 2 agents, balance 800,000 XOF  
- **Thiès** : Chef + 1 agent, balance 650,000 XOF
- **Saint-Louis** : Agence sans personnel assigné

### 👥 **12 UTILISATEURS**
- 1 Admin général
- 1 Sous-administrateur  
- 1 Développeur
- 3 Chefs d'agence
- 6 Agents répartis dans les agences

### 🔧 **7 TYPES D'OPÉRATIONS CONFIGURÉS**
- Transfert National (avec champs bénéficiaire, téléphone, ville)
- Transfert International (avec pays, devise)
- Dépôt/Retrait Espèces
- Paiement Factures (SENELEC, SDE, etc.)
- Recharge Mobile (Orange, Free, Expresso)
- Change de Devise

### 💼 **15+ OPÉRATIONS DE TEST**
- Différents statuts : complétées, en attente, validation requise, échouées
- Réparties sur plusieurs jours
- Montants variés de 2,000 à 120,000 XOF
- Commissions automatiquement calculées

### 💰 **SYSTÈME DE COMMISSIONS COMPLET**
- Règles configurées par type d'opération
- Répartition automatique : Agent 60%, Chef 25%, Agence 15%
- Enregistrements de commissions liés aux opérations

### 📔 **LEDGER DE TRANSACTIONS**
- Historique complet des mouvements de fonds
- Calcul automatique des balances
- Types : crédit, débit, commission

### 🎫 **DEMANDES ET TICKETS**
- 4 tickets de support (différentes catégories et priorités)
- 3 demandes de recharge (approuvée, en attente, rejetée)
- 3 logs d'erreur système

### ⚙️ **CONFIGURATION SYSTÈME**
- Limites de transfert
- Taux de commission
- Seuils de validation
- Paramètres métier configurables

## 🎮 SCÉNARIOS DE TEST DISPONIBLES

### 📊 **Test Dashboard Multi-Rôles**
```
Admin (admin@transflownexus.com) :
→ Vue globale de toutes les agences
→ KPIs consolidés
→ Gestion des chefs d'agence

Chef d'Agence (chef.dakar@transflownexus.com) :
→ Vue de son agence uniquement
→ Gestion de ses agents
→ Validation des opérations importantes

Agent (agent1.dakar@transflownexus.com) :
→ Ses opérations personnelles
→ Ses commissions
→ Demandes de recharge
```

### 💸 **Test Workflow Opérations**
```
1. Agent crée une opération (ex: transfert 50,000 XOF)
2. Système calcule commission (2.5% = 1,250 XOF)
3. Si montant > 100,000 XOF → validation requise
4. Chef d'agence valide l'opération
5. Commission répartie automatiquement
6. Balance agent mise à jour
7. Entrée ledger créée
```

### 🏦 **Test Gestion Multi-Agences**
```
Dakar Centre : 3 agents, 7 opérations, 25,000 XOF commissions
Pikine : 2 agents, 4 opérations, 18,000 XOF commissions  
Thiès : 1 agent, 2 opérations, 12,000 XOF commissions

Test : 
- Connexion admin → voir toutes les agences
- Connexion chef → voir seulement son agence
- Transfert entre agences
```

### 🔧 **Test Configuration Développeur**
```
Développeur (dev@transflownexus.com) :
→ Modifier types d'opérations
→ Configurer champs dynamiques
→ Ajuster règles de commission
→ Consulter logs d'erreur
→ Modifier configuration système
```

## 🔑 COMPTES DE TEST

### **Identifiants de Connexion** (Mot de passe : `TransFlow2024!`)

| Rôle | Email | Cas d'usage |
|------|-------|-------------|
| Admin | `admin@transflownexus.com` | Supervision globale |
| Sous-Admin | `sousadmin@transflownexus.com` | Administration limitée |
| Développeur | `dev@transflownexus.com` | Configuration technique |
| Chef Dakar | `chef.dakar@transflownexus.com` | Gestion agence principale |
| Chef Pikine | `chef.pikine@transflownexus.com` | Gestion agence secondaire |
| Chef Thiès | `chef.thies@transflownexus.com` | Gestion petite agence |
| Agent Dakar 1 | `agent1.dakar@transflownexus.com` | Agent expérimenté |
| Agent Dakar 2 | `agent2.dakar@transflownexus.com` | Agent standard |
| Agent Dakar 3 | `agent3.dakar@transflownexus.com` | Agent junior |
| Agent Pikine 1 | `agent1.pikine@transflownexus.com` | Agent agence moyenne |
| Agent Pikine 2 | `agent2.pikine@transflownexus.com` | Agent avec erreurs |
| Agent Thiès | `agent1.thies@transflownexus.com` | Agent agence petite |

## ✅ VÉRIFICATION FINALE

### **Checklist de Validation**
```
□ Script RLS v3 appliqué sans erreur
□ Script données mock exécuté avec succès  
□ Script de vérification confirme tous les ✅
□ 12 utilisateurs créés dans Supabase Auth
□ Test de connexion réussi pour chaque rôle
□ Dashboards se chargent selon les permissions
□ Opérations peuvent être créées et validées
□ Commissions sont calculées et réparties
□ Demandes de recharge fonctionnent
□ Tickets de support accessibles
```

## 🎯 PROCHAINES ÉTAPES

1. **Testez l'authentification** avec différents rôles
2. **Créez de nouvelles opérations** pour tester le workflow
3. **Validez les permissions** (chef ne voit que son agence)
4. **Testez les demandes de recharge** (agent → chef)
5. **Explorez les dashboards** pour chaque rôle
6. **Configurez de nouveaux types d'opérations** (développeur)

## 🆘 SUPPORT

Si vous rencontrez des problèmes :
1. Vérifiez que le fix RLS v3 a été appliqué correctement
2. Confirmez que tous les utilisateurs ont été créés avec les bons IDs
3. Vérifiez que les balances et commissions s'affichent
4. Testez avec différents rôles pour valider les permissions

**Votre environnement de test TransFlow Nexus est maintenant prêt pour une simulation complète ! 🚀**