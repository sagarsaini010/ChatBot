export default function ChatInput({ input, setInput, onSend }) {
  const handleSend = () => {
    console.log('Send clicked, input:', input);
    console.log('onSend function:', onSend);
    if (onSend) {
      onSend();
    } else {
      console.error('onSend is not defined!');
    }
  };

  return (
    <div className="border-t border-gray-800 bg-[#222]">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 bg-[#2f2f2f] rounded-full px-4 py-2">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything"
            className="flex-1 bg-transparent outline-none text-white"
          />

          <button
            onClick={handleSend}
            className="bg-white text-black rounded-full px-4 py-2 hover:bg-gray-200"
          >
            Send
          </button>

        </div>
      </div>
    </div>
  );
}