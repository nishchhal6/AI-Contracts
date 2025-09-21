import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, FileText } from "lucide-react";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation(); // React Router se current URL path pata karta hai

  // Logout button click karne par token remove karke login page par bhej deta hai
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Yeh function check karta hai ki kya diya gaya path current page ka path hai
  const isActive = (path) => location.pathname === path;

  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-white flex">
      {/* Background Animation (Blobs) */}
      <div className="absolute w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 right-40"></div>
      <div className="absolute w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-20 left-10"></div>

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black/30 backdrop-blur-xl p-6 flex flex-col justify-between border-r border-white/10 flex-shrink-0">
        <div>
          {/* App Logo/Title */}
          <h1 className="text-2xl font-bold text-white mb-10">ContractAI</h1>

          {/* Navigation Links */}
          <nav className="space-y-4">
            <Link
              to="/"
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-indigo-600/50 text-white font-semibold"
                  : "hover:bg-white/10 text-slate-300"
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link
              to="/contracts"
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive("/contracts")
                  ? "bg-indigo-600/50 text-white font-semibold"
                  : "hover:bg-white/10 text-slate-300"
              }`}
            >
              <FileText size={20} />
              All Contracts
            </Link>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Yahaan aapke page ka content (e.g., DashboardPage) display hoga */}
        {children}
      </main>
    </div>
  );
}
