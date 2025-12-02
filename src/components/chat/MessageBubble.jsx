
import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Volume2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MessageBubble({ message, onFeedback }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const isUser = message.sender === "user";

  useEffect(() => {
    // Carregar vozes disponíveis quando o componente montar
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    // A lista de vozes pode não estar disponível imediatamente
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices(); // Chamar uma vez caso já estejam disponíveis

    // Cleanup function if needed, though for speechSynthesis, often not strictly necessary as it's a global API
    return () => {
      if (speechSynthesis.onvoiceschanged === loadVoices) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleTextToSpeech = async () => {
    if (isPlaying || !voices.length) return;
    
    setIsPlaying(true);
    try {
      const utterance = new SpeechSynthesisUtterance(message.message);
      
      // Tentar encontrar uma voz masculina suave em português
      let selectedVoice = voices.find(voice => 
        voice.lang === 'pt-BR' && 
        voice.name.toLowerCase().includes('male')
      );

      // Fallback para qualquer voz masculina em pt-BR, ou a primeira pt-BR, ou a primeira disponível
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'pt-BR' && voice.name.toLowerCase().includes('masculino'));
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'pt-BR');
      }
      if (!selectedVoice) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.lang = selectedVoice?.lang || (message.language === 'pt' ? 'pt-BR' : 
                      message.language === 'en' ? 'en-US' : 
                      message.language === 'es' ? 'es-ES' : 'pt-BR');
      utterance.rate = 0.9; // Ligeiramente mais lento para suavidade
      utterance.pitch = 0.8; // Tom mais grave para voz masculina e suavidade
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        console.error("Erro na síntese de voz:", e);
        setIsPlaying(false);
      };
      
      speechSynthesis.cancel(); // Cancelar falas anteriores
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Erro ao iniciar síntese de voz:", error);
      setIsPlaying(false);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}>
      <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] ${isUser ? '' : ''}`}>
        {/* Message Content */}
        <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-red-500 text-white ml-4 sm:ml-8 lg:ml-12' 
            : 'bg-gray-700 dark:bg-gray-600 text-white mr-4 sm:mr-8 lg:mr-12'
        }`}>
          {/* Revertendo para a classe original para melhor formatação */}
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
            {message.message}
          </p>
          
          {/* Arquivos anexados */}
          {message.context_files && message.context_files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
              {message.context_files.map((fileUrl, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white text-xs">
                  <Paperclip className="w-3 h-3 mr-1" />
                  Arquivo {index + 1}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Message Controls apenas para o Jarvis */}
        {!isUser && (
          <div className="flex items-center gap-1 sm:gap-2 mt-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTextToSpeech}
              disabled={isPlaying || voices.length === 0}
              className="h-8 w-8 sm:h-9 sm:w-9 px-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 touch-target"
              title={voices.length === 0 ? "Carregando vozes..." : "Ouvir mensagem"}
            >
              <Volume2 className={`w-3 h-3 sm:w-4 sm:h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(message.id, message.feedback === 'like' ? 'none' : 'like')}
              className={`h-8 w-8 sm:h-9 sm:w-9 px-0 hover:bg-gray-100 dark:hover:bg-gray-700 touch-target ${
                message.feedback === 'like' ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400'
              }`}
            >
              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(message.id, message.feedback === 'dislike' ? 'none' : 'dislike')}
              className={`h-8 w-8 sm:h-9 sm:w-9 px-0 hover:bg-gray-100 dark:hover:bg-gray-700 touch-target ${
                message.feedback === 'dislike' ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              }`}
            >
              <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
