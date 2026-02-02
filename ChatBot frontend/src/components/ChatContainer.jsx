import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = user?.name || "Guest";

  // 🔐 LOGOUT (NO redirect)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("guestId");

    setMessages([]);
    setSessionId(null);
    // ❌ no navigate here
  };

  // 🧠 CREATE SESSION (guest or logged-in)
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const guestId = res.headers.get("x-guest-id");
        if (guestId && !token) {
          localStorage.setItem("guestId", guestId);
        }

        const result = await res.json();
        if (result.success) {
          setSessionId(result.data.sessionId);
        }
      } catch (err) {
        console.error("Session error:", err);
      }
    };

    createSession();
  }, [token]);

  // 💬 SEND MESSAGE
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const guestId = token ? null : localStorage.getItem("guestId");

      const res = await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(guestId && { "x-guest-id": guestId }),
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage.text,
        }),
      });

      const result = await res.json();
      setIsTyping(false);

      if (result.success && result.data?.reply) {
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
    <div className="h-screen flex flex-col bg-black text-white">
      {/* 🔝 HEADER */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f1f1f] border-b border-gray-800">
        {/* Left: User / Guest */}
        <div className="px-3 py-1 rounded-lg bg-[#2a2a2a] text-sm tracking-wider">
          {displayName.toUpperCase()}
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-4 text-gray-400">
          {/* Login – only when Guest */}
          {!user && (
            <button
              onClick={() => navigate("/login")}
              title="Login"
              className="hover:text-white"
            >
              👤
            </button>
          )}

          {/* Logout – only when logged in */}
          {user && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="hover:text-white"
            >
              Logout
            </button>
          )}

          {/* New Chat */}
          <button
            onClick={() => {
              setMessages([]);
              setSessionId(null);
            }}
            title="New chat"
            className="hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      {/* 💬 MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl text-sm bg-gray-200 text-gray-600 italic">
              Bot is typing...
            </div>
          </div>
        )}
      </div>

      {/* ⌨️ INPUT */}
      <div className="border-t border-gray-800 p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-black border border-gray-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-5 py-2 rounded-full text-sm hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
