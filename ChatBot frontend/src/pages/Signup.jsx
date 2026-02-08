import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 🟢 SIGNUP + AUTO LOGIN
  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await api.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.success) {
        setError(result.error || "Signup failed");
        return;
      }

      // ✅ AUTO LOGIN
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // guest cleanup
      localStorage.removeItem("guestId");

      // 🔥 direct chat page
      navigate("/");
    } catch (err) {
      setError("Server error: "+ err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3333]">
     

      <div className="bg-[#222] absolute p-8 rounded-xl w-96">

         <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 text-gray-500 hover:text-white     text-xl"
        title="Close"
      >
        ✕
      </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSignup();
          }}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Signup"}
        </button>

        {/* Optional: keep link or remove */}
        <p className="text-sm mt-4 text-center text-white">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
