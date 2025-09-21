import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle } from "lucide-react";

export default function AllContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found.");
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
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const renderTableContent = () => {
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
          <td colSpan="5" className="text-center py-10 text-red-400">
            {error}
          </td>
        </tr>
      );
    if (contracts.length === 0)
      return (
        <tr>
          <td colSpan="5" className="text-center py-10">
            No contracts found.
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
      <h1 className="text-3xl font-bold">All Uploaded Contracts</h1>
      <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10">
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
    </div>
  );
}
