import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Image, ExternalLink, Info } from "lucide-react";

export default function FilesPanel({ documents }) {

  const getFileIcon = (fileType) => {
    if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
      return <Image className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    }
    return <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 border-b dark:border-gray-700 pb-2">
        Arquivos Carregados
      </h3>
      {documents && documents.length > 0 ? (
        <div className="flex-1 overflow-y-auto mobile-scroll">
          <Table>
            <TableHeader>
              <TableRow className="border-b dark:border-gray-700"><TableHead className="w-[35px] sm:w-[40px] px-1 sm:px-2 text-gray-700 dark:text-gray-300"></TableHead><TableHead className="px-1 sm:px-2 text-sm text-gray-700 dark:text-gray-300">Nome</TableHead><TableHead className="w-[50px] sm:w-[60px] px-1 sm:px-2 text-right text-gray-700 dark:text-gray-300"></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <TableCell className="px-1 sm:px-2">{getFileIcon(doc.file_type)}</TableCell>
                  <TableCell className="font-medium truncate max-w-[120px] sm:max-w-[150px] px-1 sm:px-2 text-xs sm:text-sm text-gray-800 dark:text-gray-200" title={doc.filename}>
                    {doc.filename}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(doc.created_date), 'dd/MM HH:mm', { locale: ptBR })}
                    </p>
                  </TableCell>
                  {/* <TableCell className="px-2 text-xs">{formatFileSize(doc.file_size)}</TableCell> */}
                  <TableCell className="px-1 sm:px-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 h-8 w-8 sm:h-9 sm:w-9 touch-target"
                      title="Abrir arquivo original"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 px-2">
          <Info className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" />
          <p className="text-xs sm:text-sm">Nenhum arquivo foi carregado ainda.</p>
          <p className="text-xs mt-1">Use o botão de upload na barra de chat.</p>
        </div>
      )}
    </div>
  );
}