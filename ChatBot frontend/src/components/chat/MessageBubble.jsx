import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message, isTyping }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-3`}>
      <div
        className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-[#1f2937] text-white"
            : "bg-[#141414] text-gray-100 border border-[#232323]"
        } max-w-[85%] sm:max-w-[75%] md:max-w-[65%]`}
      >
        <ReactMarkdown>{message.text}</ReactMarkdown>
        {isTyping && !isUser && <span className="animate-pulse ml-1">▍</span>}
      </div>
    </div>
  );
}
