-- Désactiver la confirmation email pour permettre la connexion par identifiant
-- Ce script doit être exécuté dans le SQL Editor de Supabase

-- Mise à jour de la configuration auth pour désactiver la confirmation email
UPDATE auth.config 
SET raw_configuration = jsonb_set(
  COALESCE(raw_configuration, '{}'::jsonb),
  '{MAILER_AUTOCONFIRM}',
  'true'::jsonb
)
WHERE id = 1;

-- Si la table config n'existe pas ou est vide, utiliser cette approche alternative
INSERT INTO auth.config (id, raw_configuration) 
VALUES (1, '{"MAILER_AUTOCONFIRM": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
raw_configuration = jsonb_set(
  COALESCE(auth.config.raw_configuration, '{}'::jsonb),
  '{MAILER_AUTOCONFIRM}',
  'true'::jsonb
);

-- Confirmer automatiquement tous les utilisateurs existants pour la migration
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmation_token = NULL 
WHERE email_confirmed_at IS NULL;