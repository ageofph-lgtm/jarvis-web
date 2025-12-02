import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, FileText, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  // Removido o estado de tema do Layout, será controlado no ChatInput para mobile,
  // e globalmente pelo `document.documentElement.classList` e localStorage.
  // O botão de tema global (para desktop) foi mantido aqui.

  // Efeito para ler o tema do localStorage na inicialização
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Função para alternar o tema (usada pelo botão de desktop)
  const toggleGlobalTheme = () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    // Forçar re-renderização de componentes que dependem do tema visualmente se necessário,
    // ou eles podem usar seu próprio estado local e ouvir o localStorage.
    // Para este caso, o ChatInput gerencia seu próprio botão e o DocumentsPage usa CSS vars.
  };


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <style>{`
        :root {
          --jarvis-primary: #8b5cf6; /* purple-500 */
          --jarvis-secondary: #ec4899; /* pink-500 */
          --jarvis-user-bubble: #FF5722; /* orange-600 (custom) */
          --jarvis-bot-bubble: #424242; /* gray-700 (custom) */
          --jarvis-text-dark: #212121; /* gray-800 (custom) */
          --jarvis-text-light: #FFFFFF;
          --jarvis-input-border: #8b5cf6; /* purple-500 */

          /* Light theme specifics */
          --bg-default: #FFFFFF;
          --bg-subtle: #F9FAFB; /* gray-50 */
          --text-default: #1F2937; /* gray-800 */
          --text-muted: #6B7280; /* gray-500 */
          --border-default: #E5E7EB; /* gray-200 */
          --card-bg: #FFFFFF;
        }
        
        .dark {
          --jarvis-primary: #A78BFA; /* purple-400 */
          --jarvis-secondary: #F472B6; /* pink-400 */
          --jarvis-bot-bubble: #4B5563; /* gray-600 */
          --jarvis-text-dark: #F3F4F6; /* gray-100 */
          --jarvis-input-border: #A78BFA; /* purple-400 */

          /* Dark theme specifics */
          --bg-default: #111827; /* gray-900 */
          --bg-subtle: #1F2937; /* gray-800 */
          --text-default: #F3F4F6; /* gray-100 */
          --text-muted: #9CA3AF; /* gray-400 */
          --border-default: #374151; /* gray-700 */
          --card-bg: #1F2937; /* gray-800 */
        }
        
        /* ... keep existing code (animations, scroll, mobile media queries, touch targets) ... */
         .message-typing {
          animation: typing 1.5s infinite;
        }
        
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
        
        .scroll-smooth {
          scroll-behavior: smooth;
        }

        @media (max-width: 768px) {
          html { font-size: 16px; }
          input, textarea, select { font-size: 16px; border-radius: 0; }
          .mobile-safe-area { padding-bottom: env(safe-area-inset-bottom); }
        }

        button, .touch-target { min-height: 44px; min-width: 44px; }
        .mobile-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
      `}</style>
      
      {/* Botão de Tema Global - Visível apenas em telas maiores que SM (Desktop) */}
      <div className="fixed top-4 right-4 z-50 hidden sm:block">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleGlobalTheme}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          {/* Este ícone agora precisa de um estado local ou ler a classe do HTML para ser preciso */}
          {/* Simplificando: assumimos que ele reflete o estado global. Uma solução mais robusta ouviria o localStorage ou teria estado global. */}
          {typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}