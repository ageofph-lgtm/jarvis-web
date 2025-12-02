import React from "react";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start px-3 sm:px-6 mb-3 sm:mb-4">
      <div className="max-w-4xl mx-auto w-full">
        <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
          <div className="bg-gray-700 dark:bg-gray-600 text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 mr-4 sm:mr-8 lg:mr-12">
            <div className="flex items-center gap-1">
              <span className="text-white text-sm sm:text-base">Jarvis está digitando</span>
              <div className="flex gap-1 ml-2">
                <div className="w-2 h-2 bg-white rounded-full message-typing"></div>
                <div className="w-2 h-2 bg-white rounded-full message-typing" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full message-typing" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}