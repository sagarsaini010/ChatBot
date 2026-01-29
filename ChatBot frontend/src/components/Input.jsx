import { Plus, ArrowUp } from "lucide-react";
import { useState } from "react";

export default function Input() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

const handleSend = async () => {
  if (!message.trim()) return;

  const currentMessage = message; // backup
  setMessage(""); // ✅ input turant empty
  setMessages((prev) => [...prev, currentMessage]);
  setLoading(true);

  try {
    await fetch("http://localhost:5000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: currentMessage }),
    });
  } catch (error) {
    console.error("Error sending message", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="h-screen w-screen bg-[#0f0f0f] flex flex-col text-white">

      {/* Messages (only this scrolls) */}
      <div className="flex justify-end w-full overflow-y-auto">
        <div className="w-full max-w-3xl flex justify-end flex-col items-end px-4 py-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className=" rounded-xl px-4 py-3 mb-3 max-w-[80%]"
            >
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Input fixed at bottom */}
      <div className="border-t absolute bottom-0 w-full border-[#2a2a2a] bg-[#0f0f0f] py-4">
        <div className="flex justify-center px-4">
          <div className="flex items-center w-full max-w-3xl bg-[#2f2f2f] rounded-full px-4 py-3 shadow-md">

            <button className="text-gray-400 hover:text-white mr-3">
              <Plus size={20} />
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything"
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="text-gray-400 hover:text-white ml-3"
            >
              <ArrowUp size={20} />
            </button>

          </div>
        </div>
      </div>

    </div>
  );
}
