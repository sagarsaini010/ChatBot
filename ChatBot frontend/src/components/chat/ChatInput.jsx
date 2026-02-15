export default function ChatInput({ input, setInput, onSend }) {
  const handleSend = () => {
    if (onSend) {
      onSend();
    }
  };

  return (
    <div className="border-t border-[#1f1f1f] bg-[#0f0f10]">
      <div className="max-w-3xl mx-auto px-4 py-5">
        <div className="flex items-end gap-3 bg-[#151515] border border-[#252525] rounded-3xl px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message ChatBot...."
            rows={1}
            className="flex items-center justify-center py-2 resize-none outline-none text-sm text-gray-100 placeholder:text-gray-500 bg-transparent w-full"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send, Shift + Enter for a new line.
        </div>
      </div>
    </div>
  );
}
