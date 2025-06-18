
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Settings, Database, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSystemConfig } from "@/hooks/useSystemConfig";

const SystemConfig = () => {
  const { config, updateConfig, isUpdating } = useSystemConfig();

  const handleSave = () => {
    updateConfig(config);
    toast({
      title: "Configuration sauvegardée",
      description: "Les paramètres système ont été mis à jour avec succès.",
    });
  };

  const handleInputChange = (field: string, value: any) => {
    updateConfig({ [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configuration Système</h1>
          <p className="text-gray-600">
            Gérez les paramètres globaux et avancés du système TransFlow.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          className="flex items-center gap-2"
          disabled={isUpdating}
        >
          <Save className="h-4 w-4" />
          {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Base de données
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Généraux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">Nom du système</Label>
                <Input
                  id="systemName"
                  value={config.systemName}
                  onChange={(e) => handleInputChange('systemName', e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
                <Label htmlFor="maintenanceMode">Mode maintenance</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Taille maximale des fichiers (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={config.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de session (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={config.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Longueur minimale du mot de passe</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={config.passwordMinLength}
                  onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTwoFactor"
                  checked={config.enableTwoFactor}
                  onCheckedChange={(checked) => handleInputChange('enableTwoFactor', checked)}
                />
                <Label htmlFor="enableTwoFactor">Activer l'authentification à deux facteurs</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Nombre maximum de tentatives de connexion</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={config.maxLoginAttempts}
                  onChange={(e) => handleInputChange('maxLoginAttempts', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Base de Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Fréquence des sauvegardes</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={config.backupFrequency}
                  onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                >
                  <option value="hourly">Toutes les heures</option>
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retentionDays">Rétention des données (jours)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={config.retentionDays}
                  onChange={(e) => handleInputChange('retentionDays', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableReplication"
                  checked={config.enableReplication}
                  onCheckedChange={(checked) => handleInputChange('enableReplication', checked)}
                />
                <Label htmlFor="enableReplication">Activer la réplication</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfig;
