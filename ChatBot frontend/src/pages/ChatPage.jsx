import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";

const API = "http://localhost:5000";

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messagesBySession, setMessagesBySession] = useState({});
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const bottomRef = useRef(null);
  const messages = messagesBySession[currentSessionId] || [];

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* CREATE NEW CHAT (POST /api/sessions) */
  /* CREATE NEW CHAT (POST /api/sessions) */
const createNewChat = async () => {
  if (isCreatingSession) return; // Prevent duplicate calls
  
  try {
    setIsCreatingSession(true);
    const res = await fetch(`${API}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "New Chat"
      })
    });
    
    const data = await res.json();
    
    // ✅ data.data.sessionId (nested object)
    const sessionId = data.data?.sessionId || data.sessionId;
    
    if (!sessionId) {
      console.error("No sessionId in response:", data);
      return null;
    }
    
    const session = {
      id: sessionId,
      title: data.data?.title || data.title || "New Chat",
    };
    
    setSessions((prev) => [session, ...prev]);
    setMessagesBySession((prev) => ({
      ...prev,
      [session.id]: [],
    }));
    setCurrentSessionId(session.id);
    setSidebarOpen(false);
    
    return session.id; // Return the new session ID
  } catch (err) {
    console.error("Create session error:", err);
    return null;
  } finally {
    setIsCreatingSession(false);
  }
};

  /* SELECT SESSION → LOAD MESSAGES */
  const selectSession = async (sessionId) => {
    try {
      setCurrentSessionId(sessionId);

      const res = await fetch(
        `${API}/api/sessions/${sessionId}/messages`
      );
      const msgs = await res.json();

      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: msgs,
      }));
    } catch (err) {
      console.error("Load messages error:", err);
    }
  };

  /* SEND MESSAGE (POST /api/chat/send) */
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Agar session nahi hai, to pehle create karo
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewChat();
      if (!sessionId) {
        console.error("Failed to create session");
        return;
      }
    }

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    // Optimistic UI update
    setMessagesBySession((prev) => ({
      ...prev,
      [sessionId]: [
        ...(prev[sessionId] || []),
        userMsg,
      ],
    }));

    setInput("");

    try {
      const res = await fetch(`${API}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          message: userMsg.text,
        }),
      });

      const result = await res.json();

      if (result?.data?.reply) {
        setMessagesBySession((prev) => ({
          ...prev,
          [sessionId]: [
            ...(prev[sessionId] || []),
            {
              id: Date.now(),
              sender: "bot",
              text: result.data.reply,
            },
          ],
        }));
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* DELETE SESSION */
  const deleteSession = async (sessionId) => {
    try {
      await fetch(`${API}/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      setSessions((prev) =>
        prev.filter((s) => s.id !== sessionId)
      );

      setMessagesBySession((prev) => {
        const copy = { ...prev };
        delete copy[sessionId];
        return copy;
      });

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
    } catch (err) {
      console.error("Delete session error:", err);
    }
  };

  /* INIT FIRST CHAT - page load pe ek default chat banao */
  useEffect(() => {
    if (sessions.length === 0 && !isCreatingSession) {
      createNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex bg-[#222] text-white">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 border-r border-gray-800">
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelect={selectSession}
          onNewChat={createNewChat}
          onDelete={deleteSession}
        />
      </aside>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden">
          <aside className="w-64 h-full bg-[#111]">
            <Sidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelect={(id) => {
                selectSession(id);
                setSidebarOpen(false);
              }}
              onNewChat={createNewChat}
              onDelete={deleteSession}
            />
          </aside>
        </div>
      )}

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col">
        <ChatHeader
          user={null}
          onNewChat={createNewChat}
          onLogout={() => {}}
          onMenu={() => setSidebarOpen(true)}
        />

        <MessageList
          messages={messages}
          bottomRef={bottomRef}
        />

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}