
-- Insertion des rôles
INSERT INTO public.roles (name, label)
VALUES
  ('agent', 'Agent'),
  ('chef_agence', 'Chef d''Agence'),
  ('admin_general', 'Admin Général'),
  ('sous_admin', 'Sous-Admin'),
  ('developer', 'Développeur');

-- Insertion des permissions
INSERT INTO public.permissions (code, label) VALUES
  ('create_agent', 'Créer un Agent'),
  ('update_agent', 'Modifier un Agent'),
  ('delete_agent', 'Supprimer/Suspendre un Agent'),
  ('view_commissions', 'Voir les Commissions'),
  ('validate_transactions', 'Valider les Transactions'),
  ('manage_roles', 'Gérer les Rôles et Permissions');
