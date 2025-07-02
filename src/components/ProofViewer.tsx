import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Image, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ProofViewerProps {
  proofUrl?: string;
  transactionId?: string;
  transactionReference?: string;
}

const ProofViewer: React.FC<ProofViewerProps> = ({ 
  proofUrl, 
  transactionId, 
  transactionReference 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!proofUrl) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
        <AlertTriangle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 font-medium">Aucune preuve fournie</p>
        <p className="text-xs text-gray-500">Cette transaction n'a pas de preuve attachée</p>
      </div>
    );
  }

  const getFileExtension = (url: string) => {
    try {
      const pathname = new URL(url).pathname;
      return pathname.split('.').pop()?.toLowerCase() || '';
    } catch {
      return '';
    }
  };

  const isImageFile = (url: string) => {
    const ext = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  };

  const isPdfFile = (url: string) => {
    const ext = getFileExtension(url);
    return ext === 'pdf';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = proofUrl;
    link.download = `preuve-${transactionReference || transactionId || 'transaction'}.${getFileExtension(proofUrl)}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetZoomAndRotation = () => {
    setZoom(100);
    setRotation(0);
  };

  const renderPreview = () => {
    if (isImageFile(proofUrl)) {
      return (
        <div className="relative">
          {!imageError ? (
            <img
              src={proofUrl}
              alt="Preuve de transaction"
              className="w-full h-32 object-cover rounded-lg border"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-32 border rounded-lg flex items-center justify-center bg-red-50">
              <div className="text-center text-red-600">
                <AlertTriangle className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">Erreur de chargement</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Image className="w-3 h-3 mr-1" />
              Image
            </Badge>
          </div>
        </div>
      );
    } else if (isPdfFile(proofUrl)) {
      return (
        <div className="relative">
          <div className="w-full h-32 border rounded-lg flex items-center justify-center bg-blue-50">
            <div className="text-center text-blue-600">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Document PDF</p>
              <p className="text-xs">Cliquez pour ouvrir</p>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Badge>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative">
          <div className="w-full h-32 border rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-600">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Document</p>
              <p className="text-xs">Format: {getFileExtension(proofUrl).toUpperCase()}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              <FileText className="w-3 h-3 mr-1" />
              {getFileExtension(proofUrl).toUpperCase()}
            </Badge>
          </div>
        </div>
      );
    }
  };

  const renderModalContent = () => {
    if (isImageFile(proofUrl) && !imageError) {
      return (
        <div className="space-y-4">
          {/* Contrôles d'image */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                disabled={zoom <= 25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((rotation + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={resetZoomAndRotation}>
              Réinitialiser
            </Button>
          </div>

          {/* Image */}
          <div className="overflow-auto max-h-96 border rounded-lg">
            <img
              src={proofUrl}
              alt="Preuve de transaction"
              className="mx-auto"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </div>
      );
    } else if (isPdfFile(proofUrl)) {
      return (
        <div className="space-y-4">
          <div className="text-center p-8 border rounded-lg">
            <FileText className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Document PDF</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cliquez sur le bouton ci-dessous pour ouvrir le document dans un nouvel onglet
            </p>
            <Button onClick={() => window.open(proofUrl, '_blank')}>
              Ouvrir le PDF
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="text-center p-8 border rounded-lg">
            <FileText className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Document</h3>
            <p className="text-sm text-gray-600 mb-2">
              Format: {getFileExtension(proofUrl).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Ce type de fichier ne peut pas être prévisualisé dans le navigateur
            </p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
        {renderPreview()}
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsModalOpen(true)}
          className="text-blue-600 hover:text-blue-700"
        >
          <ZoomIn className="h-4 w-4 mr-1" />
          Agrandir
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownload}
          className="text-gray-600 hover:text-gray-700"
        >
          <Download className="h-4 w-4 mr-1" />
          Télécharger
        </Button>
      </div>

      {/* Modal pour l'affichage en grand */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Preuve - Transaction {transactionReference || transactionId?.slice(0, 8)}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </Button>
            </DialogTitle>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProofViewer;