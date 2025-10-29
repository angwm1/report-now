// src\components\ChatbotWidget.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaSpinner } from "react-icons/fa";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const conversationEndRef = useRef(null);

  // Show initial greeting once when chat opens
  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      setConversation([
        {
          role: "assistant",
          content:
            "Hello! I am GovBot, an expert chatbot in Singapore Government‑related matters. I can provide information about major ministries, statutory boards, and autonomous agencies in Singapore. Feel free to ask me anything!",
        },
      ]);
    }
  }, [isOpen, conversation.length]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    if (!input.trim()) return;

    // Append the user message to the conversation
    const userMessage = { role: "user", content: input.trim() };
    const updatedHistory = [...conversation, userMessage];
    setConversation(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      // Call our API endpoint with the message and conversation history
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: updatedHistory.filter((msg) => msg.role !== "system"),
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Chatbot request failed");
      }
      const { reply } = await res.json();
      const botMessage = { role: "assistant", content: reply };
      setConversation((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setError(err.message || "An error occurred.");
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-80 max-w-full bg-white shadow-lg rounded-lg flex flex-col">
          {/* Header */}
          <div className="bg-red-500 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-bold">GovBot Chat</span>
            <button onClick={toggleChat} aria-label="Close chat" className="focus:outline-none">
              <FaTimes />
            </button>
          </div>
          {/* Conversation */}
          <div className="p-3 flex-grow overflow-y-auto max-h-80">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 p-2 rounded ${
                  msg.role === "assistant"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-500 text-white self-end"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="p-2 rounded bg-gray-100 text-gray-800 flex items-center">
                <FaSpinner className="animate-spin mr-2" /> Typing...
              </div>
            )}
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
            <div ref={conversationEndRef} />
          </div>
          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              aria-label="Chat message input"
              className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-all focus:outline-none"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Icon */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 focus:outline-none"
        aria-label="Open chat"
      >
        <FaComments size={24} />
      </button>
    </>
  );
}