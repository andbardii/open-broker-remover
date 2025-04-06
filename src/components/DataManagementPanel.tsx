import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, Download, Upload, Database } from 'lucide-react';
import { developerService } from '@/lib/developer';
import { toast } from './ui/use-toast';
import { Alert, AlertDescription } from './ui/alert';

const DataManagementPanel: React.FC = () => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await developerService.exportAllData();
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      a.href = url;
      a.download = `open-broker-remover-export-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: t('export-success'),
        description: `${t('download-export')}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Error',
        description: `Failed to export data: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportError(null);
    
    try {
      const fileContent = await readFileAsText(file);
      const result = await developerService.importData(fileContent);
      
      if (result.success) {
        toast({
          title: t('import-success'),
          description: result.message,
        });
      } else {
        setImportError(result.message);
        toast({
          title: t('import-error'),
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setImportError(errorMessage);
      
      toast({
        title: t('import-error'),
        description: `Failed to import data: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      // Reset the file input
      event.target.value = '';
      setIsImporting(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">{t('data-management')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Export or import application data for backup or migration purposes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('export-data')}</CardTitle>
            <CardDescription>
              Export all data brokers and requests to a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will export all your data broker information and request history.
              The file can be used as a backup or to migrate data to another installation.
            </p>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : t('export-data')}
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('import-data')}</CardTitle>
            <CardDescription>
              Import data brokers and requests from a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import data from a previously exported file. This will add to your
              existing data without deleting current entries.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
            <Button
              onClick={triggerFileInput}
              disabled={isImporting}
              className="w-full"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importing...' : t('import-data')}
            </Button>

            {importError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagementPanel; 