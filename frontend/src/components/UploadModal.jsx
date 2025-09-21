import { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { X, UploadCloud, FileText, Loader2 } from "lucide-react";

// --- Important: Add this line at the top of your App.jsx or main.jsx ---
// Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(15, 23, 42, 0.8)", // bg-slate-900 with opacity
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "1rem",
    width: "90%",
    maxWidth: "500px",
    padding: "2rem",
    backdropFilter: "blur(10px)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
};

export default function UploadModal({
  isOpen,
  onRequestClose,
  onUploadSuccess,
}) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      onUploadSuccess(); // Notify parent component (Dashboard) that upload was successful
      onRequestClose(); // Close the modal
    } catch (err) {
      setError(
        "Upload failed. The file might be too large or the server is busy."
      );
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Upload Contract Modal"
    >
      <div className="text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upload New Contract</h2>
          <button
            onClick={onRequestClose}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="border-2 border-dashed border-slate-500 rounded-lg p-10 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <UploadCloud size={48} />
            <p className="font-semibold">
              Drag & drop a file here, or click to select
            </p>
            <p className="text-xs">Supports: PDF, DOC, DOCX, TXT</p>
          </div>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-indigo-400" />
              <span className="font-mono text-sm">{file.name}</span>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-1 rounded-full hover:bg-red-500/20 text-red-400"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}

        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full py-3 rounded-lg bg-indigo-600 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Upload & Process"
            )}
            {isUploading && "Uploading..."}
          </button>
        </div>
      </div>
    </Modal>
  );
}
