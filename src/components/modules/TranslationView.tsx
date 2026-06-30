"use client";

import { useEffect, useState, useCallback } from "react";

type Customer = {
  id: number;
  customerId: string;
  companyName: string;
};

type Translation = {
  id: number;
  table_name: string;
  customer_id: string | null;
  customer_name: string | null;
  updated_at: string;
};

type TranslationData = {
  headers: string[];
  rows: string[][];
};

export default function TranslationView() {
  const [allTranslations, setAllTranslations] = useState<Translation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchName, setSearchName] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<{ translation: Translation; data: TranslationData } | null>(null);
  const [columnFilters, setColumnFilters] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/translations");
      const result = await res.json();
      if (result.success) {
        setAllTranslations(result.translations);
      } else {
        setError(result.error || "Failed to load translations");
      }
    } catch {
      setError("Failed to load translations");
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
    fetchTranslations();
    fetchCustomers();
  }, [fetchTranslations, fetchCustomers]);

  useEffect(() => {
    if (viewing) {
      setColumnFilters(new Array(viewing.data.headers.length).fill(""));
      setSortColumn(-1);
      setSortDirection("asc");
    }
  }, [viewing]);

  const filteredTranslations = allTranslations.filter((t) => {
    const nameMatch = t.table_name.toLowerCase().includes(searchName.toLowerCase());
    const customerMatch =
      customerFilter === "__public__"
        ? !t.customer_id
        : customerFilter
        ? t.customer_id === customerFilter
        : true;
    return nameMatch && customerMatch;
  });

  const showViewModal = async (id: number) => {
    try {
      const res = await fetch(`/api/translations/${id}`);
      const result = await res.json();
      if (result.success) {
        setViewing({ translation: result.translation, data: result.translation.data });
      }
    } catch {
      setError("Failed to load translation table");
    }
  };

  const exportToExcel = (id: number) => {
    window.location.href = `/api/translations/${id}/export`;
  };

  const startRename = (t: Translation) => {
    setRenamingId(t.id);
    setRenameValue(t.table_name);
  };

  const saveRename = async (id: number) => {
    const newName = renameValue.trim();
    if (!newName) {
      setRenamingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/translations/${id}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: newName }),
      });
      const result = await res.json();
      if (result.success) {
        setAllTranslations(allTranslations.map((t) => (t.id === id ? { ...t, table_name: newName } : t)));
      } else {
        setError(result.error || "Failed to rename");
      }
    } catch {
      setError("Failed to rename");
    } finally {
      setRenamingId(null);
    }
  };

  const deleteTranslation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this translation table?")) return;
    try {
      const res = await fetch(`/api/translations/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setAllTranslations(allTranslations.filter((t) => t.id !== id));
      } else {
        setError(result.error || "Failed to delete");
      }
    } catch {
      setError("Failed to delete translation table");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const sortedRows = viewing
    ? [...viewing.data.rows].sort((a, b) => {
        if (sortColumn < 0) return 0;
        const aVal = (a[sortColumn] || "").toString().toLowerCase();
        const bVal = (b[sortColumn] || "").toString().toLowerCase();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  const filteredRows = sortedRows.filter((row) => {
    return columnFilters.every((filter, idx) => {
      if (!filter) return true;
      const cellText = (row[idx] || "").toString().toLowerCase();
      return cellText.includes(filter.toLowerCase());
    });
  });

  const sortModalTable = (colIdx: number) => {
    if (sortColumn === colIdx) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colIdx);
      setSortDirection("asc");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Translation Tables</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-[var(--destructive)]">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search table name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
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
        </div>

        <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] text-[var(--foreground)]/70">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Table Name</th>
                <th className="px-4 py-3 text-left font-semibold">Last Updated</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTranslations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--foreground)]/50">
                    {loading ? "Loading..." : "No translation tables found"}
                  </td>
                </tr>
              ) : (
                filteredTranslations.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--muted)]/50">
                    <td className="px-4 py-3">{t.customer_name || "Public"}</td>
                    <td className="px-4 py-3">
                      {renamingId === t.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => saveRename(t.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename(t.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 border border-[var(--border)] rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium text-[var(--foreground)]">{t.table_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDate(t.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => showViewModal(t.id)}
                          className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => startRename(t)}
                          className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => deleteTranslation(t.id)}
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

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setViewing(null)}
        >
          <div className="bg-white rounded-xl shadow-[var(--shadow-xl)] w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{viewing.translation.table_name}</h3>
              <button
                onClick={() => setViewing(null)}
                className="text-[var(--foreground)]/50 hover:text-[var(--foreground)] text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4 flex flex-col flex-1 min-h-0">
              <div className="mb-4">
                <button
                  onClick={() => exportToExcel(viewing.translation.id)}
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors cursor-pointer"
                >
                  Export to Excel
                </button>
              </div>
              <div className="overflow-auto flex-1 border border-[var(--border)] rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[var(--muted)] text-[var(--foreground)]/70">
                    <tr>
                      {viewing.data.headers.map((h, idx) => (
                        <th key={idx} className="px-3 py-2 text-left font-semibold min-w-[140px]">
                          <div
                            onClick={() => sortModalTable(idx)}
                            className="cursor-pointer select-none flex items-center gap-1"
                          >
                            {h}
                            {sortColumn === idx && (sortDirection === "asc" ? " ↑" : " ↓")}
                          </div>
                          <input
                            type="text"
                            placeholder="Search..."
                            value={columnFilters[idx] || ""}
                            onChange={(e) => {
                              const next = [...columnFilters];
                              next[idx] = e.target.value;
                              setColumnFilters(next);
                            }}
                            className="mt-1 w-full px-2 py-1 border border-[var(--border)] rounded text-xs bg-white"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredRows.map((row, ridx) => (
                      <tr key={ridx}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
