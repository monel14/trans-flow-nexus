-- Script pour désactiver la confirmation email dans Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Mettre à jour la configuration auth pour désactiver la confirmation email
UPDATE auth.config 
SET 
  confirm_email_change_enabled = false,
  enable_signup = true,
  enable_manual_linking = true
WHERE id IS NOT NULL;

-- 2. Si nécessaire, confirmer automatiquement tous les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 3. Désactiver la confirmation email dans les politiques RLS si nécessaire
-- (À adapter selon votre configuration actuelle)

-- Note: Pour une configuration complète, vous devrez aussi:
-- 1. Aller dans Supabase Dashboard > Authentication > Settings
-- 2. Désactiver "Enable email confirmations" 
-- 3. Sauvegarder les paramètres