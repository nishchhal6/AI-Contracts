import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import axios from "axios";

export default function SignupPage() {
  // State for all form fields and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Function to handle the signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- Client-side validation ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Prepare the data in the correct format for the backend
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    try {
      // Send the request to the /signup endpoint
      await axios.post("https://ai-contracts-backend.onrender.com/signup", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // On success, show a message and then redirect to login
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Wait 2 seconds before redirecting
    } catch (err) {
      // Handle errors from the backend (e.g., username already exists)
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Signup failed:", err);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4 bg-slate-900">
      {/* Animated Background Blobs (same as login) */}
      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000 top-0 right-20"></div>
      <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000 bottom-0 left-10"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Join us and start analyzing your contracts
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              required
              className="peer w-full pl-4 pr-4 py-3 border-2 border-transparent bg-white/10 rounded-lg placeholder-transparent text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-400"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="absolute left-4 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-indigo-300 peer-focus:text-sm">
              Email address
            </label>
            <Mail className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 peer-focus:text-indigo-300" />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              required
              className="peer w-full pl-4 pr-4 py-3 border-2 border-transparent bg-white/10 rounded-lg placeholder-transparent text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="absolute left-4 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-indigo-300 peer-focus:text-sm">
              Password
            </label>
            <Lock className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 peer-focus:text-indigo-300" />
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input
              type="password"
              required
              className="peer w-full pl-4 pr-4 py-3 border-2 border-transparent bg-white/10 rounded-lg placeholder-transparent text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-400"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label className="absolute left-4 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-indigo-300 peer-focus:text-sm">
              Confirm Password
            </label>
            <Lock className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 peer-focus:text-indigo-300" />
          </div>

          {/* Error and Success Messages */}
          {error && (
            <p className="text-center text-sm text-red-400 bg-red-500/10 p-2 rounded-md">
              {error}
            </p>
          )}
          {success && (
            <p className="text-center text-sm text-green-400 bg-green-500/10 p-2 rounded-md">
              {success}
            </p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="group w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Create Account
            </button>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}
      </style>
    </div>
  );
}
