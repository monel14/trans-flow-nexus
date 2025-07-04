
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

export type OperationTypeField = z.infer<typeof operationTypeFieldSchema>;
export type CommissionRule = z.infer<typeof commissionRuleSchema>;
export type OperationType = z.infer<typeof operationTypeSchema>;
