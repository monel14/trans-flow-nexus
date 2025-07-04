# 🚀 GUIDE ÉTAPE PAR ÉTAPE - TRANSFLOW NEXUS MOCK DATA

## 📋 Vue d'ensemble

Ce guide vous permet de créer des données de démonstration complètes pour TransFlow Nexus en contournant les contraintes d'authentification Supabase.

## 🎯 ÉTAPE 1: CRÉER L'INFRASTRUCTURE

### ✅ Actions requises:
1. **Ouvrir Supabase Dashboard** → SQL Editor
2. **Copier le script**: `/app/infrastructure_only_script.sql`
3. **Coller et exécuter** dans l'éditeur SQL
4. **Vérifier les messages de succès**

### 📊 Résultat attendu:
```
NOTICE: Agence de Douala créée
NOTICE: Agence de Yaoundé créée
NOTICE: Type: Dépôt Orange Money créé
NOTICE: Type: Retrait MTN MoMo créé
... (autres types)
NOTICE: ✅ INFRASTRUCTURE CRÉÉE AVEC SUCCÈS!
```

---

## 🎯 ÉTAPE 2: CRÉER DES COMPTES UTILISATEURS MANUELLEMENT

Puisque Supabase requiert une authentification appropriée, créons quelques comptes manuellement:

### 🔐 Dans Supabase Dashboard:

1. **Aller dans "Authentication" → "Users"**
2. **Cliquer "Add user"**
3. **Créer ces comptes** (un par un):

#### Compte Admin:
- **Email**: `admin.general@transflow.com`
- **Password**: `Demo123!`
- **Confirm password**: `Demo123!`

#### Compte Agent:
- **Email**: `agent1.douala@transflow.com`
- **Password**: `Demo123!`
- **Confirm password**: `Demo123!`

#### Compte Chef:
- **Email**: `chef.douala@transflow.com`
- **Password**: `Demo123!`
- **Confirm password**: `Demo123!`

### 📋 Après création de chaque compte:
1. **Noter l'UUID** de chaque utilisateur (affiché dans la liste)
2. **Ces UUIDs seront nécessaires** pour l'étape suivante

---

## 🎯 ÉTAPE 3: CRÉER LES PROFILS UTILISATEURS

### 📝 Script SQL à exécuter dans Supabase:

```sql
-- Désactiver RLS temporairement
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Remplacer 'UUID_ADMIN' par l'UUID réel de admin.general@transflow.com
INSERT INTO profiles (
    id, email, name, first_name, last_name, role_id, agency_id,
    balance, is_active, created_at, updated_at
) VALUES (
    'UUID_ADMIN',  -- ⚠️ REMPLACER PAR L'UUID RÉEL
    'admin.general@transflow.com',
    'Admin Général',
    'Admin',
    'Général',
    3, -- admin_general role_id
    null,
    0.0,
    true,
    now(),
    now()
);

-- Remplacer 'UUID_AGENT' par l'UUID réel de agent1.douala@transflow.com
INSERT INTO profiles (
    id, email, name, first_name, last_name, role_id, agency_id,
    balance, is_active, created_at, updated_at
) VALUES (
    'UUID_AGENT',  -- ⚠️ REMPLACER PAR L'UUID RÉEL
    'agent1.douala@transflow.com',
    'Ousmane Cissé',
    'Ousmane',
    'Cissé',
    1, -- agent role_id
    (SELECT id FROM agencies WHERE name = 'Agence de Douala'),
    25000.0,
    true,
    now(),
    now()
);

-- Remplacer 'UUID_CHEF' par l'UUID réel de chef.douala@transflow.com
INSERT INTO profiles (
    id, email, name, first_name, last_name, role_id, agency_id,
    balance, is_active, created_at, updated_at
) VALUES (
    'UUID_CHEF',  -- ⚠️ REMPLACER PAR L'UUID RÉEL
    'chef.douala@transflow.com',
    'Mamadou Diallo',
    'Mamadou',
    'Diallo',
    2, -- chef_agence role_id
    (SELECT id FROM agencies WHERE name = 'Agence de Douala'),
    50000.0,
    true,
    now(),
    now()
);

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🎯 ÉTAPE 4: CRÉER DES OPÉRATIONS DE DÉMONSTRATION

### 📝 Script pour créer des opérations:

```sql
-- Désactiver RLS pour les opérations
ALTER TABLE operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_ledger DISABLE ROW LEVEL SECURITY;

-- Créer quelques opérations en attente
INSERT INTO operations (
    id, operation_type_id, reference_number, initiator_id, agency_id, 
    amount, currency, status, operation_data, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ot.id,
    'OP' || to_char(now(), 'YYYYMMDDHH24MISS') || '001',
    p.id,
    p.agency_id,
    25000,
    'XOF',
    'pending',
    jsonb_build_object(
        'phone_number', '+237650123456',
        'amount', 25000
    ),
    now() - interval '2 days',
    now()
FROM operation_types ot
CROSS JOIN profiles p
WHERE ot.name = 'Dépôt Orange Money' 
AND p.email = 'agent1.douala@transflow.com'
LIMIT 1;

-- Créer une opération complétée
INSERT INTO operations (
    id, operation_type_id, reference_number, initiator_id, agency_id, 
    amount, currency, status, operation_data, validator_id, validated_at, completed_at, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ot.id,
    'OP' || to_char(now(), 'YYYYMMDDHH24MISS') || '002',
    agent.id,
    agent.agency_id,
    15000,
    'XOF',
    'completed',
    jsonb_build_object(
        'phone_number', '+237651234567',
        'amount', 15000
    ),
    admin.id,
    now() - interval '1 day',
    now() - interval '1 day',
    now() - interval '3 days',
    now()
FROM operation_types ot
CROSS JOIN profiles agent
CROSS JOIN profiles admin
WHERE ot.name = 'Retrait MTN MoMo'
AND agent.email = 'agent1.douala@transflow.com'
AND admin.email = 'admin.general@transflow.com'
LIMIT 1;

-- Réactiver RLS
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_ledger ENABLE ROW LEVEL SECURITY;
```

---

## 🎯 ÉTAPE 5: TESTER L'APPLICATION

### ✅ Comptes de test disponibles:
- **admin.general@transflow.com** / Demo123!
- **agent1.douala@transflow.com** / Demo123!
- **chef.douala@transflow.com** / Demo123!

### 🧪 Tests à effectuer:
1. **Connexion** avec chaque compte
2. **Navigation** selon les rôles
3. **Voir les opérations** dans le dashboard
4. **Tester les workflows** (validation, création, etc.)

---

## 🎉 RÉSULTAT FINAL

Après ces étapes, vous aurez:

✅ **Infrastructure complète** (agences, types d'opérations, règles)  
✅ **Comptes utilisateurs fonctionnels** (avec vraie authentification)  
✅ **Données de démonstration** (opérations, profils)  
✅ **Application testable** avec tous les workflows  

---

## 🔧 DÉPANNAGE

### ❌ Si une étape échoue:
1. **Vérifier les messages d'erreur** dans Supabase
2. **S'assurer que RLS est désactivé** avant insertions
3. **Utiliser les UUIDs corrects** des comptes créés
4. **Réactiver RLS** après chaque étape

### 📞 Besoin d'aide:
- Vérifier que tous les scripts sont bien copiés
- S'assurer que les agences existent avant de créer les profils
- Tester une étape à la fois