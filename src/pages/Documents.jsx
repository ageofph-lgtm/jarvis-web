
import React, { useState, useEffect } from "react";
import { Document } from "@/entities/all";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await Document.list("-created_date");
      setDocuments(docs);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { file_url } = await UploadFile({ file });
        
        const docData = {
          filename: file.name,
          file_url: file_url,
          file_type: file.type.includes('pdf') ? 'pdf' : 
                    file.type.includes('sheet') || file.name.includes('.xlsx') || file.name.includes('.xls') ? 'xlsx' :
                    file.type.includes('text') ? 'txt' :
                    file.type.includes('image') ? (file.type.includes('png') ? 'png' : 'jpg') : 'txt',
          file_size: file.size
        };
        
        await Document.create(docData);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      await loadDocuments();
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const getFileIcon = (fileType) => {
    if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
      return <Image className="w-5 h-5 text-blue-400 dark:text-blue-300" />;
    }
    return <FileText className="w-5 h-5 text-purple-400 dark:text-purple-300" />;
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'pdf': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'xlsx': case 'xls': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'txt': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'png': case 'jpg': case 'jpeg': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      default: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-[var(--jarvis-bg)] text-[var(--jarvis-text)]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--jarvis-text)] mb-2">
            Biblioteca de Documentos
          </h1>
          <p className="text-purple-400 dark:text-purple-300 text-sm sm:text-base">
            Gerencie manuais e documentos técnicos das empilhadeiras STILL
          </p>
        </div>

        {/* Upload Area */}
        <Card className="bg-[var(--card-bg)] border-[var(--border-default)] mb-6 sm:mb-8 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-[var(--text-default)] flex items-center gap-2 text-lg sm:text-xl">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Upload de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="border-2 border-dashed border-[var(--jarvis-primary)]/50 dark:border-[var(--jarvis-primary)]/70 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
                style={{ fontSize: '16px' }}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3 sm:gap-4 touch-target"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[var(--jarvis-primary)] to-[var(--jarvis-secondary)] rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <p className="text-[var(--text-default)] font-medium mb-1 text-sm sm:text-base">
                    Clique para selecionar arquivos
                  </p>
                  <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                    Suporte: PDF, Excel, Texto, Imagens
                  </p>
                </div>
              </label>
            </div>
            
            {isUploading && (
              <div className="mt-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[var(--jarvis-primary)] to-[var(--jarvis-secondary)] h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-[var(--text-muted)] text-sm mt-2">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="bg-[var(--card-bg)] border-[var(--border-default)] hover:border-[var(--jarvis-primary)]/50 transition-all duration-200 shadow-lg">
              <CardHeader className="pb-3 p-3 sm:p-4 lg:p-6 lg:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {getFileIcon(doc.file_type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[var(--text-default)] font-medium truncate text-sm sm:text-base">
                        {doc.filename}
                      </h3>
                      <p className="text-[var(--text-muted)] text-xs">
                        {doc.created_date && format(new Date(doc.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getFileTypeColor(doc.file_type)} text-xs flex-shrink-0`}>
                    {doc.file_type.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-xs sm:text-sm text-[var(--text-muted)]">
                    Tamanho: {formatFileSize(doc.file_size)}
                  </div>
                  
                  {doc.extracted_content && (
                    <div className="text-xs text-[var(--text-muted)] bg-black/10 dark:bg-white/5 rounded p-2">
                      <p className="truncate">
                        {doc.extracted_content.substring(0, 80)}...
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[var(--border-default)] text-[var(--text-default)] hover:bg-black/5 dark:hover:bg-white/5 text-xs sm:text-sm h-8 sm:h-9 touch-target"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Abrir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-[var(--jarvis-primary)] to-[var(--jarvis-secondary)] flex items-center justify-center opacity-50">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-default)] mb-2">
              Nenhum documento ainda
            </h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto text-sm sm:text-base px-4">
              Faça upload de manuais e documentos técnicos para que o Jarvis possa fornecer respostas mais precisas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
