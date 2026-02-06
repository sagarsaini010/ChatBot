import { useNavigate } from "react-router-dom";

export default function ChatHeader({
  user,
  onNewChat,
  onLogout,
  onMenu,        // 👈 sidebar toggle (mobile)
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between
      px-6 py-3 bg-[#1f1f1f] border-b border-gray-800"
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* ☰ Mobile sidebar button */}
        <button
          onClick={onMenu}
          className="md:hidden text-xl text-gray-300 hover:text-white"
        >
          ☰
        </button>

        {/* New chat */}
        <button
          onClick={onNewChat}
          className="text-sm text-gray-300 hover:text-white"
        >
          + New Chat
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {!user && (
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-300 hover:text-white"
          >
            Login
          </button>
        )}

        {user && (
          <button
            onClick={onLogout}
            className="text-sm text-gray-300 hover:text-white"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
