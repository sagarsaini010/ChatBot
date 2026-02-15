import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";
import { api } from "../utils/api";
import { streamText } from "../utils/streamText";

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

  const quickPrompts = [
    "Draft a friendly email to a client about project updates.",
    "Summarize the key points from a long article for me.",
    "Help me brainstorm ideas for a new side project.",
    "Explain a complex topic in simple terms.",
  ];



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
 const createNewChat = async (initialTitle = "New Chat") => {
  if (isCreatingSession) return null;
  
  // Safety check: Agar initialTitle event object hai toh default set karein
  const finalTitle = (typeof initialTitle === "string") ? initialTitle : "New Chat";

  setIsCreatingSession(true);
  setRandomQuote(getRandomQuote());
  try {
    // API call mein title bhej rahe hain
    const data = await api.createSession(finalTitle); 
    const sessionId = data.data?.sessionId || data.sessionId;

    // Sidebar list mein turant naya session dikhayein
    setSessions((p) => [{ id: sessionId, title: finalTitle }, ...p]);
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

const generateTitleFromMessage = (text) =>
  text.slice(0, 40) + (text.length > 40 ? "..." : "");

// send messgae
 const sendMessage = async () => {
  if (!input.trim() || isLoadingMessages) return;

  const currentSessionTitle =
    sessions.find((s) => s.id === currentSessionId)?.title; // ✅ Fixed: s.id instead of s._id

  const userText = input.trim();
  setIsLoadingMessages(true);
  setInput("");

  let sessionId = currentSessionId;
  let shouldUpdateTitle = false;

  // 🟢 CASE 1: new chat (no session)
  if (!sessionId) {
    const firstMsgTitle = generateTitleFromMessage(userText);
    sessionId = await createNewChat(firstMsgTitle);

    if (!sessionId) {
      setIsLoadingMessages(false);
      return;
    }
  }
  // 🟡 CASE 2: old chat but title still "New Chat"
  else if (currentSessionTitle === "New Chat") { // ✅ Fixed: removed "vv"
    shouldUpdateTitle = true;
  }

  const userMsg = { id: Date.now(), sender: "user", text: userText };
  const botMsgId = Date.now() + 1;

  setMessagesBySession((p) => ({
    ...p,
    [sessionId]: [
      ...(p[sessionId] || []),
      userMsg,
      { id: botMsgId, sender: "bot", text: "", thinking: true },
    ],
  }));

  try {
    const result = await api.sendMessage({
      sessionId,
      message: userText,
    });

    // 🔥 YAHAN title update hota hai
    if (shouldUpdateTitle) {
      try { // ✅ Added error handling
        await api.updateTitle({
          sessionId,
          message: generateTitleFromMessage(userText),
        });
        loadSessions(); // sidebar refresh
      } catch (error) {
        console.error("Title update failed:", error);
      }
    }

    const reply = result?.data?.reply || result?.reply;

    if (!reply) {
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: prev[sessionId].filter((msg) => msg.id !== botMsgId),
      }));
      setIsLoadingMessages(false);
      return;
    }

    streamText(
      reply,
      (updatedText) => {
        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: prev[sessionId].map((msg) =>
            msg.id === botMsgId
              ? { ...msg, text: updatedText, thinking: false }
              : msg
          ),
        }));
      },
      () => setIsLoadingMessages(false)
    );
  } catch (err) {
    console.error("Send message failed:", err);
    setIsLoadingMessages(false);
  }
};


 return (
  <div className="h-screen flex bg-[#0f0f10] text-gray-100">
    {/* 🔥 MOBILE SIDEBAR - CONDITIONAL RENDER */}
    {showSidebar && (
      <>
        {/* Backdrop - Click to close */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
        
        {/* Sidebar */}
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0b0b0c] border-r border-[#1f1f1f] z-50 md:hidden">
          <Sidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelect={(id) => {
              handleSelectSession(id);
              setShowSidebar(false); // 🔥 Select karne par close ho jaye
            }}
            onNewChat={() => {
              createNewChat("New Chat");
              setShowSidebar(false); // 🔥 New chat par close ho jaye
            }}
            onDelete={handleDeleteSession}
            isLoading={isLoadingSessions}
          />
        </aside>
      </>
    )}

    {/* 🔥 DESKTOP SIDEBAR - ALWAYS VISIBLE */}
    <aside className="hidden md:block w-72 border-r border-[#1f1f1f] bg-[#0b0b0c]">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelect={handleSelectSession}
        onNewChat={()=>createNewChat("New Chat")}
        onDelete={handleDeleteSession}
        isLoading={isLoadingSessions}
      />
    </aside>

    <div className="flex-1 flex flex-col bg-linear-to-b from-[#0f0f10] via-[#121212] to-[#0b0b0b]">
      <ChatHeader
        user={user}
        onNewChat={()=>createNewChat("New Chat")}
        onLogout={handleLogout}
        onMenu={() => setShowSidebar(!showSidebar)} // 🔥 Toggle function
      />

      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 pt-14 pb-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#171717] border border-[#262626] text-xl">
              ✨
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-semibold text-white">
              How can I help you today?
            </h1>
            <p className="mt-3 text-gray-400">
              {isLoadingMessages ? "Loading chat..." : randomQuote}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 text-left">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="p-4 rounded-2xl bg-[#141414] border border-[#232323] text-sm text-gray-200 hover:bg-[#1b1b1b] transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
) : (
  <MessageList messages={messages} bottomRef={messagesEndRef} />
)}


      <ChatInput input={input} setInput={setInput} onSend={sendMessage} />
    </div>
  </div>

  );
}
