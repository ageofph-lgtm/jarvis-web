import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, onFeedback }) {
  return (
    <div className="flex-1 overflow-y-auto mobile-scroll px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble 
                message={message}
                onFeedback={onFeedback}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}