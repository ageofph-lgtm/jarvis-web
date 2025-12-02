
import React, { useState, useEffect, useRef } from "react";
import { Conversation, Document } from "@/entities/all";
import { InvokeLLM, UploadFile } from "@/integrations/Core";

import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import FilesPanel from "../components/chat/FilesPanel"; // Novo componente para o painel de arquivos

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  // Gerar um ID de sessão simples no cliente
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const [allUploadedDocs, setAllUploadedDocs] = useState([]); // Estado para os documentos do histórico

  useEffect(() => {
    loadConversationHistory();
    fetchAllDocuments(); // Carregar todos os documentos para o modal
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAllDocuments = async () => {
    try {
      // Listar documentos ordenados por data de criação decrescente
      const docs = await Document.list("-created_date");
      setAllUploadedDocs(docs);
    } catch (error) {
      console.error("Erro ao carregar todos os documentos:", error);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const history = await Conversation.filter({ session_id: sessionId }, "created_date", 50);
      if (history.length === 0) {
        // Adiciona a mensagem de boas-vindas se não houver histórico
        setMessages([{
          id: 'welcome-message',
          message: 'Olá! 😊 Como posso ajudar? 🤔 Precisa de alguma informação sobre o sistema elétrico de um empilhador? 🚚⚡️ Ou sobre algum componente específico? 🦉 Pode perguntar! 😄',
          sender: 'jarvis',
          language: 'pt',
          created_date: new Date().toISOString(),
          feedback: 'none'
        }]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const detectLanguage = (text) => {
    // Detecção simples de idioma baseada em palavras comuns
    const portugueseWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na'];
    const englishWords = ['the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as'];
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son'];
    
    const words = text.toLowerCase().split(/\s+/);
    
    let ptCount = 0, enCount = 0, esCount = 0;
    
    words.forEach(word => {
      if (portugueseWords.includes(word)) ptCount++;
      if (englishWords.includes(word)) enCount++;
      if (spanishWords.includes(word)) esCount++;
    });
    
    if (ptCount > enCount && ptCount > esCount) return 'pt';
    if (enCount > ptCount && enCount > esCount) return 'en';
    if (esCount > ptCount && esCount > enCount) return 'es';
    
    return 'pt'; // default para português
  };

  const generatePrompt = (userMessage, language, fileContents = [], hasImages = false) => {
    const systemPrompts = {
      pt: `Você é o Jarvis, um assistente de IA especializado em manutenção de empilhadeiras elétricas da marca STILL. 
           Sua principal função é responder perguntas técnicas baseando-se EXCLUSIVAMENTE, se possível, no CONTEÚDO DOS DOCUMENTOS FORNECIDOS${hasImages ? ' E ANALISANDO AS IMAGENS ENVIADAS' : ''}.
           
           Instruções Cruciais:
           1. PRIORIDADE MÁXIMA: Analise e use o CONTEÚDO DOS DOCUMENTOS listados abaixo em "DOCUMENTOS DE REFERÊNCIA".
           ${hasImages ? '2. ANÁLISE DE IMAGENS: Se imagens foram enviadas, analise-as detalhadamente para identificar componentes, problemas, códigos de erro, ou qualquer informação técnica visível.' : ''}
           ${hasImages ? '3. INTEGRAÇÃO: Combine as informações das imagens com o conhecimento dos documentos para fornecer respostas mais precisas.' : '2.'}
           Se a pergunta puder ser respondida COM BASE NOS DOCUMENTOS${hasImages ? ' OU IMAGENS' : ''}, use ESSA INFORMAÇÃO DIRETAMENTE.
           ${hasImages ? '4.' : '3.'} SOMENTE SE os documentos${hasImages ? ' e imagens' : ''} NÃO contiverem a resposta, você pode usar seu conhecimento geral.
           ${hasImages ? '5.' : '4.'} Sempre responda no idioma da pergunta do usuário.
           ${hasImages ? '6.' : '5.'} Seja preciso, técnico e detalhado.
           ${hasImages ? '7.' : '6.'} Se necessário, sugira verificações de segurança.
           ${hasImages ? '8. Para imagens, descreva o que você vê e relacione com possíveis problemas ou soluções de manutenção.' : ''}`,
      
      en: `You are Jarvis, an AI assistant specialized in STILL electric forklift maintenance.
           Your primary function is to answer technical questions based EXCLUSIVELY, if possible, on THE CONTENT OF THE PROVIDED DOCUMENTS${hasImages ? ' AND BY ANALYZING THE SENT IMAGES' : ''}.

           Crucial Instructions:
           1. HIGHEST PRIORITY: Analyze and use THE CONTENT OF THE DOCUMENTS listed below under "REFERENCE DOCUMENTS".
           ${hasImages ? '2. IMAGE ANALYSIS: If images were sent, analyze them in detail to identify components, problems, error codes, or any visible technical information.' : ''}
           ${hasImages ? '3. INTEGRATION: Combine information from images with document knowledge to provide more accurate answers.' : '2.'}
           If the question can be answered BASED ON THE DOCUMENTS${hasImages ? ' OR IMAGES' : ''}, use THAT INFORMATION DIRECTLY.
           ${hasImages ? '4.' : '3.'} ONLY IF the documents${hasImages ? ' and images' : ''} DO NOT contain the answer, may you use your general knowledge.
           ${hasImages ? '5.' : '4.'} Always respond in the language of the user's question.
           ${hasImages ? '6.' : '5.'} Be precise, technical, and detailed.
           ${hasImages ? '7.' : '6.'} If necessary, suggest safety checks.
           ${hasImages ? '8. For images, describe what you see and relate it to possible maintenance problems or solutions.' : ''}`,
      
      es: `Eres Jarvis, un asistente de IA especializado en mantenimiento de montacargas eléctricos STILL.
           Tu función principal es responder preguntas técnicas basándote EXCLUSIVAMENTE, si es posible, en EL CONTENIDO DE LOS DOCUMENTOS PROPORCIONADOS${hasImages ? ' Y ANALIZANDO LAS IMÁGENES ENVIADAS' : ''}.

           Instrucciones Cruciales:
           1. MÁXIMA PRIORIDAD: Analiza y utiliza EL CONTENIDO DE LOS DOCUMENTOS listados a continuación bajo "DOCUMENTOS DE REFERENCIA".
           ${hasImages ? '2. ANÁLISIS DE IMÁGENES: Si se enviaron imágenes, analízalas detalladamente para identificar componentes, problemas, códigos de error, o cualquier información técnica visible.' : ''}
           ${hasImages ? '3. INTEGRACIÓN: Combina la información de las imágenes con el conocimiento de los documentos para proporcionar respuestas más precisas.' : '2.'}
           Si la pregunta puede responderse BASÁNDOSE EN LOS DOCUMENTOS${hasImages ? ' O IMÁGENES' : ''}, UTILIZA ESA INFORMACIÓN DIRECTAMENTE.
           ${hasImages ? '4.' : '3.'} ÚNICAMENTE SI los documentos${hasImages ? ' e imágenes' : ''} NO contienen la respuesta, puedes usar tu conocimiento general.
           ${hasImages ? '5.' : '4.'} Responde siempre en el idioma de la pregunta del usuario.
           ${hasImages ? '6.' : '5.'} Sé preciso, técnico y detallado.
           ${hasImages ? '7.' : '6.'} Si es necesario, sugiere verificaciones de seguridad.
           ${hasImages ? '8. Para imágenes, describe lo que ves y relaciónalo con posibles problemas o soluciones de mantenimiento.' : ''}`
    };

    let prompt = systemPrompts[language] || systemPrompts.pt;
    
    if (fileContents.length > 0) {
      prompt += `\n\nDOCUMENTOS DE REFERÊNCIA (carregados ou pré-existentes):\n\n${fileContents.join('\n\n---\n\n')}`; // Adicionado separador
    } else {
      prompt += `\n\nNENHUM DOCUMENTO DE REFERÊNCIA FOI FORNECIDO PARA ESTA PERGUNTA ESPECÍFICA. RESPONDA COM BASE NO SEU CONHECIMENTO GERAL.`;
    }
    
    prompt += `\n\nPERGUNTA DO TÉCNICO: ${userMessage}`;
    
    return prompt;
  };

  const handleSendMessage = async (message, files = []) => {
    if (!message.trim() && files.length === 0) return;

    const language = detectLanguage(message);
    let allFileContentsForPrompt = [];
    let userNotificationMessages = [];
    let imageFiles = []; // Para armazenar URLs de imagens para análise

    // 1. Processar arquivos atualmente carregados pelo usuário
    if (files.length > 0) {
      for (const file of files) {
        try {
          const { file_url } = await UploadFile({ file });

          const fileType = file.type.includes('pdf') ? 'pdf' : 
                           file.type.includes('sheet') || file.name.includes('.xlsx') || file.name.includes('.xls') ? 'xlsx' :
                           file.type.includes('text') ? 'txt' :
                           file.type.includes('image') ? (file.type.includes('png') ? 'png' : 'jpg') : 'txt'; // Simplified image type check

          const docData = {
            filename: file.name,
            file_url: file_url,
            file_type: fileType,
            file_size: file.size
          };
          
          const savedDoc = await Document.create(docData);
          await fetchAllDocuments(); // Atualizar a lista de documentos para o painel

          const MAX_FILE_SIZE_FOR_EXTRACTION = 9.5 * 1024 * 1024; // 9.5 MB em bytes

          if (file.size > MAX_FILE_SIZE_FOR_EXTRACTION && (fileType === 'pdf' || fileType === 'xlsx' || fileType === 'txt')) {
            const sizeNotification = `O arquivo "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)}MB) é muito grande para análise automática de conteúdo (limite: 9.5MB). Ele foi anexado, mas seu conteúdo não será lido diretamente pelo Jarvis.`;
            userNotificationMessages.push(sizeNotification);
            allFileContentsForPrompt.push(`ARQUIVO CARREGADO: ${file.name}\nSTATUS: Conteúdo não extraído devido ao tamanho do arquivo.\nURL: ${file_url}`);
          } else if (fileType === 'pdf' || fileType === 'xlsx' || fileType === 'txt') {
            try {
              const extractResult = await InvokeLLM({
                prompt: `Extraia o conteúdo textual completo e relevante deste documento. Se for um PDF técnico, foque em especificações, procedimentos, códigos de erro e troubleshooting. Se for um Excel, extraia os dados tabulares de forma legível. Responda APENAS com o conteúdo extraído. Se não houver conteúdo textual ou for uma imagem, responda 'DOCUMENTO SEM TEXTO RELEVANTE PARA EXTRAÇÃO'.`,
                file_urls: [file_url] // Passa o URL para o LLM processar
              });
              
              if (extractResult && typeof extractResult === 'string' && !extractResult.toUpperCase().includes("DOCUMENTO SEM TEXTO RELEVANTE")) {
                allFileContentsForPrompt.push(`ARQUIVO CARREGADO: ${file.name}\nCONTEÚDO:\n${extractResult}\nURL: ${file_url}`);
                await Document.update(savedDoc.id, { extracted_content: extractResult });
                await fetchAllDocuments(); // Atualiza após extração bem-sucedida
              } else {
                allFileContentsForPrompt.push(`ARQUIVO CARREGADO: ${file.name}\nSTATUS: Não foi possível extrair conteúdo textual relevante ou o arquivo é uma imagem.\nURL: ${file_url}`);
                console.warn(`Não foi possível extrair conteúdo de ${file.name} ou é uma imagem.`);
              }
            } catch (extractError) {
              console.error(`Erro ao extrair conteúdo de ${file.name}:`, extractError);
              let statusMessageForPrompt = "Erro na extração de conteúdo.";
              let userNotificationForChat = `Não foi possível analisar o conteúdo do arquivo "${file.name}" devido a um erro. Ele foi anexado.`;

              const errorMessageString = extractError.message || extractError.toString();
              if (errorMessageString.includes("page limit") || errorMessageString.includes("exceeds the supported page limit")) {
                statusMessageForPrompt = "Conteúdo não extraído devido ao excesso de páginas.";
                userNotificationForChat = `O arquivo "${file.name}" é muito longo (excede o limite de páginas suportado) para análise automática de conteúdo. Ele foi anexado, mas seu conteúdo não será lido diretamente pelo Jarvis.`;
              } else if (errorMessageString.includes("too large") || errorMessageString.includes("size limit") || errorMessageString.includes("complexity")) {
                statusMessageForPrompt = "Conteúdo não extraído devido ao tamanho/complexidade.";
                userNotificationForChat = `O arquivo "${file.name}" é muito grande ou complexo para análise automática de conteúdo. Ele foi anexado, mas seu conteúdo não será lido diretamente pelo Jarvis.`;
              }
              
              userNotificationMessages.push(userNotificationForChat);
              allFileContentsForPrompt.push(`ARQUIVO CARREGADO: ${file.name}\nSTATUS: ${statusMessageForPrompt}\nURL: ${file_url}`);
            }
          } else if (fileType === 'png' || fileType === 'jpg') { // Aligned with simplified fileType
             // Adicionar imagem para análise visual
            imageFiles.push(file_url);
            allFileContentsForPrompt.push(`IMAGEM CARREGADA: ${file.name}\nSTATUS: Imagem será analisada visualmente pelo Jarvis.\nURL: ${file_url}`);
          }
        } catch (error) {
          console.error("Erro ao fazer upload:", error);
          const uploadErrorNotification = `Ocorreu um erro ao fazer upload do arquivo "${file.name}". Ele não foi anexado.`;
          userNotificationMessages.push(uploadErrorNotification);
        }
      }
    }

    // 2. Adicionar contexto de TODOS os documentos já existentes na biblioteca
    try {
      const existingDocuments = await Document.list("-created_date"); // Busca novamente para garantir os mais recentes
      for (const doc of existingDocuments) {
        // Evitar duplicar conteúdo de arquivos que acabaram de ser processados
        if (allFileContentsForPrompt.some(content => content.includes(doc.file_url))) continue;

        if (doc.extracted_content) {
          allFileContentsForPrompt.push(`DOCUMENTO DA BIBLIOTECA: ${doc.filename}\nCONTEÚDO:\n${doc.extracted_content}\nURL: ${doc.file_url}`);
        } else if (doc.file_url && (doc.file_type === 'pdf' || doc.file_type === 'xlsx' || doc.file_type === 'txt')) {
           const docStatus = doc.extracted_content === null || doc.extracted_content === undefined ? "Conteúdo não extraído ou não aplicável." : "Verificar manualmente.";
           allFileContentsForPrompt.push(`DOCUMENTO DA BIBLIOTECA: ${doc.filename}\nSTATUS: ${docStatus}\nURL: ${doc.file_url}`);
        } else if (doc.file_url && (doc.file_type === 'png' || doc.file_type === 'jpg')) { // Aligned with simplified fileType
           // Adicionar imagens da biblioteca também para análise se relevante
           imageFiles.push(doc.file_url);
           allFileContentsForPrompt.push(`IMAGEM DA BIBLIOTECA: ${doc.filename}\nSTATUS: Imagem disponível para análise visual.\nURL: ${doc.file_url}`);
        }
      }
    } catch (docError) {
      console.error("Erro ao carregar documentos existentes para contexto:", docError);
      userNotificationMessages.push("Não foi possível carregar todos os documentos existentes para fornecer contexto completo ao Jarvis.");
    }
    
    const userMsgData = {
      message,
      sender: "user",
      language,
      // Não precisamos mais de context_files aqui, pois o prompt já contém tudo
      session_id: sessionId
    };

    await Conversation.create(userMsgData);
    setMessages(prev => [...prev, { ...userMsgData, id: `user-${Date.now()}` }]); // Ensure unique ID

    if (userNotificationMessages.length > 0) {
      for (const notifMsg of userNotificationMessages) {
        const jarvisNotification = {
          id: `notification-${Date.now()}-${Math.random()}`,
          message: notifMsg,
          sender: "jarvis",
          language, // Use detected language for notifications too
          session_id: sessionId,
          feedback: 'none', // Mensagens de notificação não precisam de feedback
          created_date: new Date().toISOString()
        };
        // Não precisa criar no backend, é só uma notificação visual
        setMessages(prev => [...prev, jarvisNotification]);
      }
    }
    
    setIsTyping(true);

    try {
      const hasImages = imageFiles.length > 0;
      const promptText = generatePrompt(message, language, allFileContentsForPrompt, hasImages);
      const hasDocumentContext = allFileContentsForPrompt.some(
        fc => fc.includes("CONTEÚDO:") || fc.includes("STATUS: Conteúdo não extraído") || fc.includes("STATUS: Imagem")
      );
      
      // Preparar parâmetros para InvokeLLM
      const llmParams = {
        prompt: promptText,
        add_context_from_internet: !hasDocumentContext, // CRÍTICO: Só usa internet se NÃO houver contexto de documento (incluindo imagens)
      };

      // Se há imagens, adicionar ao parâmetro file_urls
      if (hasImages) {
        llmParams.file_urls = imageFiles;
      }

      const response = await InvokeLLM(llmParams);

      const jarvisMessage = {
        message: typeof response === 'string' ? response : JSON.stringify(response), // Garantir que a mensagem é uma string
        sender: "jarvis",
        language,
        session_id: sessionId,
        feedback: 'none' // Initialize feedback
      };

      const savedJarvisMessage = await Conversation.create(jarvisMessage);
      setMessages(prev => [...prev, { ...savedJarvisMessage }]);
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      
      const errorMessages = {
        pt: "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.",
        en: "Sorry, an error occurred while processing your question. Please try again.",
        es: "Lo siento, ocurrió un error al procesar tu pregunta. Inténtalo de nuevo."
      };
      
      const errorMessageData = {
        id: `error-message-${Date.now()}-${Math.random()}`,
        message: errorMessages[language] || errorMessages.pt,
        sender: "jarvis",
        language,
        session_id: sessionId,
        feedback: 'none', // Mensagens de erro não precisam de feedback
        created_date: new Date().toISOString()
      };
      // Não precisa criar no backend, é só uma notificação visual
      setMessages(prev => [...prev, errorMessageData]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId, feedback) => {
    try {
      const messageToUpdate = messages.find(m => m.id === messageId);
      if (messageToUpdate && messageToUpdate.sender === 'jarvis') { // Only allow feedback on Jarvis messages
        // Ensure the message ID exists (it should if it's from the state)
        const updatedMessage = await Conversation.update(messageId, { feedback });
        setMessages(prev => 
          prev.map(m => m.id === messageId ? { ...m, feedback: updatedMessage.feedback } : m)
        );
      } else if (!messageToUpdate) {
        console.warn("Tentativa de dar feedback em mensagem não encontrada:", messageId);
      }
    } catch (error) {
      console.error("Erro ao salvar feedback:", error);
      // Optionally notify user of feedback save error
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header com logo - otimizado para mobile, agora sticky e maior */}
      <div className="sticky top-0 z-20 flex items-center justify-center py-2 sm:py-3 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a76b59a82_R9.png" 
          alt="Jarvis Logo" 
          className="w-28 h-28 sm:w-32 sm:h-32" // Aumentado ainda mais o tamanho
        />
      </div>
      
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Área Principal do Chat */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MessageList 
            messages={messages}
            onFeedback={handleFeedback}
          />
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
          
          <div className="mobile-safe-area">
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isTyping}
            />
          </div>
        </div>

        {/* Barra Lateral Direita: Histórico de Arquivos - oculta em mobile pequeno */}
        <div className="hidden lg:flex w-80 xl:w-96 border-l border-gray-200 dark:border-gray-700 flex-col bg-gray-50 dark:bg-gray-800">
          <FilesPanel documents={allUploadedDocs} />
        </div>
      </div>
    </div>
  );
}
