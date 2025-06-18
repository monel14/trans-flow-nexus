
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, AlertTriangle, XCircle, Info } from "lucide-react";

const ErrorLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  // Données simulées pour les journaux d'erreurs
  const mockLogs = [
    {
      id: 1,
      timestamp: "2024-01-15 14:30:25",
      level: "error",
      message: "Échec de connexion à la base de données",
      source: "database.connection",
      user: "system",
      details: "Connection timeout after 30 seconds"
    },
    {
      id: 2,
      timestamp: "2024-01-15 14:25:10",
      level: "warning",
      message: "Tentative de connexion échouée",
      source: "auth.login",
      user: "user@example.com",
      details: "Invalid credentials provided"
    },
    {
      id: 3,
      timestamp: "2024-01-15 14:20:45",
      level: "info",
      message: "Nouvelle session utilisateur créée",
      source: "auth.session",
      user: "admin@transflow.com",
      details: "Session ID: abc123xyz"
    },
    {
      id: 4,
      timestamp: "2024-01-15 14:15:30",
      level: "error",
      message: "Erreur de validation des données",
      source: "api.validation",
      user: "agent@transflow.com",
      details: "Required field 'amount' is missing"
    },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: { [key: string]: "destructive" | "secondary" | "default" } = {
      error: "destructive",
      warning: "secondary",
      info: "default"
    };
    return <Badge variant={variants[level] || "default"}>{level.toUpperCase()}</Badge>;
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleExport = () => {
    // TODO: Implémenter l'export des logs
    console.log("Export des logs...");
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journaux d'Erreurs</h1>
          <p className="text-gray-600">
            Surveillance et analyse des erreurs système en temps réel.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="warning">Avertissements</SelectItem>
                  <SelectItem value="info">Informations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erreurs (24h)</p>
                <p className="text-2xl font-bold text-red-600">12</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avertissements (24h)</p>
                <p className="text-2xl font-bold text-yellow-600">28</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'erreur (%)</p>
                <p className="text-2xl font-bold text-green-600">0.2%</p>
              </div>
              <Info className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Utilisateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      {getLevelBadge(log.level)}
                    </div>
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell className="font-mono text-sm">{log.source}</TableCell>
                  <TableCell>{log.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun log trouvé avec les critères de recherche actuels.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorLogs;
