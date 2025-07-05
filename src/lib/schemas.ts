
import { z } from 'zod';

export const operationTypeFieldSchema = z.object({
  id: z.string().optional(),
  operation_type_id: z.string(),
  name: z.string().min(1, 'Le nom est requis'),
  label: z.string().min(1, 'Le libellé est requis'),
  field_type: z.enum(['text', 'number', 'email', 'tel', 'select', 'textarea', 'file', 'date', 'checkbox', 'radio']),
  is_required: z.boolean().default(false),
  is_obsolete: z.boolean().default(false),
  display_order: z.number().default(0),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation_rules: z.record(z.any()).optional(),
});

export const commissionRuleSchema = z.object({
  id: z.string().optional(),
  operation_type_id: z.string(),
  commission_type: z.enum(['fixed', 'percentage', 'tiered']),
  fixed_amount: z.number().optional(),
  percentage_rate: z.number().optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  tiered_rules: z.array(z.any()).optional(),
  is_active: z.boolean().default(true),
});

export const operationTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  impacts_balance: z.boolean().default(true),
  is_active: z.boolean().default(true),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

// User creation schemas
export const createAgentSchema = z.object({
  fullName: z.string().min(1, 'Le nom complet est requis'),
  identifier: z.string().min(3, 'L\'identifiant doit contenir au moins 3 caractères'),
  initialPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  agencyId: z.number().min(1, 'Une agence doit être sélectionnée'),
});

export const createChefAgenceSchema = z.object({
  fullName: z.string().min(1, 'Le nom complet est requis'),
  identifier: z.string().min(3, 'L\'identifiant doit contenir au moins 3 caractères'),
  initialPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  agencyId: z.number().min(1, 'Une agence doit être sélectionnée'),
});

export const createSousAdminSchema = z.object({
  fullName: z.string().min(1, 'Le nom complet est requis'),
  identifier: z.string().min(3, 'L\'identifiant doit contenir au moins 3 caractères'),
  initialPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

// Helper functions
export function getIdentifierExample(userType: 'agent' | 'chef_agence' | 'sous_admin'): string {
  switch (userType) {
    case 'agent':
      return 'agent.123';
    case 'chef_agence':
      return 'chef.abc';
    case 'sous_admin':
      return 'admin.xyz';
    default:
      return 'user.example';
  }
}

export function getIdentifierDescription(userType: 'agent' | 'chef_agence' | 'sous_admin'): string {
  switch (userType) {
    case 'agent':
      return 'Identifiant unique pour l\'agent (ex: agent.123, ag001, etc.)';
    case 'chef_agence':
      return 'Identifiant unique pour le chef d\'agence (ex: chef.abc, ca001, etc.)';
    case 'sous_admin':
      return 'Identifiant unique pour le sous-administrateur (ex: admin.xyz, sa001, etc.)';
    default:
      return 'Identifiant unique pour l\'utilisateur';
  }
}

export type OperationTypeField = z.infer<typeof operationTypeFieldSchema>;
export type CommissionRule = z.infer<typeof commissionRuleSchema>;
export type OperationType = z.infer<typeof operationTypeSchema>;
export type CreateAgentValues = z.infer<typeof createAgentSchema>;
export type CreateChefAgenceValues = z.infer<typeof createChefAgenceSchema>;
export type CreateSousAdminValues = z.infer<typeof createSousAdminSchema>;

// Export schemas with different names for backward compatibility
export const CreateAgentSchema = createAgentSchema;
export const CreateChefAgenceSchema = createChefAgenceSchema;
export const CreateSousAdminSchema = createSousAdminSchema;
