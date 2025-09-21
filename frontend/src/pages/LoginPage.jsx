import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
  // State to hold the form data (email and password)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hook to navigate programmatically
  const navigate = useNavigate();

  // Function to handle form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(""); // Clear any previous errors

    // The backend's /token endpoint expects "x-www-form-urlencoded" data.
    // We create a URLSearchParams object to format the data correctly.
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    try {
      // Send a POST request to the backend's login endpoint
      const response = await axios.post("http://127.0.0.1:8000/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // If the login is successful, the backend sends back an access token
      const { access_token } = response.data;

      // Store the token in the browser's local storage for future use
      localStorage.setItem("token", access_token);

      // Redirect the user to the main dashboard page
      navigate("/");
    } catch (err) {
      // If there's an error (e.g., incorrect password), display an error message
      setError("Invalid email or password. Please try again.");
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4 bg-slate-900">
      {/* Animated Background Blobs */}
      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000 top-0 right-20"></div>
      <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000 bottom-0 left-10"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Login to access your dashboard
          </p>
        </div>

        {/* Form with onSubmit handler */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {/* Email Input with onChange handler */}
          <div className="relative">
            <input
              id="email-address"
              name="email"
              type="email"
              required
              className="peer w-full pl-4 pr-4 py-3 border-2 border-transparent bg-white/10 rounded-lg placeholder-transparent text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label
              htmlFor="email-address"
              className="absolute left-4 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-indigo-300 peer-focus:text-sm"
            >
              Email address
            </label>
            <Mail className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 peer-focus:text-indigo-300" />
          </div>

          {/* Password Input with onChange handler */}
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="peer w-full pl-4 pr-4 py-3 border-2 border-transparent bg-white/10 rounded-lg placeholder-transparent text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              htmlFor="password"
              className="absolute left-4 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-indigo-300 peer-focus:text-sm"
            >
              Password
            </label>
            <Lock className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 peer-focus:text-indigo-300" />
          </div>

          {/* Display error message if login fails */}
          {error && (
            <p className="text-center text-sm text-red-400 bg-red-500/10 p-2 rounded-md">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="group w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-white 
                         bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Sign In
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Keyframes for blob animation */}
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
