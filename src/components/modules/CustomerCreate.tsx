"use client";

import { useState } from "react";

type MemberInput = {
  name: string;
  title: string;
  emailPrefix: string;
  phone: string;
};

export default function CustomerCreate() {
  const [activeTab, setActiveTab] = useState<"company" | "member">("company");
  const [companyName, setCompanyName] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberInput[]>([]);
  const [memberName, setMemberName] = useState("");
  const [memberTitle, setMemberTitle] = useState("");
  const [memberEmailPrefix, setMemberEmailPrefix] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fullEmail = memberEmailPrefix && emailDomain ? `${memberEmailPrefix}@${emailDomain}` : "";

  const resetCompany = () => {
    setCompanyName("");
    setEmailDomain("");
    setCompanyType("");
    setAddress("");
    setNotes("");
    setCustomerId(null);
    setMembers([]);
    setActiveTab("company");
    setMessage("");
  };

  const resetMember = () => {
    setMemberName("");
    setMemberTitle("");
    setMemberEmailPrefix("");
    setMemberPhone("");
  };

  const fillDummyCompany = () => {
    setCompanyName("Acme Garment Ltd.");
    setEmailDomain("acmegarment.com");
    setCompanyType("buyer");
    setAddress("123 Factory Road, Hong Kong");
    setNotes("Key buyer for wash care labels");
  };

  const fillDummyMember = () => {
    setMemberName("John Doe");
    setMemberTitle("Merchandiser");
    setMemberEmailPrefix("john.doe");
    setMemberPhone("+852 1234 5678");
  };

  const saveCompany = async () => {
    if (!companyName.trim()) {
      setMessage("Company name is required");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          emailDomain,
          companyType,
          address,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save company");
      const data = await res.json();
      setCustomerId(data.id);
      setMessage("Company saved. Now add members.");
      setActiveTab("member");
    } catch {
      setMessage("Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!customerId) return;
    if (!memberName.trim()) {
      setMessage("Member name is required");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/customers/${customerId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: memberName,
          title: memberTitle,
          email: fullEmail,
          phone: memberPhone,
        }),
      });
      if (!res.ok) throw new Error("Failed to add member");
      setMembers([
        ...members,
        {
          name: memberName,
          title: memberTitle,
          emailPrefix: memberEmailPrefix,
          phone: memberPhone,
        },
      ]);
      resetMember();
      setMessage("Member added.");
    } catch {
      setMessage("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const finishAndNew = () => {
    resetCompany();
    setMessage("Customer created. Start a new one.");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10">
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Create Customer</h2>

        <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab("company")}
            disabled={!customerId && activeTab === "member"}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === "company"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
            }`}
          >
            Company
          </button>
          <button
            onClick={() => setActiveTab("member")}
            disabled={!customerId}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === "member"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
            } ${!customerId ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            Member
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg text-sm text-[var(--primary)]">
            {message}
          </div>
        )}

        {activeTab === "company" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={fillDummyCompany}
                className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Dummy Fill
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Email Domain</label>
              <input
                type="text"
                value={emailDomain}
                placeholder="example.com"
                onChange={(e) => setEmailDomain(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Type</label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              >
                <option value="">Select type...</option>
                <option value="buyer">Buyer</option>
                <option value="agent">Agent</option>
                <option value="factory">Factory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={saveCompany}
                disabled={loading}
                className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "Saving..." : "Save & Continue"}
              </button>
              <button
                onClick={resetCompany}
                className="px-5 py-2 border border-[var(--border)] text-[var(--foreground)]/70 rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {activeTab === "member" && (
          <div className="space-y-4">
            {members.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[var(--foreground)]/80 mb-2">Added Members</h3>
                <div className="space-y-2">
                  {members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg text-sm"
                    >
                      <div>
                        <span className="font-medium text-[var(--foreground)]">{m.name}</span>
                        {m.title && <span className="text-[var(--foreground)]/60 ml-2">({m.title})</span>}
                        {m.emailPrefix && emailDomain && (
                          <span className="text-[var(--foreground)]/50 ml-2">{m.emailPrefix}@{emailDomain}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Name</label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Title</label>
              <input
                type="text"
                value={memberTitle}
                placeholder="e.g., Manager, Director"
                onChange={(e) => setMemberTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Email Prefix</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={memberEmailPrefix}
                  placeholder="john.doe"
                  onChange={(e) => setMemberEmailPrefix(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                />
                <span className="text-[var(--foreground)]/60">@</span>
                <span className="text-sm text-[var(--foreground)]/70 min-w-[120px]">{emailDomain || "example.com"}</span>
              </div>
              <p className="text-xs text-[var(--foreground)]/50 mt-1">Full email: {fullEmail || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">Phone</label>
              <input
                type="tel"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-white text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={fillDummyMember}
                className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)]/70 rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Dummy Fill
              </button>
              <button
                onClick={addMember}
                disabled={loading}
                className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "Adding..." : "Add Member"}
              </button>
              <button
                onClick={resetMember}
                className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)]/70 rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={finishAndNew}
                className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)]/70 rounded-lg text-sm font-medium hover:bg-[var(--muted)] transition-colors cursor-pointer"
              >
                Finish & New Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
