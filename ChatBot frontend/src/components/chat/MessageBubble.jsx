import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message, isTyping }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } px-3`}
    >
      <div
        className={`px-4 py-3 rounded-2xl text-sm shadow whitespace-pre-wrap
          ${
            isUser
              ? "bg-green-500 text-white rounded-br-none"
              : "bg-[#383737] text-white rounded-bl-none"
          }
          max-w-[85%] sm:max-w-[75%] md:max-w-[65%]
        `}
      >
        <ReactMarkdown>{message.text}</ReactMarkdown>
        {isTyping && !isUser && <span className="animate-pulse ml-1">▍</span>}
      </div>
    </div>
  );
}
