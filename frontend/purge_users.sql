-- Script de purge pour repartir de zéro avec le nouveau système
-- ATTENTION: Ce script supprime TOUS les utilisateurs existants

-- 1. Supprimer toutes les données liées aux utilisateurs
DELETE FROM user_roles;
DELETE FROM profiles;

-- 2. Supprimer tous les utilisateurs de auth.users
-- Note: Ceci doit être fait avec les droits service_role
DELETE FROM auth.users;

-- 3. Réinitialiser les séquences si nécessaire
-- (Pas nécessaire car nous utilisons des UUIDs)

-- 4. Confirmer la purge
SELECT 
  'Utilisateurs purgés' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM user_roles) as user_roles_count;