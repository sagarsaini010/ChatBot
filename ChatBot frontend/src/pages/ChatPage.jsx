import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";
import { api } from "../utils/api";

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




  const [sessions, setSessions] = useState([]);
  
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const [messagesBySession, setMessagesBySession] = useState({});
  
  const [input, setInput] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
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

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const result = await api.getSessions();
      if (!result.success) {
        setSessions([]);
        return;
      }
      const normalized = (result.data || []).map((session) => ({
        id: session._id,
        title: session.title,
        lastMessageAt: session.lastMessageAt,
      }));
      setSessions(normalized);
      if (normalized.length > 0 && !currentSessionId) {
        setCurrentSessionId(normalized[0].id);
      } else if (normalized.length === 0) {
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId) => {
    if (!sessionId) return;
    setIsLoadingMessages(true);
    try {
      const result = await api.getSessionMessages(sessionId);
      if (!result.success) {
        return;
      }
      const normalized = (result.data || []).map((message) => ({
        id: message._id,
        sender: message.role === "model" ? "bot" : "user",
        text: message.content,
      }));
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: normalized,
      }));
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    if (!currentSessionId) return;
    if (messagesBySession[currentSessionId]) return;
    loadMessages(currentSessionId);
  }, [currentSessionId, messagesBySession]);

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
  const handleDeleteSession = async (sessionId) => {
    try {
      const result = await api.deleteSession(sessionId);
      if (!result.success) return;
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setMessagesBySession((prev) => {
        const updated = { ...prev };
        delete updated[sessionId];
        return updated;
      });

      if (sessionId === currentSessionId) {
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error("Delete session failed:", error);
    }
  };

  /* CREATE NEW CHAT */
  const createNewChat = async () => {
    if (isCreatingSession) return null;
    setIsCreatingSession(true);
    setRandomQuote(getRandomQuote());
    try {
      const data = await api.createSession();
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

    try {
      const result = await api.sendMessage({
        sessionId,
        message: userMsg.text,
      });
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
            isLoading={isLoadingSessions}
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
        isLoading={isLoadingSessions}
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
      {isLoadingMessages ? "Loading chat..." : randomQuote}
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
