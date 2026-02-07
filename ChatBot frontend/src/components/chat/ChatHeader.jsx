import { useNavigate } from "react-router-dom";

export default function ChatHeader({
  user,
  onNewChat,
  onLogout,
  onMenu,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between
      px-6 py-3 bg-[#1f1f1f] border-b border-gray-800"
    >
      {/* LEFT - User Name / Guest */}
      <div className="flex items-center gap-3">
        {/* ☰ Mobile sidebar button */}
        <button
          onClick={onMenu}
          className="md:hidden text-xl text-gray-300 hover:text-white"
        >
          ☰
        </button>

        {/* 🔥 USER NAME / GUEST */}
        <div className="text-lg  font-bold text-gray-300">
          {user ? user.name || user.email : "Guest"}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* New Chat Button */}
        {/* <button
          onClick={onNewChat}
          className="text-sm text-gray-300 hover:text-white"
        >
          + New Chat
        </button> */}

        {/* Login / Logout */}
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="text-sm px-2 py-1 cursor-pointer active:scale-95 text-black rounded-2xl hover:text-[tomato] bg-white "
          >
            Login
          </button>
        ) : (
          <button
            onClick={onLogout}
            className="text-sm px-2 py-1 cursor-pointer active:scale-95 text-black rounded-2xl hover:text-[tomato] bg-white"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
