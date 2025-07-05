import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemConfig, useUpdateSystemConfig } from '@/hooks/useSystemConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Shield,
  Mail,
  Globe,
  Bell,
  Save,
  RefreshCw,
  Database,
  Server
} from 'lucide-react';

const SystemConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // État du formulaire
  const [configData, setConfigData] = useState({
    // Paramètres généraux
    app_name: 'TransFlow Nexus',
    default_currency: 'XOF',
    timezone: 'Africa/Ouagadougou',
    max_file_size: 5242880, // 5MB
    supported_file_types: 'image/jpeg,image/png,application/pdf',
    
    // Paramètres de sécurité
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    password_expiry_days: 90,
    session_timeout_minutes: 60,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    
    // Notifications
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    
    // Templates d'email
    welcome_email_template: 'Bienvenue sur TransFlow Nexus!\n\nVotre compte a été créé avec succès.',
    operation_validated_template: 'Votre opération #{operation_id} a été validée.',
    balance_low_template: 'Attention: Votre solde est faible ({balance}).',
    
    // Limites
    min_operation_amount: 1000,
    max_operation_amount: 10000000,
    min_recharge_amount: 10000,
    max_recharge_amount: 5000000,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Hooks
  const { data: systemConfig, isLoading } = useSystemConfig();
  const updateConfig = useUpdateSystemConfig();

  // Charger la configuration existante
  React.useEffect(() => {
    if (systemConfig) {
      setConfigData(prev => ({
        ...prev,
        ...systemConfig
      }));
    }
  }, [systemConfig]);

  const handleInputChange = (field: string, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      await updateConfig.mutateAsync(configData);
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres du système ont été mis à jour",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (systemConfig) {
      setConfigData(prev => ({
        ...prev,
        ...systemConfig
      }));
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configuration Globale du Système
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les paramètres techniques et fonctionnels de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting || !hasChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Onglets de configuration */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Limites
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Paramètres Généraux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="app_name">Nom de l'application</Label>
                  <Input
                    id="app_name"
                    value={configData.app_name}
                    onChange={(e) => handleInputChange('app_name', e.target.value)}
                    placeholder="TransFlow Nexus"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Devise par défaut</Label>
                  <Select 
                    value={configData.default_currency} 
                    onValueChange={(value) => handleInputChange('default_currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select 
                    value={configData.timezone} 
                    onValueChange={(value) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Ouagadougou">Africa/Ouagadougou</SelectItem>
                      <SelectItem value="Africa/Dakar">Africa/Dakar</SelectItem>
                      <SelectItem value="Africa/Abidjan">Africa/Abidjan</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_file_size">Taille max des fichiers (MB)</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    value={Math.round(configData.max_file_size / 1024 / 1024)}
                    onChange={(e) => handleInputChange('max_file_size', parseInt(e.target.value) * 1024 * 1024)}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supported_file_types">Types de fichiers supportés</Label>
                <Input
                  id="supported_file_types"
                  value={configData.supported_file_types}
                  onChange={(e) => handleInputChange('supported_file_types', e.target.value)}
                  placeholder="image/jpeg,image/png,application/pdf"
                />
                <p className="text-sm text-gray-500">
                  Séparez les types MIME par des virgules
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Politique de mots de passe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password_min_length">Longueur minimale</Label>
                    <Input
                      id="password_min_length"
                      type="number"
                      value={configData.password_min_length}
                      onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                      min="6"
                      max="32"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password_expiry_days">Expiration (jours)</Label>
                    <Input
                      id="password_expiry_days"
                      type="number"
                      value={configData.password_expiry_days}
                      onChange={(e) => handleInputChange('password_expiry_days', parseInt(e.target.value))}
                      min="30"
                      max="365"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password_require_uppercase">Majuscules requises</Label>
                    <Switch
                      id="password_require_uppercase"
                      checked={configData.password_require_uppercase}
                      onCheckedChange={(checked) => handleInputChange('password_require_uppercase', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password_require_lowercase">Minuscules requises</Label>
                    <Switch
                      id="password_require_lowercase"
                      checked={configData.password_require_lowercase}
                      onCheckedChange={(checked) => handleInputChange('password_require_lowercase', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password_require_numbers">Chiffres requis</Label>
                    <Switch
                      id="password_require_numbers"
                      checked={configData.password_require_numbers}
                      onCheckedChange={(checked) => handleInputChange('password_require_numbers', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password_require_symbols">Symboles requis</Label>
                    <Switch
                      id="password_require_symbols"
                      checked={configData.password_require_symbols}
                      onCheckedChange={(checked) => handleInputChange('password_require_symbols', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900">Sessions et connexions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="session_timeout_minutes">Timeout session (minutes)</Label>
                    <Input
                      id="session_timeout_minutes"
                      type="number"
                      value={configData.session_timeout_minutes}
                      onChange={(e) => handleInputChange('session_timeout_minutes', parseInt(e.target.value))}
                      min="15"
                      max="480"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_login_attempts">Tentatives max de connexion</Label>
                    <Input
                      id="max_login_attempts"
                      type="number"
                      value={configData.max_login_attempts}
                      onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lockout_duration_minutes">Durée de verrouillage (minutes)</Label>
                    <Input
                      id="lockout_duration_minutes"
                      type="number"
                      value={configData.lockout_duration_minutes}
                      onChange={(e) => handleInputChange('lockout_duration_minutes', parseInt(e.target.value))}
                      min="5"
                      max="1440"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuration des Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications_enabled">Notifications par email</Label>
                  <p className="text-sm text-gray-500">Activer l'envoi de notifications par email</p>
                </div>
                <Switch
                  id="email_notifications_enabled"
                  checked={configData.email_notifications_enabled}
                  onCheckedChange={(checked) => handleInputChange('email_notifications_enabled', checked)}
                />
              </div>

              {configData.email_notifications_enabled && (
                <div className="space-y-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-900">Configuration SMTP</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">Serveur SMTP</Label>
                      <Input
                        id="smtp_host"
                        value={configData.smtp_host}
                        onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={configData.smtp_port}
                        onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                        placeholder="587"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp_username">Nom d'utilisateur</Label>
                      <Input
                        id="smtp_username"
                        value={configData.smtp_username}
                        onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                        placeholder="votre@email.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">Mot de passe</Label>
                      <Input
                        id="smtp_password"
                        type="password"
                        value={configData.smtp_password}
                        onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp_encryption">Chiffrement</Label>
                      <Select 
                        value={configData.smtp_encryption} 
                        onValueChange={(value) => handleInputChange('smtp_encryption', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">Aucun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms_notifications_enabled">Notifications par SMS</Label>
                  <p className="text-sm text-gray-500">Activer l'envoi de notifications par SMS</p>
                </div>
                <Switch
                  id="sms_notifications_enabled"
                  checked={configData.sms_notifications_enabled}
                  onCheckedChange={(checked) => handleInputChange('sms_notifications_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Templates Email */}
        <TabsContent value="email-templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Modèles d'Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="welcome_email_template">Email de bienvenue</Label>
                <Textarea
                  id="welcome_email_template"
                  value={configData.welcome_email_template}
                  onChange={(e) => handleInputChange('welcome_email_template', e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500">
                  Variables disponibles: {'{user_name}, {app_name}'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="operation_validated_template">Opération validée</Label>
                <Textarea
                  id="operation_validated_template"
                  value={configData.operation_validated_template}
                  onChange={(e) => handleInputChange('operation_validated_template', e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500">
                  Variables disponibles: {'{operation_id}, {amount}, {user_name}'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="balance_low_template">Solde faible</Label>
                <Textarea
                  id="balance_low_template"
                  value={configData.balance_low_template}
                  onChange={(e) => handleInputChange('balance_low_template', e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500">
                  Variables disponibles: {'{balance}, {user_name}, {threshold}'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Limites */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Limites et Contraintes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Opérations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="min_operation_amount">Montant minimum (FCFA)</Label>
                    <Input
                      id="min_operation_amount"
                      type="number"
                      value={configData.min_operation_amount}
                      onChange={(e) => handleInputChange('min_operation_amount', parseInt(e.target.value))}
                      min="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_operation_amount">Montant maximum (FCFA)</Label>
                    <Input
                      id="max_operation_amount"
                      type="number"
                      value={configData.max_operation_amount}
                      onChange={(e) => handleInputChange('max_operation_amount', parseInt(e.target.value))}
                      min="1000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900">Recharges</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="min_recharge_amount">Montant minimum (FCFA)</Label>
                    <Input
                      id="min_recharge_amount"
                      type="number"
                      value={configData.min_recharge_amount}
                      onChange={(e) => handleInputChange('min_recharge_amount', parseInt(e.target.value))}
                      min="1000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_recharge_amount">Montant maximum (FCFA)</Label>
                    <Input
                      id="max_recharge_amount"
                      type="number"
                      value={configData.max_recharge_amount}
                      onChange={(e) => handleInputChange('max_recharge_amount', parseInt(e.target.value))}
                      min="10000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfig;