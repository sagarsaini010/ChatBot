import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";

const API = "http://localhost:5000";

export default function ChatPage() {

  const quotes = [
  "What's on the agenda today?",
  "Ask me anything 🚀",
  "Ready when you are 😎",
  "Let's build something cool 💡",
  "Your AI buddy is listening 👂",
  "What are we solving today?"
];
const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];
const [randomQuote, setRandomQuote] = useState(getRandomQuote());




  // 🔥 LOCALSTORAGE SE LOAD KARO
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sessions");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const [messagesBySession, setMessagesBySession] = useState(() => {
    const saved = localStorage.getItem("messagesBySession");
    return saved ? JSON.parse(saved) : {};
  });
  
  const [input, setInput] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showSidebar, setShowSidebar] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const messages = messagesBySession[currentSessionId] || [];
  const lastMessage = messages[messages.length - 1];

  const token = localStorage.getItem("token");
  const isGuest = !user;

  // 🔥 SAVE TO LOCALSTORAGE JAISE HI CHANGE HO
  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("messagesBySession", JSON.stringify(messagesBySession));
  }, [messagesBySession]);

  // CHECK AUTH
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    scrollToBottom();
  }, [lastMessage?.text, messages.length]);

  /* UPDATE SESSION TITLE */
  const updateSessionTitle = (sessionId, newTitle) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
  };

  /* LOGOUT */
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setSessions([]);
    setMessagesBySession({});
    setCurrentSessionId(null);
  };

  /* SELECT SESSION */
  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  /* DELETE SESSION */
  const handleDeleteSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setMessagesBySession((prev) => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });
    
    if (sessionId === currentSessionId) {
      setCurrentSessionId(null);
    }
  };

  /* CREATE NEW CHAT */
  const createNewChat = async () => {
    if (isCreatingSession) return null;
    setIsCreatingSession(true);
    setRandomQuote(getRandomQuote());
    // Guest mode - local session
    if (isGuest) {
      const guestSessionId = `guest-${Date.now()}`;
      setSessions((p) => [{ id: guestSessionId, title: "New Chat" }, ...p]);
      setMessagesBySession((p) => ({ ...p, [guestSessionId]: [] }));
      setCurrentSessionId(guestSessionId);
      setIsCreatingSession(false);
      return guestSessionId;
    }

    // Logged in - backend call
    try {
      const res = await fetch(`${API}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "New Chat" }),
      });

      const data = await res.json();
      const sessionId = data.data?.sessionId || data.sessionId;

      setSessions((p) => [{ id: sessionId, title: "New Chat" }, ...p]);
      setMessagesBySession((p) => ({ ...p, [sessionId]: [] }));
      setCurrentSessionId(sessionId);

      setIsCreatingSession(false);
      return sessionId;
    } catch (err) {
      console.error("Create session failed:", err);
      setIsCreatingSession(false);
      return null;
    }
  };

  /* SEND MESSAGE */
  const sendMessage = async () => {
    if (!input.trim()) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewChat();
      if (!sessionId) return;
    }

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessagesBySession((p) => ({
      ...p,
      [sessionId]: [...(p[sessionId] || []), userMsg],
    }));

    // FIRST MESSAGE = TITLE UPDATE
    const currentMessages = messagesBySession[sessionId] || [];
    const isFirstMessage = currentMessages.length === 0;
    
    if (isFirstMessage) {
      const newTitle = input.trim().slice(0, 40) + (input.length > 40 ? "..." : "");
      updateSessionTitle(sessionId, newTitle);
    }

    setInput("");

    const botMsgId = Date.now() + 1;

    setMessagesBySession((p) => ({
      ...p,
      [sessionId]: [
        ...(p[sessionId] || []),
        {
          id: botMsgId,
          sender: "bot",
          text: "",
          thinking: true,
        },
      ],
    }));

    const headers = {
      "Content-Type": "application/json",
    };

    if (!isGuest && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API}/api/chat/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sessionId,
          message: userMsg.text,
        }),
      });

      const result = await res.json();
      const reply = result?.data?.reply || result?.reply;
      
      if (!reply) {
        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: prev[sessionId].filter((msg) => msg.id !== botMsgId),
        }));
        return;
      }

      let index = 0;

      const interval = setInterval(() => {
        index++;

        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: prev[sessionId].map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  text: reply.slice(0, index),
                  thinking: false,
                }
              : msg
          ),
        }));

        if (index >= reply.length) {
          clearInterval(interval);
        }
      }, 25);
    } catch (err) {
      console.error("Send message failed:", err);
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: prev[sessionId].filter((msg) => msg.id !== botMsgId),
      }));
    }
  };

 return (
  <div className="h-screen flex bg-[#222] text-white">
    {/* 🔥 MOBILE SIDEBAR - CONDITIONAL RENDER */}
    {showSidebar && (
      <>
        {/* Backdrop - Click to close */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
        
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-gray-800 z-50 md:hidden">
          <Sidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelect={(id) => {
              handleSelectSession(id);
              setShowSidebar(false); // 🔥 Select karne par close ho jaye
            }}
            onNewChat={() => {
              createNewChat();
              setShowSidebar(false); // 🔥 New chat par close ho jaye
            }}
            onDelete={handleDeleteSession}
          />
        </aside>
      </>
    )}

    {/* 🔥 DESKTOP SIDEBAR - ALWAYS VISIBLE */}
    <aside className="hidden md:block w-64 border-r border-gray-800">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelect={handleSelectSession}
        onNewChat={createNewChat}
        onDelete={handleDeleteSession}
      />
    </aside>

    <div className="flex-1 flex flex-col">
      <ChatHeader
        user={user}
        onNewChat={createNewChat}
        onLogout={handleLogout}
        onMenu={() => setShowSidebar(!showSidebar)} // 🔥 Toggle function
      />

      {messages.length === 0 ? (
  <div className="flex-1 flex items-center justify-center">
    <h1 className="text-3xl md:text-4xl font-light text-gray-300 text-center">
      {randomQuote}
    </h1>
  </div>
) : (
  <MessageList messages={messages} bottomRef={messagesEndRef} />
)}


      <ChatInput input={input} setInput={setInput} onSend={sendMessage} />
    </div>
  </div>

  );
}