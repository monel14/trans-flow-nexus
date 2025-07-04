# Guide de Déploiement - Phase 2: Fonctions RPC

## 📋 Instructions de Déploiement

### Étape 1: Accéder à Supabase Dashboard
1. Ouvrez votre projet Supabase: https://app.supabase.com/project/khgbnikgsptoflokvtzu
2. Allez dans **Database** → **SQL Editor**

### Étape 2: Exécuter les Migrations
Exécutez les fichiers dans l'ordre suivant :

#### Migration 1: Base
```sql
-- Copiez et exécutez le contenu de:
-- /app/supabase/migrations/20250702000000_hierarchical_user_creation_base.sql
```

#### Migration 2: Fonctions Complètes
```sql
-- Copiez et exécutez le contenu de:
-- /app/supabase/migrations/20250702000001_hierarchical_user_creation_full.sql
```

### Étape 3: Test Initial
Après avoir exécuté les migrations, testez avec :

```sql
-- Test de validation des identifiants
SELECT validate_identifier_format('admin.monel', 'admin_general');
-- Devrait retourner: true

-- Test de création de l'admin initial
SELECT create_initial_admin('Admin Principal', 'admin.monel', 'motdepasse123');
-- Devrait retourner: {"status": "success", ...}
```

### Étape 4: Vérification
Vérifiez que les fonctions sont créées :

```sql
-- Lister les fonctions créées
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%create_%';
```

## 🎯 Fonctions RPC Créées

| Fonction | Description | Appelée par |
|----------|-------------|-------------|
| `validate_identifier_format()` | Valide les formats d'identifiants | Toutes les autres fonctions |
| `create_initial_admin()` | Crée le premier administrateur | Système (une seule fois) |
| `create_chef_agence()` | Crée un chef d'agence | Admin Général |
| `create_sous_admin()` | Crée un sous-administrateur | Admin Général |
| `create_agent()` | Crée un agent | Chef d'Agence |

## ✅ Tests de Validation

Après déploiement, les fonctions peuvent être testées avec :

```bash
cd /app
python test_rpc_functions.py  # (nécessite SUPABASE_SERVICE_KEY)
```

Ou directement dans Supabase SQL Editor :

```sql
-- Créer l'admin initial
SELECT create_initial_admin('Monel Admin', 'admin.monel', 'admin123');

-- Se connecter avec admin.monel, puis créer un chef d'agence
SELECT create_chef_agence('Diallo Chef', 'chef.dakar.diallo', 'chef123', 1);

-- Se connecter avec chef.dakar.diallo, puis créer un agent
SELECT create_agent('Fatou Agent', 'dkr01.fatou', 'agent123');
```

## 🔒 Sécurité

- Toutes les fonctions utilisent `SECURITY DEFINER`
- Vérifications de permissions robustes
- Validation des formats d'identifiants
- Création atomique (transaction complète ou échec)
- Gestion d'erreurs complète

## 📝 Formats d'Identifiants Supportés

- **Admin/Sous-admin**: `admin.prénom`, `sadmin.prénom`
- **Chef d'agence**: `chef.ville.nom`
- **Agent**: `codeagence.prénom`

Exemples valides:
- `admin.monel` ✅
- `sadmin.pierre` ✅
- `chef.dakar.diallo` ✅
- `dkr01.fatou` ✅