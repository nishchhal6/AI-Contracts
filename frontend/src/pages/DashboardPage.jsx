import { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  AlertCircle,
  Upload,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import UploadModal from "../components/UploadModal";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function DashboardPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- New State for AI Query ---
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState("");

  // --- Fetches contracts (unchanged) ---
  const fetchContracts = async () => {
    // ... (This function remains the same)
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("https://ai-contracts-backend.onrender.com/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(response.data);
    } catch (err) {
      setError("Failed to fetch contracts.");
      console.error("Fetch contracts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // --- New Function to Handle AI Query ---
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setQueryError("Please enter a question.");
      return;
    }
    setIsQuerying(true);
    setQueryError("");
    setQueryResult(null);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/ask",
        { question: query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQueryResult(response.data);
    } catch (err) {
      setQueryError("Failed to get answer. Please try again.");
      console.error("Query error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleUploadSuccess = () => fetchContracts();
  const renderTableContent = () => {
    /* ... (This function is unchanged) ... */
    if (loading)
      return (
        <tr>
          <td colSpan="5" className="text-center py-10">
            <p className="animate-pulse">Loading contracts...</p>
          </td>
        </tr>
      );
    if (error)
      return (
        <tr>
          <td colSpan="5" className="text-center py-10">
            <div className="flex justify-center items-center gap-2 text-red-400">
              <AlertCircle />
              <p>{error}</p>
            </div>
          </td>
        </tr>
      );
    if (contracts.length === 0)
      return (
        <tr>
          <td colSpan="5" className="text-center py-10">
            <p>No contracts found. Upload your first contract.</p>
          </td>
        </tr>
      );
    return contracts.map((contract) => (
      <tr
        key={contract.doc_id}
        className="border-b border-slate-700 hover:bg-slate-800/50"
      >
        <td className="p-4">{contract.filename}</td>
        <td className="p-4">
          {new Date(contract.uploaded_on).toLocaleDateString()}
        </td>
        <td className="p-4">{contract.parties}</td>
        <td className="p-4">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              contract.risk_score === "Low"
                ? "bg-green-500/20 text-green-300"
                : contract.risk_score === "Medium"
                ? "bg-yellow-500/20 text-yellow-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {contract.risk_score}
          </span>
        </td>
        <td className="p-4">
          {new Date(contract.expiry_date).toLocaleDateString()}
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-105"
        >
          <PlusCircle size={20} />
          Upload Contract
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10">
        {/* ... (table structure is unchanged) ... */}
        <table className="w-full text-left">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="p-4">Filename</th>
              <th className="p-4">Uploaded On</th>
              <th className="p-4">Parties</th>
              <th className="p-4">Risk Score</th>
              <th className="p-4">Expiry Date</th>
            </tr>
          </thead>
          <tbody>{renderTableContent()}</tbody>
        </table>
      </div>

      {/* --- New AI Query Section --- */}
      <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-indigo-400" />
          <h2 className="text-2xl font-bold">Ask AI Assistant</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Ask any question about your uploaded documents, like "What are the
          termination clauses?"
        </p>

        <form onSubmit={handleQuerySubmit} className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="flex-grow bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isQuerying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            {isQuerying ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
            {isQuerying ? "Searching..." : "Ask"}
          </button>
        </form>

        {queryError && (
          <p className="text-red-400 text-sm mt-4">{queryError}</p>
        )}

        {/* --- Display Query Results --- */}
        {queryResult && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">
              {queryResult.ai_answer}
            </h3>
            <div className="space-y-4">
              {queryResult.results.map((result, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"
                >
                  <p className="text-slate-300">"{result.text_chunk}"</p>
                  <div className="text-xs text-indigo-400 font-mono mt-2">
                    Similarity Score: {result.similarity.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
