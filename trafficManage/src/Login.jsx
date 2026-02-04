import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email and password are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);

        if (rememberMe) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("name", data.user.name);
        } else {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("name", data.user.name);
        }

        navigate("/");
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsSuccess(false);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <div className="flex space-x-3">
          <div className="w-12 h-12 bg-red-600 rounded-full animate-bounce"></div>
          <div className="w-12 h-12 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
          <div className="w-12 h-12 bg-green-500 rounded-full animate-bounce delay-300"></div>
        </div>
        <span className="text-gray-700 text-xl font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex">
        {/* Left Panel */}
        <div className="flex-1 bg-[#131827] p-12">
          <div className="max-w-sm mx-auto">
            <div className="mb-12 text-white text-2xl font-semibold">
              TRAFFIC MANAGEMENT SYSTEM
            </div>

            <h1 className="text-white text-xl mb-8">LOGIN</h1>

            <div className="mb-6">
              <label className="text-white text-sm block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:outline-none focus:border-white"
              />
            </div>

            <div className="mb-6">
              <label className="text-white text-sm block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <span className="text-white text-sm">Remember me</span>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-green-700 text-white py-2.5 rounded font-semibold mb-4"
            >
              LOGIN
            </button>

            {message && (
              <div
                className={`text-sm ${
                  isSuccess ? "text-green-400" : "text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <div className="text-center mt-6">
              <span className="text-gray-400 text-sm">
                Don't have an account?{" "}
              </span>
              <button
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => navigate("/Signup")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div
          className="flex-1 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/map.png')" }}
        ></div>
      </div>
    </div>
  );
}
