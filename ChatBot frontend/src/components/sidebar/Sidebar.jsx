import React, { useState } from 'react';

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelect,
  onNewChat,
  onDelete,
  isLoading, // 🔥 NEW PROP
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (e, sessionId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === sessionId ? null : sessionId);
  };

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(sessionId);
    }
    
    setOpenMenuId(null);
  };

  return (
    <div className="flex flex-col h-full p-4 bg-[#111]">
      <button
        onClick={onNewChat}
        className="mb-4 border border-gray-700 rounded-lg px-3 py-2 text-sm hover:bg-[#1f1f1f]"
      >
        + New Chat
      </button>

      <div className="text-xs text-gray-400 mb-2">Chats</div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {/* 🔥 LOADING STATE */}
        {isLoading ? (
          <div className="text-xs text-gray-500 text-center py-4">
            Loading chats...
          </div>
        ) : sessions && sessions.length > 0 ? (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                ${s.id === currentSessionId ? "bg-[#1f1f1f]" : "hover:bg-[#1f1f1f]"}`}
              onClick={() => onSelect(s.id)}
            >
              <span className="flex-1 truncate text-sm">{s.title}</span>

              <button
                onClick={(e) => toggleMenu(e, s.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white text-lg transition-opacity"
                aria-label="Options"
              >
                ⋮
              </button>

              {openMenuId === s.id && (
                <div className="absolute right-2 top-10 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#1f1f1f] flex items-center gap-2"
                  >
                     Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500 text-center py-4">
            No chats yet
          </div>
        )}
      </div>
    </div>
  );
}