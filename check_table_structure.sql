-- ===============================================
-- SCRIPT DE VÉRIFICATION DE LA STRUCTURE DES TABLES
-- TransFlow Nexus - Vérification avant insertion
-- ===============================================

-- Vérifier la structure de la table roles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'roles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier la structure de la table agencies
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'agencies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier la structure de la table profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier la structure de la table operation_types
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'operation_types' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Lister toutes les tables disponibles
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;