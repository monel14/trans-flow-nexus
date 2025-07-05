'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getIdentifierExample, getIdentifierDescription } from '@/lib/schemas';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES ET INTERFACES
// =====================================================

export interface UserCreationFormProps {
  schema: z.ZodObject<any, any, any>;
  onSubmit: (values: any) => Promise<{ error?: string; success?: boolean }>;
  userType: 'agent' | 'chef_agence' | 'sous_admin';
  agencies?: Array<{ id: number; name: string; code: string; city?: string }>;
  isLoading?: boolean;
  className?: string;
}

interface FormState {
  error: string | null;
  isSubmitting: boolean;
  showPassword: boolean;
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================

export function UserCreationForm({ 
  schema, 
  onSubmit, 
  userType, 
  agencies = [], 
  isLoading = false,
  className 
}: UserCreationFormProps) {
  const [formState, setFormState] = useState<FormState>({
    error: null,
    isSubmitting: false,
    showPassword: false,
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      identifier: '',
      initialPassword: '',
      ...(userType === 'chef_agence' && { agencyId: '' }),
    },
  });

  const handleFormSubmit = async (values: any) => {
    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const result = await onSubmit(values);
      
      if (result.error) {
        setFormState(prev => ({ ...prev, error: result.error || 'Une erreur est survenue' }));
      } else {
        // Succès - réinitialiser le formulaire
        form.reset();
        setFormState(prev => ({ ...prev, error: null }));
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setFormState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Une erreur inattendue est survenue' 
      }));
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const togglePasswordVisibility = () => {
    setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'agent': return 'Agent';
      case 'chef_agence': return 'Chef d\'Agence';
      case 'sous_admin': return 'Sous-Administrateur';
      default: return 'Utilisateur';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Créer un nouveau {getUserTypeLabel()}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Remplissez les informations ci-dessous pour créer le compte utilisateur
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nom complet */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Fatou Diallo"
                    {...field}
                    disabled={formState.isSubmitting || isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Le nom complet de l'utilisateur tel qu'il apparaîtra dans le système
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Identifiant */}
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifiant de connexion *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={getIdentifierExample(userType)}
                    {...field}
                    disabled={formState.isSubmitting || isLoading}
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription>
                  {getIdentifierDescription(userType)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sélection d'agence (uniquement pour chef d'agence) */}
          {userType === 'chef_agence' && (
            <FormField
              control={form.control}
              name="agencyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agence *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={formState.isSubmitting || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une agence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{agency.name}</span>
                            <span className="text-xs text-gray-500">
                              Code: {agency.code} {agency.city && `• ${agency.city}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    L'agence dont ce chef sera responsable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Mot de passe */}
          <FormField
            control={form.control}
            name="initialPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe initial *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={formState.showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={formState.isSubmitting || isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      disabled={formState.isSubmitting || isLoading}
                    >
                      {formState.showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Minimum 8 caractères avec au moins une majuscule, une minuscule et un chiffre
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message d'erreur */}
          {formState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}

          {/* Bouton de soumission */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={formState.isSubmitting || isLoading}
              className="flex-1"
            >
              {formState.isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Créer {getUserTypeLabel()}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Informations supplémentaires */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          📋 Informations importantes
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• L'utilisateur pourra se connecter avec son identifiant et mot de passe</li>
          <li>• L'identifiant ne pourra pas être modifié après création</li>
          <li>• L'utilisateur pourra changer son mot de passe après première connexion</li>
          {userType === 'agent' && <li>• L'agent sera automatiquement assigné à votre agence</li>}
          {userType === 'chef_agence' && <li>• Le chef aura accès à la gestion de son agence</li>}
        </ul>
      </div>
    </div>
  );
}