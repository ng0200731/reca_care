"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Customer = {
  id: number;
  customerId: string;
  companyName: string;
};

type TranslationData = {
  headers: string[];
  rows: string[][];
};

export default function TranslationCreate() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [translationData, setTranslationData] = useState<TranslationData | null>(null);
  const [tableName, setTableName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCustomers(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const area = uploadAreaRef.current;
    if (!area) return;

    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => area.classList.add("dragover");
    const unhighlight = () => area.classList.remove("dragover");

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      document.body.addEventListener(eventName, preventDefaults, false);
    });
    ["dragenter", "dragover"].forEach((eventName) => {
      area.addEventListener(eventName, highlight, false);
    });
    ["dragleave", "drop"].forEach((eventName) => {
      area.addEventListener(eventName, unhighlight, false);
    });
    area.addEventListener("drop", handleDrop, false);

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        document.body.removeEventListener(eventName, preventDefaults, false);
      });
    };
  }, []);

  const handleDrop = (e: DragEvent) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleExcelFile(files[0]);
    }
  };

  const handleExcelFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setMessage("Only .xlsx and .xls files are allowed");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/translations/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        setTranslationData(result.data);
        setTableName(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        setMessage(result.error || "Failed to parse Excel file");
      }
    } catch {
      setMessage("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const saveTable = async () => {
    if (!tableName.trim()) {
      setMessage("Please enter a table name");
      return;
    }
    if (!translationData) {
      setMessage("Upload an Excel file first");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_name: tableName,
          customer_id: customerId || null,
          data: translationData,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage("Translation table saved successfully");
        setTranslationData(null);
        setTableName("");
        setCustomerId("");
        setShowSaveModal(false);
      } else {
        setMessage(result.error || "Failed to save");
      }
    } catch {
      setMessage("Error saving translation table");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Create Translation Table</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-[var(--destructive)] border border-red-200"}`}>
            {message}
          </div>
        )}

        <div
          ref={uploadAreaRef}
          className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:border-[var(--primary)]/40 transition-colors"
        >
          <p className="text-sm text-[var(--foreground)]/60 mb-3">Drag .xlsx file here</p>
          <p className="text-sm text-[var(--foreground)]/60 mb-3">or</p>
          <label className="inline-block px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors cursor-pointer">
            Choose File
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleExcelFile(e.target.files[0])}
            />
          </label>
          {uploading && <p className="mt-3 text-sm text-[var(--foreground)]/60">Uploading...</p>}
        </div>

        {translationData && (
          <>
            <div className="mt-6 overflow-x-auto border border-[var(--border)] rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-[var(--muted)] text-[var(--foreground)]/70">
                  <tr>
                    {translationData.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {translationData.rows.map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, cidx) => (
                        <td key={cidx} className="px-3 py-2 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 transition-all cursor-pointer"
              >
                Save Translation Table
              </button>
            </div>
          </>
        )}
      </div>

      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowSaveModal(false)}
        >
          <div className="bg-white rounded-xl shadow-[var(--shadow-xl)] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Save Translation Table</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-[var(--foreground)]/50 hover:text-[var(--foreground)] text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Table Name</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Enter table name"
                  className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                >
                  <option value="">Public</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.customerId}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)]/70 rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveTable}
                disabled={saving}
                className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
