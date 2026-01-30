import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";


export default function ChatPage() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // ✅ typing state

  // STEP 1: Page load → create session
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();
        if (result.success) {
          setSessionId(result.data.sessionId);
          console.log("Session created:", result.data.sessionId);
        }
      } catch (err) {
        console.error("Session error:", err);
      }
    };

    createSession();
  }, []);

  // STEP 2: Send message
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    // 1️⃣ User message show
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // 2️⃣ Bot typing start
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMessage.text,
        }),
      });

      const result = await res.json();

      // 3️⃣ Bot typing stop
      setIsTyping(false);

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: result.data.reply,
          },
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      console.error("Chat error:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow ${
                msg.sender === "user"
                  ? "bg-green-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
                
            </div>
          </div>
        ))}

        {/* ✅ Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[60%] px-4 py-2 rounded-2xl text-sm bg-gray-200 text-gray-600 italic">
              Bot is typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-black p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
