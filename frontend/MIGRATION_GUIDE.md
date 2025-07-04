# 🚀 GUIDE D'APPLICATION DES MIGRATIONS SUPABASE

## ⚠️ IMPORTANT
Les migrations ne peuvent pas être appliquées automatiquement via l'API REST de Supabase. Vous devez les appliquer manuellement via le Dashboard.

## 📋 ÉTAPES À SUIVRE

### Étape 1 : Accéder au SQL Editor
1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet **khgbnikgsptoflokvtzu**
3. Dans le menu latéral gauche, cliquez sur **"SQL Editor"**

### Étape 2 : Appliquer les migrations dans l'ordre

#### 🔧 Migration 1 : Schema Standardization
```sql
-- Copiez-collez TOUT le contenu du fichier suivant :
/app/supabase/migrations/20250625120000_schema_standardization.sql
```

1. Cliquez sur **"New query"**
2. Collez le contenu complet du fichier schema_standardization.sql
3. Cliquez sur **"Run"** (Ctrl+Enter)
4. ✅ Vérifiez qu'il n'y a pas d'erreurs critiques

#### ⚡ Migration 2 : Atomic Functions
```sql
-- Copiez-collez TOUT le contenu du fichier suivant :
/app/supabase/migrations/20250625120001_atomic_functions.sql
```

1. **Nouvelle query** dans SQL Editor
2. Collez le contenu complet du fichier atomic_functions.sql
3. Cliquez sur **"Run"**
4. ✅ Vérifiez que les 3 fonctions sont créées

#### 🔒 Migration 3 : RLS Policies
```sql
-- Copiez-collez TOUT le contenu du fichier suivant :
/app/supabase/migrations/20250625120002_comprehensive_rls_policies.sql
```

1. **Nouvelle query** dans SQL Editor
2. Collez le contenu complet du fichier rls_policies.sql
3. Cliquez sur **"Run"**
4. ✅ Vérifiez que les politiques sont créées

#### 📊 Migration 4 : Initial Data
```sql
-- Copiez-collez TOUT le contenu du fichier suivant :
/app/supabase/migrations/20250625120003_initial_data.sql
```

1. **Nouvelle query** dans SQL Editor
2. Collez le contenu complet du fichier initial_data.sql
3. Cliquez sur **"Run"**
4. ✅ Vérifiez que les données de base sont insérées

## 🔍 VÉRIFICATION POST-MIGRATION

Après avoir appliqué toutes les migrations, vérifiez :

### Tables créées/modifiées :
- ✅ `profiles` : colonnes role_id, agency_id, balance ajoutées
- ✅ `agencies` : colonne is_active ajoutée
- ✅ `system_settings` : nouvelle table créée
- ✅ Toutes les autres tables inchangées mais sécurisées

### Fonctions créées :
- ✅ `validate_operation_atomic()`
- ✅ `process_recharge_atomic()`
- ✅ `process_commission_transfer_atomic()`

### Données initiales :
- ✅ 5 rôles dans `roles`
- ✅ 18 permissions dans `permissions`
- ✅ 5 agences dans `agencies`
- ✅ 6 types d'opérations dans `operation_types`

### Test rapide :
```sql
-- Exécutez cette requête pour vérifier que tout fonctionne
SELECT 
  (SELECT COUNT(*) FROM roles) as roles_count,
  (SELECT COUNT(*) FROM permissions) as permissions_count,
  (SELECT COUNT(*) FROM agencies) as agencies_count,
  (SELECT COUNT(*) FROM operation_types) as operation_types_count;
```

**Résultat attendu :** roles_count=5, permissions_count=18, agencies_count=5, operation_types_count=6

## 🚨 ERREURS COURANTES

### Si vous voyez des erreurs comme :
- `relation "profiles" already exists` → Normal, continuez
- `column "role_id" already exists` → Normal, continuez
- `function "get_user_role" already exists` → Normal, elle sera mise à jour

### Erreurs à signaler :
- Erreurs de syntaxe SQL
- Violations de contraintes
- Problèmes de permissions

## ✅ CONFIRMATION FINALE

Une fois toutes les migrations appliquées avec succès, votre base de données Supabase sera **complètement configurée** avec :

1. ✅ **Schéma standardisé** avec nouveau modèle de données
2. ✅ **Fonctions atomiques** pour toutes les opérations critiques
3. ✅ **Sécurité RLS complète** sur toutes les tables
4. ✅ **Données initiales** pour démarrer immédiatement

🎉 **Nous pourrons alors passer à la Phase 2 : Développement Frontend !**