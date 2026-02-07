import ReactMarkdown from "react-markdown";

export default function MessageList({ messages, bottomRef }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
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
        const isBotStreaming = msg.sender === "bot" && msg.text !== "";

        return (
          <div
            key={msg.id}
            className={`max-w-3xl mx-auto text-sm ${
              isUser ? "text-right" : "text-left"
            }`}
            style={
              isUser
                ? { animation: "fadeIn 0.3s ease-out forwards" }
                : {} // ❌ NO animation for bot streaming
            }
          >
            <div
              className={`inline-block px-4 py-3 rounded-2xl leading-relaxed ${
                isUser ? "bg-[#2f2f2f]" : "bg-[#3a3a3a]"
              }`}
            >
              {msg.thinking && msg.text === "" ? (
                <span className="italic text-gray-300">Thinking…</span>
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          </div>
        );
      })}

      {/* 🔥 HARD SCROLL ANCHOR */}
      <div ref={bottomRef} />
    </div>
  );
}
