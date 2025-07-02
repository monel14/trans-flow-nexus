import { z } from 'zod';

// =====================================================
// SCHÉMAS DE VALIDATION POUR LA CRÉATION D'UTILISATEURS
// =====================================================

// Schéma de base pour tous les utilisateurs
export const BaseUserSchema = z.object({
  fullName: z.string()
    .min(3, "Le nom complet doit contenir au moins 3 caractères.")
    .max(100, "Le nom complet ne peut pas dépasser 100 caractères."),
  initialPassword: z.string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre."),
});

// Schéma pour les Agents
export const CreateAgentSchema = BaseUserSchema.extend({
  identifier: z.string()
    .regex(/^[a-z0-9]+\.[a-z]+$/, "Format d'identifiant invalide. Utilisez le format: codeagence.prénom (ex: dkr01.fatou)")
    .min(5, "L'identifiant doit contenir au moins 5 caractères."),
});

// Schéma pour les Chefs d'Agence
export const CreateChefAgenceSchema = BaseUserSchema.extend({
  identifier: z.string()
    .regex(/^chef\.[a-z]+\.[a-z]+$/, "Format d'identifiant invalide. Utilisez le format: chef.ville.nom (ex: chef.dakar.diallo)")
    .min(8, "L'identifiant doit contenir au moins 8 caractères."),
  agencyId: z.string()
    .min(1, "Une agence doit être sélectionnée.")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "L'ID de l'agence doit être un nombre valide."),
});

// Schéma pour les Sous-Admins
export const CreateSousAdminSchema = BaseUserSchema.extend({
  identifier: z.string()
    .regex(/^sadmin\.[a-z]+$/, "Format d'identifiant invalide. Utilisez le format: sadmin.prénom (ex: sadmin.pierre)")
    .min(8, "L'identifiant doit contenir au moins 8 caractères."),
});

// Schéma pour l'Admin Initial (bootstrap)
export const CreateInitialAdminSchema = BaseUserSchema.extend({
  identifier: z.string()
    .regex(/^admin\.[a-z]+$/, "Format d'identifiant invalide. Utilisez le format: admin.prénom (ex: admin.monel)")
    .min(8, "L'identifiant doit contenir au moins 8 caractères."),
});

// Types inférés à partir des schémas
export type CreateAgentValues = z.infer<typeof CreateAgentSchema>;
export type CreateChefAgenceValues = z.infer<typeof CreateChefAgenceSchema>;
export type CreateSousAdminValues = z.infer<typeof CreateSousAdminSchema>;
export type CreateInitialAdminValues = z.infer<typeof CreateInitialAdminSchema>;

// =====================================================
// HELPERS POUR LA VALIDATION
// =====================================================

export const validateIdentifierFormat = (identifier: string, role: 'agent' | 'chef_agence' | 'sous_admin' | 'admin_general') => {
  switch (role) {
    case 'agent':
      return /^[a-z0-9]+\.[a-z]+$/.test(identifier);
    case 'chef_agence':
      return /^chef\.[a-z]+\.[a-z]+$/.test(identifier);
    case 'sous_admin':
      return /^sadmin\.[a-z]+$/.test(identifier);
    case 'admin_general':
      return /^admin\.[a-z]+$/.test(identifier);
    default:
      return false;
  }
};

export const getIdentifierExample = (role: 'agent' | 'chef_agence' | 'sous_admin' | 'admin_general') => {
  switch (role) {
    case 'agent':
      return 'dkr01.fatou';
    case 'chef_agence':
      return 'chef.dakar.diallo';
    case 'sous_admin':
      return 'sadmin.pierre';
    case 'admin_general':
      return 'admin.monel';
    default:
      return '';
  }
};

export const getIdentifierDescription = (role: 'agent' | 'chef_agence' | 'sous_admin' | 'admin_general') => {
  switch (role) {
    case 'agent':
      return 'Format: codeagence.prénom (ex: dkr01.fatou)';
    case 'chef_agence':
      return 'Format: chef.ville.nom (ex: chef.dakar.diallo)';
    case 'sous_admin':
      return 'Format: sadmin.prénom (ex: sadmin.pierre)';
    case 'admin_general':
      return 'Format: admin.prénom (ex: admin.monel)';
    default:
      return '';
  }
};