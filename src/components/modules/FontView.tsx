"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Customer = {
  id: number;
  customerId: string;
  companyName: string;
};

type Font = {
  id: number;
  font_name: string;
  filename: string;
  file_path: string;
  customer_id: string | null;
  customer_name: string | null;
  created_at: string;
};

const previewText = "AaBbCc 0123";

export default function FontView() {
  const [allFonts, setAllFonts] = useState<Font[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchFont, setSearchFont] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewingFont, setViewingFont] = useState<Font | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const loadedFontsRef = useRef<Set<number>>(new Set());

  const fetchFonts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fonts");
      const result = await res.json();
      if (result.success) {
        setAllFonts(result.fonts);
      } else {
        setError(result.error || "Failed to load fonts");
      }
    } catch {
      setError("Failed to load fonts");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchFonts();
    fetchCustomers();
  }, [fetchFonts, fetchCustomers]);

  useEffect(() => {
    allFonts.forEach((font) => {
      if (loadedFontsRef.current.has(font.id)) return;
      loadedFontsRef.current.add(font.id);
      const fontFace = new FontFace(font.font_name, `url(/api/fonts/file/${font.id})`);
      fontFace
        .load()
        .then((loaded) => {
          document.fonts.add(loaded);
          const cell = document.getElementById(`font-preview-${font.id}`);
          if (cell) {
            cell.style.fontFamily = `'${font.font_name}', sans-serif`;
            cell.textContent = previewText;
          }
        })
        .catch(() => {
          const cell = document.getElementById(`font-preview-${font.id}`);
          if (cell) cell.textContent = "Preview unavailable";
        });
    });
  }, [allFonts]);

  const filteredFonts = allFonts.filter((f) => {
    const nameMatch = f.font_name.toLowerCase().includes(searchFont.toLowerCase());
    const customerMatch =
      customerFilter === "__public__"
        ? !f.customer_id
        : customerFilter
        ? f.customer_id === customerFilter
        : true;
    return nameMatch && customerMatch;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${mins}`;
  };

  const startRename = (font: Font) => {
    setRenamingId(font.id);
    setRenameValue(font.font_name);
  };

  const saveRename = async (id: number) => {
    const newName = renameValue.trim();
    if (!newName) {
      setRenamingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/fonts/${id}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ font_name: newName }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchFonts();
      } else {
        setError(result.error || "Rename failed");
        await fetchFonts();
      }
    } catch {
      setError("Rename error");
      await fetchFonts();
    } finally {
      setRenamingId(null);
    }
  };

  const deleteFont = async (id: number) => {
    if (!confirm("Are you sure you want to delete this font?")) return;
    try {
      const res = await fetch(`/api/fonts/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        loadedFontsRef.current.delete(id);
        await fetchFonts();
      } else {
        setError(result.error || "Delete failed");
      }
    } catch {
      setError("Delete error");
    }
  };

  const glyphSections = [
    { label: "Uppercase (A-Z)", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
    { label: "Lowercase (a-z)", chars: "abcdefghijklmnopqrstuvwxyz" },
    { label: "Numbers (0-9)", chars: "0123456789" },
    { label: "Symbols", chars: "!@#$%^&*()_+-={}[]|\\:\";'<>?,./~`" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Font Family</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search font name..."
              value={searchFont}
              onChange={(e) => setSearchFont(e.target.value)}
              className="px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            >
              <option value="">All Customers</option>
              <option value="__public__">Public</option>
              {customers.map((c) => (
                <option key={c.id} value={c.customerId}>
                  {c.companyName}
                </option>
              ))}
            </select>
            <button
              onClick={fetchFonts}
              disabled={loading}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Loading..." : "Refresh List"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-[var(--destructive)]">
            {error}
          </div>
        )}

        <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] text-[var(--foreground)]/70">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Font Name</th>
                <th className="px-4 py-3 text-left font-semibold">Updated</th>
                <th className="px-4 py-3 text-left font-semibold">Preview</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredFonts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--foreground)]/50">
                    {loading ? "Loading..." : "No fonts found"}
                  </td>
                </tr>
              ) : (
                filteredFonts.map((f) => (
                  <tr key={f.id} className="hover:bg-[var(--muted)]/50">
                    <td className="px-4 py-3">{f.customer_name || "Public"}</td>
                    <td className="px-4 py-3">
                      {renamingId === f.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => saveRename(f.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename(f.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 border border-[var(--border)] rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium text-[var(--foreground)]">{f.font_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDate(f.created_at)}</td>
                    <td id={`font-preview-${f.id}`} className="px-4 py-3 text-lg">
                      Loading...
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setViewingFont(f)}
                          className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => startRename(f)}
                          className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => deleteFont(f.id)}
                          className="px-3 py-1.5 text-xs font-medium border border-red-200 text-[var(--destructive)] rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingFont && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setViewingFont(null)}
        >
          <div className="bg-white rounded-xl shadow-[var(--shadow-xl)] w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{viewingFont.font_name}</h3>
              <button
                onClick={() => setViewingFont(null)}
                className="text-[var(--foreground)]/50 hover:text-[var(--foreground)] text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="space-y-6">
              {glyphSections.map((section) => (
                <div key={section.label}>
                  <div className="text-sm font-medium text-[var(--foreground)]/70 mb-2">{section.label}</div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {section.chars.split("").map((ch) => {
                      const display = ch
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#39;");
                      return (
                        <div
                          key={ch}
                          className="border border-[var(--border)] rounded-lg p-2 text-center"
                        >
                          <div className="text-xs text-[var(--foreground)]/50 mb-1">{display}</div>
                          <div
                            className="text-xl"
                            style={{ fontFamily: `'${viewingFont.font_name}', sans-serif` }}
                          >
                            {display}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
