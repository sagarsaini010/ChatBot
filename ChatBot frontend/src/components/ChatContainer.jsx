import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = user?.name || "Guest";

  /* 🔐 LOGOUT */
  const handleLogout = () => {
    localStorage.clear();
    setMessages([]);
    setSessionId(null);
  };

  /* 🧠 CREATE SESSION */
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

  /* 🔽 AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ⚡ STREAM HELPER */
  const streamText = (fullText, onUpdate, speed = 1) => {
    let index = 0;

    const interval = setInterval(() => {
      index++;
      onUpdate(fullText.slice(0, index));

      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);
  };

  /* 💬 SEND MESSAGE */
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

      if (result.success && result.data?.reply) {
        const botId = Date.now() + 1;

        // empty bot bubble
        setMessages((prev) => [
          ...prev,
          { id: botId, sender: "bot", text: "" },
        ]);

        // stream text
        streamText(result.data.reply, (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, text: chunk } : m
            )
          );
        });
      }
    } catch (err) {
      setIsTyping(false);
      console.error("Chat error:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#222] text-white">
      {/* 🔝 HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#1f1f1f] border-b border-gray-800">
        <button
          onClick={() => {
            setMessages([]);
            setSessionId(null);
          }}
          className="text-sm text-gray-300 hover:text-white"
        >
          + New Chat
        </button>

        <div className="flex items-center gap-4">
          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-gray-300 hover:text-white"
            >
              Login
            </button>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-300 hover:text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* 💬 MESSAGES */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } max-w-4xl mx-auto px-3`}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm shadow whitespace-pre-wrap
                ${
                  msg.sender === "user"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-[#383737] text-white rounded-bl-none"
                }
                max-w-[85%] sm:max-w-[75%] md:max-w-[65%]
              `}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
              {isTyping && msg.sender === "bot" && (
                <span className="animate-pulse ml-1">▍</span>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ⌨️ INPUT */}
      <div className="border-t border-gray-800 py-4 bg-black">
        <div className="max-w-4xl mx-auto px-3 flex items-center gap-2">
          <div className="hidden sm:block px-3 py-1 rounded-lg bg-[#2a2a2a] text-xs tracking-wider">
            {displayName.toUpperCase()}
          </div>

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
            placeholder="Message ChatGPT..."
            className="flex-1 bg-[#111] border border-gray-700 text-white
                       rounded-2xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={handleSend}
            className="bg-green-500 text-white px-4 py-3 rounded-xl text-sm hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
