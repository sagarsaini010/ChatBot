import React from 'react';

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelect,
  onNewChat,
  onDelete,
}) {
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
        {sessions && sessions.length > 0 ? (
          sessions.map((s,indx) => (
            <div
              key={indx}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                ${s.id === currentSessionId ? "bg-[#1f1f1f]" : "hover:bg-[#1f1f1f]"}`}
              onClick={() => onSelect(s.id)}
            >
              <span className="flex-1 truncate text-sm">{s.title}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                className="hidden group-hover:block text-gray-400 hover:text-red-400"
                aria-label="Delete chat"
              >
                🗑️
              </button>
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