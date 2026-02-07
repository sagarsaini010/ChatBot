import ReactMarkdown from "react-markdown";

export default function MessageList({ messages, bottomRef }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {messages.map((msg) => {
        const isUser = msg.sender === "user";

        return (
          <div
            key={msg.id}
            className={`max-w-3xl mx-auto py-4 text-sm ${
              isUser ? "text-right" : "text-left"
            }`}
            style={
              isUser
                ? { animation: "fadeIn 0.3s ease-out forwards" }
                : {} // ❌ NO animation for bot streaming
            }
          >
            <div
              className={`flex gap-4 ${
                isUser ? "flex-row-reverse items-start" : "items-start"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isUser
                    ? "bg-[#1f2937] text-white"
                    : "bg-[#1b1b1b] text-gray-200 border border-[#2a2a2a]"
                }`}
              >
                {isUser ? "You" : "AI"}
              </div>
              <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {isUser ? "You" : "Assistant"}
                </div>
                <div
                  className={`mt-2 inline-block px-4 py-3 rounded-2xl leading-relaxed ${
                    isUser
                      ? "bg-[#1f2937] text-white"
                      : "bg-[#141414] text-gray-100 border border-[#232323]"
                  }`}
                >
                  {msg.thinking && msg.text === "" ? (
                    <span className="italic text-gray-300">Thinking…</span>
                  ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 🔥 HARD SCROLL ANCHOR */}
      <div ref={bottomRef} />
    </div>
  );
}
