import ReactMarkdown from "react-markdown";

export default function MessageList({ messages, bottomRef }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-3xl mx-auto text-sm ${
            msg.sender === "user"
              ? "text-right"
              : "text-left"
          }`}
        >
         <div
  className={`inline-block px-4 py-3 rounded-2xl leading-relaxed ${
    msg.sender === "user"
      ? "bg-[#2f2f2f]"
      : "bg-[#3a3a3a]"
  }`}
>

            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
