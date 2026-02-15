import { useNavigate } from "react-router-dom";

export default function ChatHeader({
  user,
  onNewChat,
  onLogout,
  onMenu,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#0f0f10] border-b border-[#1f1f1f]">
      {/* LEFT - User Name / Guest */}
      <div className="flex items-center gap-3">
        {/* ☰ Mobile sidebar button */}
        <button
          onClick={onMenu}
          className="md:hidden text-xl text-gray-300 hover:text-white transition"
        >
          ☰
        </button>

        <div>
          <div className="text-sm text-gray-400">Astra AI</div>
          <div className="text-base font-semibold text-gray-100">
            {user ? user.name || user.email : "Guest"}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button
          onClick={onNewChat}
          className="hidden sm:inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-[#2a2a2a] bg-[#141414] text-gray-200 hover:bg-[#1d1d1d] transition"
        >
          + New chat
        </button>

        {/* Login / Logout */}
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="text-sm px-4 py-2 cursor-pointer active:scale-95 text-black rounded-full hover:bg-gray-200 bg-white transition"
          >
            Login
          </button>
        ) : (
          <button
            onClick={onLogout}
            className="text-sm px-4 py-2 cursor-pointer active:scale-95 text-black rounded-full hover:bg-gray-200 bg-white transition"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
