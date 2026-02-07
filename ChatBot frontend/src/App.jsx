import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import ChatPage from "./pages/ChatPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <BrowserRouter> 
      <Routes>
        {/* ✅ Guest chat allowed */}
        <Route path="/" element={<ChatPage/>} />

        {/* 🔐 Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
