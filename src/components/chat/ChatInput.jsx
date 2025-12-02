
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Upload, Mic, MicOff, Image, FileText, Sun, Moon } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSend = () => {
    if (message.trim() || selectedFiles.length > 0) {
      onSendMessage(message, selectedFiles);
      setMessage("");
      setSelectedFiles([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Adicionar função para captura de câmera
  const handleCameraCapture = () => {
    // Criar input para captura de câmera
    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'environment'; // Usar câmera traseira por padrão
    cameraInput.style.display = 'none';
    
    cameraInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      document.body.removeChild(cameraInput); // Limpar o input dinâmico
    });
    
    document.body.appendChild(cameraInput);
    cameraInput.click();
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'pt-BR';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const getFileIcon = (file) => {
    if (file.type.includes('image')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-full mx-auto">
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 sm:mb-3"
            >
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {selectedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 shadow-sm"
                  >
                    {getFileIcon(file)}
                    <span className="truncate max-w-20 sm:max-w-32">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 ml-1 touch-target flex items-center justify-center w-4 h-4"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-800 rounded-full px-2 sm:px-3 py-2 sm:py-3 shadow-md border-2 border-[var(--jarvis-input-border)] dark:border-[var(--jarvis-input-border)]">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-9 h-9 sm:w-10 sm:h-10 text-gray-500 dark:text-gray-400 hover:text-[var(--jarvis-primary)] dark:hover:text-[var(--jarvis-primary)] hover:bg-purple-50 dark:hover:bg-gray-700 rounded-full touch-target flex-shrink-0"
            title="Selecionar arquivos"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          {/* Novo botão para captura de câmera */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCameraCapture}
            disabled={disabled}
            className="w-9 h-9 sm:w-10 sm:h-10 text-gray-500 dark:text-gray-400 hover:text-[var(--jarvis-primary)] dark:hover:text-[var(--jarvis-primary)] hover:bg-purple-50 dark:hover:bg-gray-700 rounded-full touch-target flex-shrink-0"
            title="Tirar foto"
          >
            <Image className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Olá, como posso ajudar?"
            disabled={disabled}
            className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm sm:text-base min-w-0"
            style={{ fontSize: '16px' }}
          />
          
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-600 hover:bg-red-700 p-0 touch-target flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-purple-50 dark:hover:bg-gray-700 touch-target flex-shrink-0 ${
              isRecording 
                ? 'text-red-500 animate-pulse' 
                : 'text-gray-500 dark:text-gray-400 hover:text-[var(--jarvis-primary)] dark:hover:text-[var(--jarvis-primary)]'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 text-gray-500 dark:text-gray-400 hover:text-[var(--jarvis-primary)] dark:hover:text-[var(--jarvis-primary)] hover:bg-purple-50 dark:hover:bg-gray-700 rounded-full touch-target flex-shrink-0"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
