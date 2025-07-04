
-- Pré-setup : récupération des IDs de rôles et permissions (pour insertion)
-- Agent
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'agent' AND p.code IN ('view_commissions', 'validate_transactions');

-- Chef d'agence
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'chef_agence' AND p.code IN ('create_agent', 'update_agent', 'delete_agent', 'view_commissions', 'validate_transactions');

-- Admin général : accès à toutes les permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin_general';

-- Sous admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'sous_admin' AND p.code IN ('validate_transactions', 'view_commissions');

-- Développeur
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'developer' AND p.code IN ('manage_roles');
